from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
import threading
import signal
import os
import json
import atexit
from concurrent.futures import ThreadPoolExecutor
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
cors = CORS(app)

# Constants
DATA_FILE = 'tracking_data.json'
WINNERS_FILE = 'winners_data.json'
MAX_WORKERS = 10  # Maximum number of concurrent tracking threads
POLL_INTERVAL = 10  # seconds between API polls (increased to reduce load)
API_TIMEOUT = 5  # seconds for API request timeout

# Create a thread pool executor
executor = ThreadPoolExecutor(max_workers=MAX_WORKERS)

# Dictionary to store active tracking information
active_tracking = {}
# Dictionary to track futures for each tracking job
tracking_futures = {}
# List to store winners information
winners_list = []

# Flag to indicate shutdown in progress
shutdown_in_progress = False

def load_data():
    """Load tracking and winners data from disk if available."""
    global active_tracking, winners_list
    
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r') as f:
                active_tracking = json.load(f)
            logger.info(f"Loaded {len(active_tracking)} tracking records from {DATA_FILE}")
    except Exception as e:
        logger.error(f"Error loading tracking data: {str(e)}")
    
    try:
        if os.path.exists(WINNERS_FILE):
            with open(WINNERS_FILE, 'r') as f:
                winners_list = json.load(f)
            logger.info(f"Loaded {len(winners_list)} winners from {WINNERS_FILE}")
    except Exception as e:
        logger.error(f"Error loading winners data: {str(e)}")

def save_data():
    """Save tracking and winners data to disk."""
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(active_tracking, f)
        logger.info(f"Saved {len(active_tracking)} tracking records to {DATA_FILE}")
        
        with open(WINNERS_FILE, 'w') as f:
            json.dump(winners_list, f)
        logger.info(f"Saved {len(winners_list)} winners to {WINNERS_FILE}")
    except Exception as e:
        logger.error(f"Error saving data: {str(e)}")

