from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
import threading
import pika
import json
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
cors=CORS(app)

# RabbitMQ Configuration
CLOUDAMQP_URL = os.getenv('CLOUDAMQP_URL')
QUEUE_NAME = 'winners'

def publish_to_rabbitmq(winner_data):
    """Publish winner data to RabbitMQ"""
    try:
        # Parse AMQP URL and create connection parameters
        parameters = pika.URLParameters(CLOUDAMQP_URL)
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        
        # Declare queue
        channel.queue_declare(queue=QUEUE_NAME, durable=True)
        
        # Publish message
        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_NAME,
            body=json.dumps(winner_data),
            properties=pika.BasicProperties(
                delivery_mode=2  # make message persistent
            )
        )
        
        connection.close()
    except Exception as e:
        print(f"Error publishing to RabbitMQ: {str(e)}")

# Dictionary to store active tracking threads, not just results
tracking_threads = {}
active_tracking = {}

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
                    url1 = f"https://codeforces.com/api/user.status?handle={handle1}&count=1"  # Only get the latest submission
                    response1 = requests.get(url1)
                    data1 = response1.json()
                    
                    if data1["status"] == "OK" and data1["result"]:
                        submission = data1["result"][0]  # Get the latest submission
                        if (str(submission["problem"].get("contestId")) == contest_id and 
                            submission["problem"].get("index") == problem_index and 
                            submission["verdict"] == "OK"):
                            handle1_solved = True
                            handle1_time = submission["creationTimeSeconds"]
                except Exception as e:
                    print(f"Error checking {handle1}: {str(e)}")
            
            # Check second handle
            if not handle2_solved:
                try:
                    url2 = f"https://codeforces.com/api/user.status?handle={handle2}&count=1"  # Only get the latest submission
                    response2 = requests.get(url2)
                    data2 = response2.json()
                    
                    if data2["status"] == "OK" and data2["result"]:
                        submission = data2["result"][0]  # Get the latest submission
                        if (str(submission["problem"].get("contestId")) == contest_id and 
                            submission["problem"].get("index") == problem_index and 
                            submission["verdict"] == "OK"):
                            handle2_solved = True
                            handle2_time = submission["creationTimeSeconds"]
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
                        "status": "both_solved",
                        "match_id": tracking_id
                    }
                    # Publish winner to RabbitMQ
                    publish_to_rabbitmq({"match_id": tracking_id, "winner": handle1})
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
                    # Publish winner to RabbitMQ
                    publish_to_rabbitmq({"match_id": tracking_id, "winner": handle2})
                
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
                    "message": f"{handle2} has not solved the problem yet",
                    "match_id": tracking_id
                }
                # Publish winner to RabbitMQ
                publish_to_rabbitmq({"match_id": tracking_id, "winner": handle1})
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
                    "message": f"{handle1} has not solved the problem yet",
                    "match_id": tracking_id
                }
                # Publish winner to RabbitMQ
                publish_to_rabbitmq({"match_id": tracking_id, "winner": handle2})
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
            "message": f"An error occurred while tracking: {str(e)}",
            "match_id": tracking_id
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
        
        # Start tracking in a separate thread
        def tracking_thread():
            try:
                check_problem_solution(handle1, handle2, problem_id, tracking_id)
            except Exception as e:
                active_tracking[tracking_id] = {
                    "error": str(e),
                    "status": "error",
                    "message": f"An error occurred in tracking thread: {str(e)}",
                    "match_id": match_id
                }
        
        thread = threading.Thread(target=tracking_thread)
        thread.daemon = True
        thread.start()
        
        active_tracking[tracking_id] = {
            "status": "tracking",
            "handle1": handle1,
            "handle2": handle2,
            "problem_id": problem_id,
            "match_id": match_id
        }
        
        return jsonify({
            "tracking_id": tracking_id,
            "match_id": match_id,
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
        
        result = active_tracking[tracking_id]
        # Make sure match_id is included in the response
        if isinstance(result, dict) and "match_id" not in result:
            result["match_id"] = tracking_id
            
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "error": str(e), 
            "status": "error",
            "message": f"An error occurred while checking status: {str(e)}"
        }), 500
    

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status":"alive"
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
                elif tracking_id in tracking_threads:
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
                        # No winner yet, don't stop the tracking
                        results[tracking_id] = {
                            "stopped": False,
                            "still_tracking": True,
                            "result": status,
                            "match_id": tracking_id,
                            "message": "Tracking continues until winner is decided"
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
            if not isinstance(info, dict) or info.get("status") not in ["stopped", "both_solved", "one_solved", "error"]:
                tracking_info[track_id] = info
        
        return jsonify(tracking_info)
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error",
            "message": f"An error occurred while listing tracking: {str(e)}"
        }), 500

@app.route('/all_tracking_history', methods=['GET'])
def all_tracking_history():
    """New route to get all tracking history, including stopped and completed items"""
    try:
        return jsonify(active_tracking)
    except Exception as e:
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
        return jsonify({
            "error": str(e),
            "status": "error",
            "message": f"An error occurred while retrieving completed matches: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run()