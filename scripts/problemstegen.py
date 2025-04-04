import requests
import random
import csv
import time
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

def filter_problems_by_rating(problems, min_rating, max_rating):
    """Filter problems by rating range"""
    return [p for p in problems if 'rating' in p and min_rating <= p['rating'] <= max_rating]

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

def create_tournament_problem_set():
    """Create a balanced tournament problem set"""
    # Fetch all problems
    all_problems = fetch_all_problems()
    if not all_problems:
        print("Failed to fetch problems. Exiting.")
        return
    
    print(f"Successfully fetched {len(all_problems)} problems.")
    
    # Container for selected problems
    selected_problems = []
    
    # Band 1 (Round of 16): 20 problems rated 900-1000 (with some 800 or 1100)
    band1_regular = filter_problems_by_rating(all_problems, 900, 1000)
    band1_problems = select_problems_with_tag_balance(band1_regular, 20)
    band1_problems = add_rating_fluctuations(band1_problems, 2, 800, 1100)
    selected_problems.extend([{"band": 1, "problem": p} for p in band1_problems])
    
    # Band 2 (Quarter Finals): 12 problems rated 1100 (with some 1000 or 1200)
    band2_regular = filter_problems_by_rating(all_problems, 1100, 1100)
    band2_problems = select_problems_with_tag_balance(band2_regular, 12, band1_problems)
    band2_problems = add_rating_fluctuations(band2_problems, 2, 1000, 1200)
    selected_problems.extend([{"band": 2, "problem": p} for p in band2_problems])
    
    # Band 3 (Semi Finals): 8 problems rated 1200 (with some 1100 or 1300)
    band3_regular = filter_problems_by_rating(all_problems, 1200, 1200)
    band3_problems = select_problems_with_tag_balance(band3_regular, 8, band1_problems + band2_problems)
    band3_problems = add_rating_fluctuations(band3_problems, 1, 1100, 1300)
    selected_problems.extend([{"band": 3, "problem": p} for p in band3_problems])
    
    # Band 4 (Finals): 3 problems with specific ratings
    band4_problem1 = select_problems_with_tag_balance(
        filter_problems_by_rating(all_problems, 800, 1000), 1, 
        band1_problems + band2_problems + band3_problems
    )
    
    band4_problem2 = select_problems_with_tag_balance(
        filter_problems_by_rating(all_problems, 1100, 1200), 1, 
        band1_problems + band2_problems + band3_problems + band4_problem1
    )
    
    band4_problem3 = select_problems_with_tag_balance(
        filter_problems_by_rating(all_problems, 1300, 1400), 1, 
        band1_problems + band2_problems + band3_problems + band4_problem1 + band4_problem2
    )
    
    selected_problems.extend([{"band": 4, "problem": p} for p in band4_problem1 + band4_problem2 + band4_problem3])
    
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

if __name__ == "__main__":
    # Set random seed for reproducibility (optional, remove for true randomness)
    random.seed(time.time())
    
    problem_set = create_tournament_problem_set()
    if problem_set:
        print("\nProblem Set Summary:")
        print_problem_set_summary(problem_set)
        export_to_csv(problem_set)