def check_problem_solution(handle1, handle2, problem_id, tracking_id):
    """
    Poll Codeforces API to check which user solves a problem first.
    Only checks the latest submission from each user.
    
    Args:
        handle1 (str): First Codeforces handle
        handle2 (str): Second Codeforces handle
        problem_id (str): Problem ID in format "contestId/index" (e.g. "1800/A")
        tracking_id (str): Unique tracking identifier
    
    Returns:
        dict: Result containing winner and timing information
    """
    global shutdown_in_progress
    
    try:
        contest_id, problem_index = problem_id.split("/")
        
        # Store the initial status
        handle1_solved = False
        handle2_solved = False
        handle1_time = None
        handle2_time = None
        
        poll_count = 0
        max_polls = 720  # 2 hours of polling at 10-second intervals
        
        while not shutdown_in_progress and poll_count < max_polls:
            poll_count += 1
            
            # Check if this tracking has been cancelled
            if tracking_id not in active_tracking:
                logger.info(f"Tracking {tracking_id} was cancelled")
                return None
            
            # Check first handle
            if not handle1_solved:
                try:
                    url1 = f"https://codeforces.com/api/user.status?handle={handle1}&count=5"
                    response1 = requests.get(url1, timeout=API_TIMEOUT)
                    data1 = response1.json()
                    
                    if data1["status"] == "OK" and data1["result"]:
                        # Check the last 5 submissions for a match
                        for submission in data1["result"]:
                            if (str(submission["problem"].get("contestId")) == contest_id and 
                                submission["problem"].get("index") == problem_index and 
                                submission["verdict"] == "OK"):
                                handle1_solved = True
                                handle1_time = submission["creationTimeSeconds"]
                                break
                except Exception as e:
                    logger.warning(f"Error checking {handle1}: {str(e)}")
            
            # Check second handle
            if not handle2_solved:
                try:
                    url2 = f"https://codeforces.com/api/user.status?handle={handle2}&count=5"
                    response2 = requests.get(url2, timeout=API_TIMEOUT)
                    data2 = response2.json()
                    
                    if data2["status"] == "OK" and data2["result"]:
                        # Check the last 5 submissions for a match
                        for submission in data2["result"]:
                            if (str(submission["problem"].get("contestId")) == contest_id and 
                                submission["problem"].get("index") == problem_index and 
                                submission["verdict"] == "OK"):
                                handle2_solved = True
                                handle2_time = submission["creationTimeSeconds"]
                                break
                except Exception as e:
                    logger.warning(f"Error checking {handle2}: {str(e)}")
            
            # Check if we have a winner
            if handle1_solved and handle2_solved:
                # Both solved, compare times
                if handle1_time < handle2_time:
                    result = {
                        "winner": handle1,
                        "loser": handle2,
                        "winner_time": handle1_time,
                        "loser_time": handle2_time,
                        "time_difference": handle2_time - handle1_time,
                        "status": "both_solved",
                        "match_id": tracking_id
                    }
                    # Add winner to the winners list
                    winner_entry = {"match_id": tracking_id, "winner": handle1}
                    if winner_entry not in winners_list:
                        winners_list.append(winner_entry)
                else:
                    result = {
                        "winner": handle2,
                        "loser": handle1,
                        "winner_time": handle2_time,
                        "loser_time": handle1_time,
                        "time_difference": handle1_time - handle2_time,
                        "status": "both_solved",
                        "match_id": tracking_id
                    }
                    # Add winner to the winners list
                    winner_entry = {"match_id": tracking_id, "winner": handle2}
                    if winner_entry not in winners_list:
                        winners_list.append(winner_entry)
                
                active_tracking[tracking_id] = result
                save_data()  # Save to disk when we have a winner
                return result
            elif handle1_solved:
                result = {
                    "winner": handle1,
                    "loser": handle2,
                    "winner_time": handle1_time,
                    "loser_time": None,
                    "status": "one_solved",
                    "message": f"{handle2} has not solved the problem yet",
                    "match_id": tracking_id
                }
                # Add winner to the winners list
                winner_entry = {"match_id": tracking_id, "winner": handle1}
                if winner_entry not in winners_list:
                    winners_list.append(winner_entry)
                
                active_tracking[tracking_id] = result
                save_data()  # Save to disk when we have a winner
                return result
            elif handle2_solved:
                result = {
                    "winner": handle2,
                    "loser": handle1,
                    "winner_time": handle2_time,
                    "loser_time": None,
                    "status": "one_solved",
                    "message": f"{handle1} has not solved the problem yet",
                    "match_id": tracking_id
                }
                # Add winner to the winners list
                winner_entry = {"match_id": tracking_id, "winner": handle2}
                if winner_entry not in winners_list:
                    winners_list.append(winner_entry)
                
                active_tracking[tracking_id] = result
                save_data()  # Save to disk when we have a winner
                return result
            
            # Update tracking status with last poll time
            current_time = int(time.time())
            if tracking_id in active_tracking and isinstance(active_tracking[tracking_id], dict):
                active_tracking[tracking_id]["last_poll"] = current_time
                # Periodically save tracking status to disk (every 50 polls)
                if poll_count % 50 == 0:
                    save_data()
            
            # Wait before polling again
            time.sleep(POLL_INTERVAL)
        
        # If we reach max polls without a winner
        if poll_count >= max_polls:
            result = {
                "status": "timeout",
                "message": "Tracking exceeded maximum time limit (2 hours)",
                "match_id": tracking_id
            }
            active_tracking[tracking_id] = result
            save_data()
            return result
            
    except Exception as e:
        logger.error(f"Error in tracking thread for {tracking_id}: {str(e)}")
        result = {
            "error": str(e),
            "status": "error",
            "message": f"An error occurred while tracking: {str(e)}",
            "match_id": tracking_id
        }
        active_tracking[tracking_id] = result
        save_data()
        return result

@app.route('/start_tracking', methods=['POST'])
def start_tracking():
    try:
        data = request.json
        handle1 = data.get('handle1')
        handle2 = data.get('handle2')
        problem_id = data.get('problem_id')
        match_id = data.get('match_id')  # Get the match_id from request
        
        if not handle1 or not handle2 or not problem_id or not match_id:
            return jsonify({"error": "Missing required parameters", "status": "error"}), 400
        
        # Use the provided match ID as the tracking ID
        tracking_id = match_id
        
        # Check if this tracking ID is already in use
        if tracking_id in active_tracking:
            return jsonify({
                "error": "Match ID already in use", 
                "status": "error",
                "message": "This match ID is already being used for tracking"
            }), 400
        
        # Check if we're at capacity
        if len(tracking_futures) >= MAX_WORKERS:
            return jsonify({
                "error": "Server at capacity", 
                "status": "error",
                "message": f"Maximum number of concurrent tracking jobs ({MAX_WORKERS}) already running"
            }), 503
        
        # Start tracking with the thread pool
        future = executor.submit(check_problem_solution, handle1, handle2, problem_id, tracking_id)
        tracking_futures[tracking_id] = future
        
        # Store initial tracking status
        active_tracking[tracking_id] = {
            "status": "tracking",
            "handle1": handle1,
            "handle2": handle2,
            "problem_id": problem_id,
            "match_id": match_id,
            "start_time": int(time.time())
        }
        
        # Save to disk
        save_data()
        
        logger.info(f"Started tracking {tracking_id}: {handle1} vs {handle2} for problem {problem_id}")
        
        return jsonify({
            "tracking_id": tracking_id,
            "match_id": match_id,
            "status": "started",
            "message": f"Now tracking {handle1} vs {handle2} for problem {problem_id}"
        })
    except Exception as e:
        logger.error(f"Error starting tracking: {str(e)}")
        return jsonify({
            "error": str(e),
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500

@app.route('/check_status/<tracking_id>', methods=['GET'])
def check_status(tracking_id):
    try:
        if tracking_id not in active_tracking:
            return jsonify({"error": "Invalid tracking ID", "status": "error"}), 404
        
        result = active_tracking[tracking_id]
        # Make sure match_id is included in the response
        if isinstance(result, dict) and "match_id" not in result:
            result["match_id"] = tracking_id
            
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error checking status: {str(e)}")
        return jsonify({
            "error": str(e), 
            "status": "error",
            "message": f"An error occurred while checking status: {str(e)}"
        }), 500

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "alive",
        "active_tracking_count": len(active_tracking),
        "active_threads": len(tracking_futures)
    })

