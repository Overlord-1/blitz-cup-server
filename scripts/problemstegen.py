import requests
import random
import csv
import time
import sys
import argparse
from collections import Counter

def fetch_all_problems():
    """Fetch all problems from Codeforces API"""
    print("Fetching problems from Codeforces API...")
    try:
        response = requests.get("https://codeforces.com/api/problemset.problems")
        if response.status_code == 200:
            data = response.json()
            if data['status'] == 'OK':
                return data['result']['problems']
            else:
                print(f"API Error: {data['status']}")
                return []
        else:
            print(f"HTTP Error: {response.status_code}")
            return []
    except Exception as e:
        print(f"Error fetching problems: {e}")
        return []

def is_special_problem(problem):
    """Check if a problem is special based on various indicators"""
    # Check for special tags
    special_tags = ['*special', 'special', 'experimental']
    for tag in problem.get('tags', []):
        if any(special_word in tag.lower() for special_word in special_tags):
            return True
    
    # Check for special problem index (like 'A1', 'B2', etc.)
    if problem.get('index', '') and len(problem.get('index', '')) > 1:
        if problem['index'][0].isalpha() and problem['index'][1:].isdigit():
            return True
    
    # Check for special problem name indicators
    special_keywords = ['special', 'experimental', 'interactive', 'bonus']
    if any(keyword in problem.get('name', '').lower() for keyword in special_keywords):
        return True
    
    return False

def filter_problems_by_rating(problems, min_rating, max_rating):
    """Filter problems by rating range and exclude special problems"""
    return [p for p in problems if 'rating' in p and 
            min_rating <= p['rating'] <= max_rating and
            not is_special_problem(p)]

def get_problem_link(problem):
    """Generate a link to the problem on Codeforces"""
    return f"https://codeforces.com/problemset/problem/{problem['contestId']}/{problem['index']}"

def get_problem_code(problem):
    """Generate a code for the problem (contestId + index)"""
    return f"{problem['contestId']}{problem['index']}"

def select_problems_with_tag_balance(filtered_problems, count, already_selected=None):
    """Select random problems with balanced tags"""
    if already_selected is None:
        already_selected = []
    
    # Exclude already selected problems
    available_problems = [p for p in filtered_problems if get_problem_code(p) not in [get_problem_code(sp) for sp in already_selected]]
    
    if len(available_problems) < count:
        print(f"Warning: Not enough problems available. Requested {count}, but only {len(available_problems)} available.")
        return available_problems
    
    # Get all tags and their frequencies
    all_tags = []
    for problem in available_problems:
        all_tags.extend(problem.get('tags', []))
    
    tag_counter = Counter(all_tags)
    
    selected = []
    current_tags = []
    
    while len(selected) < count:
        if not available_problems:
            break
            
        # Calculate tag weights - less frequently seen tags get higher weight
        weights = []
        for problem in available_problems:
            problem_tags = problem.get('tags', [])
            if not problem_tags:
                weight = 1.0  # Default weight for problems with no tags
            else:
                # Calculate how many of this problem's tags are already selected
                overlap = sum(tag_counter[tag] for tag in problem_tags)
                weight = 1.0 / (overlap + 1)  # Add 1 to avoid division by zero
            weights.append(weight)
        
        # Normalize weights to sum to 1
        total_weight = sum(weights) or 1  # Avoid division by zero
        weights = [w / total_weight for w in weights]
        
        # Select a problem based on weights
        chosen_idx = random.choices(range(len(available_problems)), weights=weights, k=1)[0]
        chosen_problem = available_problems.pop(chosen_idx)
        weights.pop(chosen_idx)
        
        selected.append(chosen_problem)
        
        # Update tag counter
        for tag in chosen_problem.get('tags', []):
            current_tags.append(tag)
            tag_counter[tag] += 1
    
    return selected

def add_rating_fluctuations(problems, fluctuation_count, min_allowed, max_allowed):
    """Add rating fluctuations to some problems"""
    if len(problems) <= fluctuation_count:
        return problems
    
    indices = random.sample(range(len(problems)), fluctuation_count)
    
    for idx in indices:
        # 50% chance for -100, 50% chance for +100
        if random.random() < 0.5:
            new_rating = problems[idx]['rating'] - 100
            if new_rating >= min_allowed:
                problems[idx]['rating'] = new_rating
        else:
            new_rating = problems[idx]['rating'] + 100
            if new_rating <= max_allowed:
                problems[idx]['rating'] = new_rating
    
    return problems

