from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
import threading

app = Flask(__name__)
cors=CORS(app)

# Dictionary to store active tracking threads, not just results
tracking_threads = {}
active_tracking = {}

def check_problem_solution(handle1, handle2, problem_id, tracking_id):
    """
    Poll Codeforces API to check which user solves a problem first.
    
    Args:
        handle1 (str): First Codeforces handle
        handle2 (str): Second Codeforces handle
        problem_id (str): Problem ID in format "contestId/index" (e.g. "1800/A")
        tracking_id (str): Unique tracking identifier
    
    Returns:
        dict: Result containing winner and timing information
    """
    try:
        contest_id, problem_index = problem_id.split("/")
        
        # Store the initial status
        handle1_solved = False
        handle2_solved = False
        handle1_time = None
        handle2_time = None
        
        poll_interval = 5  # seconds
        
        # Track if this thread should stop
        should_stop = threading.Event()
        tracking_threads[tracking_id] = should_stop
        
        while not should_stop.is_set():
            # Check first handle
            if not handle1_solved:
                try:
                    url1 = f"https://codeforces.com/api/user.status?handle={handle1}"
                    response1 = requests.get(url1)
                    data1 = response1.json()
                    
                    if data1["status"] == "OK":
                        submissions = data1["result"]
                        for submission in submissions:
                            if (str(submission["problem"].get("contestId")) == contest_id and 
                                submission["problem"].get("index") == problem_index and 
                                submission["verdict"] == "OK"):
                                handle1_solved = True
                                handle1_time = submission["creationTimeSeconds"]
                                break
                except Exception as e:
                    print(f"Error checking {handle1}: {str(e)}")
            
            # Check second handle
            if not handle2_solved:
                try:
                    url2 = f"https://codeforces.com/api/user.status?handle={handle2}"
                    response2 = requests.get(url2)
                    data2 = response2.json()
                    
                    if data2["status"] == "OK":
                        submissions = data2["result"]
                        for submission in submissions:
                            if (str(submission["problem"].get("contestId")) == contest_id and 
                                submission["problem"].get("index") == problem_index and 
                                submission["verdict"] == "OK"):
                                handle2_solved = True
                                handle2_time = submission["creationTimeSeconds"]
                                break
                except Exception as e:
                    print(f"Error checking {handle2}: {str(e)}")
            
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
                        "status": "both_solved"
                    }
                else:
                    result = {
                        "winner": handle2,
                        "loser": handle1,
                        "winner_time": handle2_time,
                        "loser_time": handle1_time,
                        "time_difference": handle1_time - handle2_time,
                        "status": "both_solved"
                    }
                active_tracking[tracking_id] = result
                # Clean up
                if tracking_id in tracking_threads:
                    del tracking_threads[tracking_id]
                return result
            elif handle1_solved:
                result = {
                    "winner": handle1,
                    "loser": handle2,
                    "winner_time": handle1_time,
                    "loser_time": None,
                    "status": "one_solved",
                    "message": f"{handle2} has not solved the problem yet"
                }
                active_tracking[tracking_id] = result
                # Clean up
                if tracking_id in tracking_threads:
                    del tracking_threads[tracking_id]
                return result
            elif handle2_solved:
                result = {
                    "winner": handle2,
                    "loser": handle1,
                    "winner_time": handle2_time,
                    "loser_time": None,
                    "status": "one_solved",
                    "message": f"{handle1} has not solved the problem yet"
                }
                active_tracking[tracking_id] = result
                # Clean up
                if tracking_id in tracking_threads:
                    del tracking_threads[tracking_id]
                return result
            
            # Wait before polling again
            time.sleep(poll_interval)
    except Exception as e:
        result = {
            "error": str(e),
            "status": "error",
            "message": f"An error occurred while tracking: {str(e)}"
        }
        active_tracking[tracking_id] = result
        # Clean up
        if tracking_id in tracking_threads:
            del tracking_threads[tracking_id]
        return result

@app.route('/start_tracking', methods=['POST'])
def start_tracking():
    try:
        data = request.json
        handle1 = data.get('handle1')
        handle2 = data.get('handle2')
        problem_id = data.get('problem_id')
        
        if not handle1 or not handle2 or not problem_id:
            return jsonify({"error": "Missing required parameters", "status": "error"}), 400
        
        # Create a unique tracking ID
        tracking_id = f"{handle1}_{handle2}_{problem_id}_{int(time.time())}"
        
        # Start tracking in a separate thread
        def tracking_thread():
            try:
                check_problem_solution(handle1, handle2, problem_id, tracking_id)
            except Exception as e:
                active_tracking[tracking_id] = {
                    "error": str(e),
                    "status": "error",
                    "message": f"An error occurred in tracking thread: {str(e)}"
                }
        
        thread = threading.Thread(target=tracking_thread)
        thread.daemon = True
        thread.start()
        
        active_tracking[tracking_id] = {"status": "tracking"}
        
        return jsonify({
            "tracking_id": tracking_id,
            "status": "started",
            "message": f"Now tracking {handle1} vs {handle2} for problem {problem_id}"
        })
    except Exception as e:
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
        
        return jsonify(active_tracking[tracking_id])
    except Exception as e:
        return jsonify({
            "error": str(e), 
            "status": "error",
            "message": f"An error occurred while checking status: {str(e)}"
        }), 500

@app.route('/stop_tracking', methods=['POST'])
def stop_tracking():
    try:
        data = request.json
        tracking_ids = data.get('tracking_ids', [])
        
        if not tracking_ids or not isinstance(tracking_ids, list):
            return jsonify({"error": "Missing or invalid tracking_ids parameter", "status": "error"}), 400
        
        results = {}
        for tracking_id in tracking_ids:
            # Check if tracking exists and has a result
            if tracking_id in active_tracking:
                status = active_tracking[tracking_id]
                
                # Check if it's already complete
                if isinstance(status, dict) and status.get("status") in ["both_solved", "one_solved", "error"]:
                    results[tracking_id] = {
                        "stopped": False,
                        "already_complete": True,
                        "result": status
                    }
                # If still tracking, stop the thread
                elif tracking_id in tracking_threads:
                    tracking_threads[tracking_id].set()  # Signal the thread to stop
                    results[tracking_id] = {
                        "stopped": True,
                        "result": active_tracking[tracking_id]
                    }
                    # Clean up
                    del tracking_threads[tracking_id]
                else:
                    results[tracking_id] = {
                        "stopped": False,
                        "error": "Thread not found but tracking exists"
                    }
            else:
                results[tracking_id] = {
                    "stopped": False,
                    "error": "Tracking ID not found"
                }
        
        return jsonify({
            "status": "success",
            "results": results
        })
    except Exception as e:
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
            if isinstance(status, dict) and "status" in status and status["status"] == "tracking":
                parts = track_id.split('_')
                if len(parts) >= 3:
                    tracking_info[track_id] = {
                        "handle1": parts[0],
                        "handle2": parts[1],
                        "problem_id": parts[2],
                        "status": "tracking"
                    }
            else:
                tracking_info[track_id] = status
        
        return jsonify(tracking_info)
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error",
            "message": f"An error occurred while listing tracking: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(debug=True)