@app.route('/stop_tracking', methods=['POST'])
def stop_tracking():
    try:
        data = request.json
        tracking_ids = data.get('tracking_ids', [])
        
        if not tracking_ids or not isinstance(tracking_ids, list):
            return jsonify({"error": "Missing or invalid tracking_ids parameter", "status": "error"}), 400
        
        results = {}
        for tracking_id in tracking_ids:
            # Check if tracking exists
            if tracking_id in active_tracking:
                status = active_tracking[tracking_id]
                
                # Make sure match_id is included
                if isinstance(status, dict) and "match_id" not in status:
                    status["match_id"] = tracking_id
                
                # Check if a winner has been decided (match completed)
                if isinstance(status, dict) and status.get("status") in ["both_solved", "one_solved"]:
                    # Winner is already decided, no need to stop tracking
                    results[tracking_id] = {
                        "stopped": False,
                        "already_complete": True,
                        "result": status,
                        "match_id": tracking_id
                    }
                # Only stop tracking if there's no winner yet
                elif tracking_id in tracking_futures:
                    # Check if winner exists in the status
                    if isinstance(status, dict) and "winner" in status:
                        # Winner already determined, don't stop
                        results[tracking_id] = {
                            "stopped": False,
                            "already_complete": True,
                            "result": status,
                            "match_id": tracking_id
                        }
                    else:
                        # No winner yet, stop the tracking
                        future = tracking_futures[tracking_id]
                        cancelled = future.cancel()
                        
                        if cancelled:
                            # Successfully cancelled
                            del tracking_futures[tracking_id]
                            # Update status to stopped
                            active_tracking[tracking_id]["status"] = "stopped"
                            active_tracking[tracking_id]["stopped_at"] = int(time.time())
                            save_data()
                            
                            results[tracking_id] = {
                                "stopped": True,
                                "result": active_tracking[tracking_id],
                                "match_id": tracking_id
                            }
                        else:
                            # Could not cancel, likely already running or done
                            results[tracking_id] = {
                                "stopped": False,
                                "message": "Could not cancel tracking, already running or completed",
                                "result": active_tracking[tracking_id],
                                "match_id": tracking_id
                            }
                else:
                    results[tracking_id] = {
                        "stopped": False,
                        "error": "Thread not found but tracking exists",
                        "match_id": tracking_id
                    }
            else:
                results[tracking_id] = {
                    "stopped": False,
                    "error": "Tracking ID not found",
                    "match_id": tracking_id
                }
        
        return jsonify({
            "status": "success",
            "results": results
        })
    except Exception as e:
        logger.error(f"Error stopping tracking: {str(e)}")
        return jsonify({
            "error": str(e),
            "status": "error",
            "message": f"An error occurred while stopping tracking: {str(e)}"
        }), 500

@app.route('/list_tracking', methods=['GET'])
def list_tracking():
    try:
        tracking_info = {}
        for track_id, status in active_tracking.items():
            # Make a copy of the status to avoid modifying the original
            info = status.copy() if isinstance(status, dict) else {"status": status}
            
            # Ensure match_id is included
            if "match_id" not in info:
                info["match_id"] = track_id
            
            # Only include active tracking (not stopped or completed)
            if not isinstance(info, dict) or info.get("status") not in ["stopped", "both_solved", "one_solved", "error", "timeout"]:
                tracking_info[track_id] = info
        
        return jsonify(tracking_info)
    except Exception as e:
        logger.error(f"Error listing tracking: {str(e)}")
        return jsonify({
            "error": str(e),
            "status": "error",
            "message": f"An error occurred while listing tracking: {str(e)}"
        }), 500