def create_tournament_problem_set(problems_per_band=None):
    """Create a balanced tournament problem set with customizable number of problems per band"""
    # Default values if not provided
    if problems_per_band is None:
        problems_per_band = {
            1: 20,  # Band 1 (Round of 16)
            2: 12,  # Band 2 (Quarter Finals)
            3: 8,   # Band 3 (Semi Finals)
            4: 3,   # Band 4 (Finals)
            5: 3    # Band 5 (Grand Finals)
        }
    
    # Fetch all problems
    all_problems = fetch_all_problems()
    if not all_problems:
        print("Failed to fetch problems. Exiting.")
        return
    
    print(f"Successfully fetched {len(all_problems)} problems.")
    
    # Container for selected problems
    selected_problems = []
    all_selected = []
    
    # Band 1 (Round of 16): rated 800-1000 (changed from 900-1000)
    band1_regular = filter_problems_by_rating(all_problems, 800, 1000)
    print(f"Found {len(band1_regular)} regular problems in Band 1 range after filtering out special problems.")
    band1_problems = select_problems_with_tag_balance(band1_regular, problems_per_band[1])
    # No need for fluctuations since the range is already wider
    selected_problems.extend([{"band": 1, "problem": p} for p in band1_problems])
    all_selected.extend(band1_problems)
    
    # Band 2 (Quarter Finals): rated 1100 (unchanged)
    band2_regular = filter_problems_by_rating(all_problems, 1100, 1100)
    print(f"Found {len(band2_regular)} regular problems in Band 2 range after filtering out special problems.")
    band2_problems = select_problems_with_tag_balance(band2_regular, problems_per_band[2], all_selected)
    selected_problems.extend([{"band": 2, "problem": p} for p in band2_problems])
    all_selected.extend(band2_problems)
    
    # Band 3 (Semi Finals): rated 1200 (unchanged)
    band3_regular = filter_problems_by_rating(all_problems, 1200, 1200)
    print(f"Found {len(band3_regular)} regular problems in Band 3 range after filtering out special problems.")
    band3_problems = select_problems_with_tag_balance(band3_regular, problems_per_band[3], all_selected)
    selected_problems.extend([{"band": 3, "problem": p} for p in band3_problems])
    all_selected.extend(band3_problems)
    
    # Band 4 (Finals): rated 1300 (changed from 1300-1600)
    if problems_per_band[4] > 0:
        band4_regular = filter_problems_by_rating(all_problems, 1300, 1300)
        print(f"Found {len(band4_regular)} regular problems in Band 4 range after filtering out special problems.")
        band4_problems = select_problems_with_tag_balance(band4_regular, problems_per_band[4], all_selected)
        selected_problems.extend([{"band": 4, "problem": p} for p in band4_problems])
        all_selected.extend(band4_problems)
    
    # Band 5 (Grand Finals): rated 1400 (changed from 1600-1900)
    if problems_per_band[5] > 0:
        band5_regular = filter_problems_by_rating(all_problems, 1400, 1400)
        print(f"Found {len(band5_regular)} regular problems in Band 5 range after filtering out special problems.")
        band5_problems = select_problems_with_tag_balance(band5_regular, problems_per_band[5], all_selected)
        selected_problems.extend([{"band": 5, "problem": p} for p in band5_problems])
    
    return selected_problems

def export_to_csv(problem_set, filename="codeforces_tournament_problems.csv"):
    """Export the problem set to a CSV file"""
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['Band', 'Link', 'Problem Code', 'Rating', 'Tags'])
        
        for item in problem_set:
            problem = item['problem']
            writer.writerow([
                item['band'],
                get_problem_link(problem),
                get_problem_code(problem),
                problem['rating'],
                ", ".join(problem.get('tags', []))
            ])
    
    print(f"Problem set exported to {filename}")

def print_problem_set_summary(problem_set):
    """Print a summary of the problem set"""
    bands = {}
    for item in problem_set:
        band = item['band']
        if band not in bands:
            bands[band] = []
        bands[band].append(item['problem'])
    
    for band, problems in sorted(bands.items()):
        ratings = [p['rating'] for p in problems]
        print(f"Band {band}: {len(problems)} problems, ratings: {min(ratings)}-{max(ratings)}")
        
        # Count tags
        tag_counter = Counter()
        for problem in problems:
            for tag in problem.get('tags', []):
                tag_counter[tag] += 1
        
        # Print top 5 tags
        print("  Top tags:", ", ".join(f"{tag} ({count})" for tag, count in tag_counter.most_common(5)))

def main():
    parser = argparse.ArgumentParser(description="Generate a Codeforces tournament problem set")
    parser.add_argument("--problems", type=int, help="Number of problems per band (same for all bands)")
    parser.add_argument("--band1", type=int, help="Number of problems for Band 1")
    parser.add_argument("--band2", type=int, help="Number of problems for Band 2")
    parser.add_argument("--band3", type=int, help="Number of problems for Band 3")
    parser.add_argument("--band4", type=int, help="Number of problems for Band 4")
    parser.add_argument("--band5", type=int, help="Number of problems for Band 5")
    parser.add_argument("--output", type=str, default="codeforces_tournament_problems.csv", 
                        help="Output CSV filename")
    parser.add_argument("--seed", type=int, help="Random seed for reproducibility")
    
    args = parser.parse_args()
    
    # Set random seed if provided
    if args.seed:
        random.seed(args.seed)
    else:
        random.seed(time.time())
    
    # Determine problems per band
    problems_per_band = {
        1: 20,  # Default for Band 1
        2: 12,  # Default for Band 2
        3: 8,   # Default for Band 3
        4: 3,   # Default for Band 4
        5: 3    # Default for Band 5
    }
    
    # Override with command line arguments if provided
    if args.problems:
        # Use the same number for all bands
        for band in problems_per_band:
            problems_per_band[band] = args.problems
    
    # Individual band overrides take precedence
    if args.band1:
        problems_per_band[1] = args.band1
    if args.band2:
        problems_per_band[2] = args.band2
    if args.band3:
        problems_per_band[3] = args.band3
    if args.band4:
        problems_per_band[4] = args.band4
    if args.band5:
        problems_per_band[5] = args.band5
    
    print(f"Generating problem set with the following distribution:")
    for band, count in problems_per_band.items():
        print(f"Band {band}: {count} problems")
    
    problem_set = create_tournament_problem_set(problems_per_band)
    if problem_set:
        print("\nProblem Set Summary:")
        print_problem_set_summary(problem_set)
        export_to_csv(problem_set, args.output)

if __name__ == "__main__":
    main()