@app.route('/all_tracking_history', methods=['GET'])
def all_tracking_history():
    """Get all tracking history, including stopped and completed items"""
    try:
        return jsonify(active_tracking)
    except Exception as e:
        logger.error(f"Error getting tracking history: {str(e)}")
        return jsonify({
            "error": str(e),
            "status": "error",
            "message": f"An error occurred while getting tracking history: {str(e)}"
        }), 500

@app.route('/matches_completed', methods=['GET'])
def matches_completed():
    """
    Returns an array of IDs for all completed matches.
    A match is considered completed if it has a status of "both_solved" or "one_solved".
    """
    try:
        completed_matches = []
        
        for match_id, status in active_tracking.items():
            # Check if the status is a dictionary and has a 'status' field
            if isinstance(status, dict) and status.get("status") in ["both_solved", "one_solved"]:
                completed_matches.append(match_id)
        
        return jsonify({
            "status": "success",
            "matches_completed": completed_matches
        })
    except Exception as e:
        logger.error(f"Error retrieving completed matches: {str(e)}")
        return jsonify({
            "error": str(e),
            "status": "error",
            "message": f"An error occurred while retrieving completed matches: {str(e)}"
        }), 500

@app.route('/winners', methods=['GET'])
def get_winners():
    """
    Returns an array of all winners.
    Each entry contains the match_id and winner handle.
    """
    try:
        return jsonify({
            "status": "success",
            "winners": winners_list
        })
    except Exception as e:
        logger.error(f"Error retrieving winners list: {str(e)}")
        return jsonify({
            "error": str(e),
            "status": "error",
            "message": f"An error occurred while retrieving winners list: {str(e)}"
        }), 500

@app.route('/cleanup_old_tracking', methods=['POST'])
def cleanup_old_tracking():
    """
    Cleans up old tracking records to prevent memory build-up.
    Keeps only recent or active tracking records.
    """
    try:
        data = request.json
        days_threshold = data.get('days', 7)  # Default to keeping 7 days of data
        
        current_time = int(time.time())
        threshold_time = current_time - (days_threshold * 86400)  # seconds in a day
        
        removed_count = 0
        to_remove = []
        
        for tracking_id, status in active_tracking.items():
            # Skip if not a dictionary or missing required fields
            if not isinstance(status, dict):
                continue
                
            # Keep all active tracking
            if status.get("status") == "tracking":
                continue
                
            # Check if it's an old completed or stopped tracking
            if (status.get("status") in ["both_solved", "one_solved", "stopped", "error", "timeout"] and
                (status.get("winner_time", 0) < threshold_time or  # Old by winner time
                 status.get("stopped_at", 0) < threshold_time or   # Old by stop time
                 status.get("last_poll", 0) < threshold_time)):    # Old by last poll
                to_remove.append(tracking_id)
        
        # Remove old records
        for tracking_id in to_remove:
            if tracking_id in tracking_futures:
                # Try to cancel if still running
                tracking_futures[tracking_id].cancel()
                del tracking_futures[tracking_id]
            
            del active_tracking[tracking_id]
            removed_count += 1
        
        # Save updated data
        save_data()
        
        return jsonify({
            "status": "success",
            "removed_count": removed_count,
            "remaining_count": len(active_tracking)
        })
    except Exception as e:
        logger.error(f"Error during cleanup: {str(e)}")
        return jsonify({
            "error": str(e),
            "status": "error",
            "message": f"An error occurred during cleanup: {str(e)}"
        }), 500

def graceful_shutdown(signum, frame):
    """Handle termination signals gracefully"""
    global shutdown_in_progress
    
    logger.info(f"Received signal {signum}, shutting down gracefully...")
    shutdown_in_progress = True
    
    # Save current state
    save_data()
    
    # Cancel all running futures
    for tracking_id, future in list(tracking_futures.items()):
        future.cancel()
    
    # Shutdown the executor
    executor.shutdown(wait=False)
    
    logger.info("Graceful shutdown completed")

# Register signal handlers
signal.signal(signal.SIGTERM, graceful_shutdown)
signal.signal(signal.SIGINT, graceful_shutdown)

# Register functions to run at exit
atexit.register(save_data)
atexit.register(lambda: executor.shutdown(wait=False))

# Load data on startup
load_data()

if __name__ == '__main__':
    
    app.run()