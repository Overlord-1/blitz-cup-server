import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from collections import Counter
import os
import re
from matplotlib.gridspec import GridSpec

def load_problem_set(csv_path="codeforces_tournament_problems.csv"):
    """
    Load the problem set CSV file into a pandas DataFrame.
    """
    if not os.path.exists(csv_path):
        print(f"Error: File {csv_path} not found!")
        return None
    
    try:
        df = pd.read_csv(csv_path)
        return df
    except Exception as e:
        print(f"Error loading CSV file: {e}")
        return None

def extract_tag_data(df):
    """
    Extract and process tag data from the DataFrame.
    """
    # Create a dictionary to hold tags per band
    tags_by_band = {}
    all_tags = []
    
    # Process tags
    for _, row in df.iterrows():
        band = row['Band']
        if band not in tags_by_band:
            tags_by_band[band] = []
        
        # Split tags and clean them
        if isinstance(row['Tags'], str):  # Check if Tags is a string
            tags = [tag.strip() for tag in row['Tags'].split(',')]
            tags_by_band[band].extend(tags)
            all_tags.extend(tags)
    
    return tags_by_band, all_tags

def analyze_problem_set(df):
    """
    Analyze the problem set and return key metrics.
    """
    # Count problems per band
    problems_per_band = df['Band'].value_counts().sort_index()
    
    # Calculate rating statistics
    rating_stats = {
        'mean': df['Rating'].mean(),
        'median': df['Rating'].median(),
        'min': df['Rating'].min(),
        'max': df['Rating'].max(),
        'std': df['Rating'].std()
    }
    
    # Calculate the number of "random" problems (those with fluctuations)
    # For band 1: problems outside 900-1000 range
    band1_expected = (900, 1000)
    band1_random = df[(df['Band'] == 1) & 
                      ((df['Rating'] < band1_expected[0]) | 
                       (df['Rating'] > band1_expected[1]))].shape[0]
    
    # For band 2: problems outside 1100 range
    band2_expected = 1100
    band2_random = df[(df['Band'] == 2) & 
                      (df['Rating'] != band2_expected)].shape[0]
    
    # For band 3: problems outside 1200 range
    band3_expected = 1200
    band3_random = df[(df['Band'] == 3) & 
                      (df['Rating'] != band3_expected)].shape[0]
    
    # Random problems summary
    random_problems = {
        'band1': band1_random,
        'band2': band2_random,
        'band3': band3_random,
        'total': band1_random + band2_random + band3_random
    }
    
    # Calculate rating distribution by band
    rating_by_band = df.groupby('Band')['Rating'].agg(['min', 'max', 'mean', 'std']).round(2)
    
    return {
        'problems_per_band': problems_per_band,
        'rating_stats': rating_stats,
        'random_problems': random_problems,
        'rating_by_band': rating_by_band
    }

def visualize_problem_set(df, analysis_results, output_filename="problem_set_analysis.png"):
    """
    Create comprehensive visualizations for the problem set.
    """
    # Set up the figure with a grid layout
    plt.figure(figsize=(18, 14))
    gs = GridSpec(3, 3)
    
    # Use a visually appealing style
    sns.set_style("whitegrid")
    plt.rcParams['font.family'] = 'DejaVu Sans'
    
    # Color palette
    palette = sns.color_palette("viridis", 4)
    band_colors = {1: palette[0], 2: palette[1], 3: palette[2], 4: palette[3]}
    
    # 1. Problems per band (bar chart)
    ax1 = plt.subplot(gs[0, 0])
    problems_per_band = analysis_results['problems_per_band']
    ax1.bar(problems_per_band.index, problems_per_band.values, 
            color=[band_colors[b] for b in problems_per_band.index])
    ax1.set_xlabel('Tournament Band')
    ax1.set_ylabel('Number of Problems')
    ax1.set_title('Problems per Tournament Band')
    ax1.set_xticks(problems_per_band.index)
    ax1.set_xticklabels(['Band ' + str(b) for b in problems_per_band.index])
    
    for i, v in enumerate(problems_per_band):
        ax1.text(i+1, v+0.1, str(v), ha='center')
    
    # 2. Rating distribution (histogram with density plot)
    ax2 = plt.subplot(gs[0, 1:])
    for band in df['Band'].unique():
        band_data = df[df['Band'] == band]
        sns.histplot(band_data['Rating'], kde=True, ax=ax2, 
                     label=f'Band {band}', color=band_colors[band], alpha=0.7)
    
    ax2.set_xlabel('Problem Rating')
    ax2.set_ylabel('Count')
    ax2.set_title('Distribution of Problem Ratings')
    ax2.legend()
    
    # 3. Rating box plot by band
    ax3 = plt.subplot(gs[1, 0])
    sns.boxplot(x='Band', y='Rating', data=df, ax=ax3, 
                palette=[band_colors[b] for b in sorted(df['Band'].unique())])
    ax3.set_xlabel('Tournament Band')
    ax3.set_ylabel('Problem Rating')
    ax3.set_title('Rating Distribution by Tournament Band')
    
    # 4. Random problems summary
    ax4 = plt.subplot(gs[1, 1])
    random_data = analysis_results['random_problems']
    bands = ['Band 1', 'Band 2', 'Band 3', 'Total']
    random_counts = [random_data['band1'], random_data['band2'], 
                    random_data['band3'], random_data['total']]
    
    bars = ax4.bar(bands, random_counts, color=['#2171b5', '#6baed6', '#bdd7e7', '#08519c'])
    ax4.set_xlabel('Tournament Band')
    ax4.set_ylabel('Count')
    ax4.set_title('Problems with Rating Fluctuations')
    
    for bar in bars:
        height = bar.get_height()
        ax4.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                f'{height}', ha='center', va='bottom')
    
    # 5. Tag frequency (top 15)
    ax5 = plt.subplot(gs[1, 2])
    tags_by_band, all_tags = extract_tag_data(df)
    tag_counts = Counter(all_tags)
    top_tags = dict(tag_counts.most_common(15))
    
    ax5.barh(list(top_tags.keys()), list(top_tags.values()), color='#3182bd')
    ax5.set_xlabel('Count')
    ax5.set_title('Top 15 Problem Tags')
    ax5.invert_yaxis()  # To have the highest count at the top
    
    # 6. Tag diversity by band (stacked bar)
    ax6 = plt.subplot(gs[2, :2])
    
    # Process tag data for visualization
    band_tag_data = {}
    unique_tags = set()
    
    for band, tags in tags_by_band.items():
        band_tag_data[band] = Counter(tags)
        unique_tags.update(band_tag_data[band].keys())
    
    # Get top 10 tags overall
    top_tags_overall = [tag for tag, _ in tag_counts.most_common(10)]
    
    # Create data for stacked bar chart
    band_numbers = sorted(band_tag_data.keys())
    tag_data = {tag: [band_tag_data[band].get(tag, 0) for band in band_numbers] 
                for tag in top_tags_overall}
    
    bottom = np.zeros(len(band_numbers))
    for tag, counts in tag_data.items():
        p = ax6.bar(band_numbers, counts, bottom=bottom, label=tag)
        bottom += counts
    
    ax6.set_xlabel('Tournament Band')
    ax6.set_ylabel('Count')
    ax6.set_title('Tag Distribution Across Tournament Bands (Top 10 Tags)')
    ax6.legend(loc='upper left', bbox_to_anchor=(1, 1))
    ax6.set_xticks(band_numbers)
    ax6.set_xticklabels(['Band ' + str(b) for b in band_numbers])
    
    # 7. Rating statistics table
    ax7 = plt.subplot(gs[2, 2])
    ax7.axis('tight')
    ax7.axis('off')
    
    # Create a more detailed table with rating stats by band
    rating_by_band = analysis_results['rating_by_band']
    table_data = []
    columns = ['Band', 'Min', 'Max', 'Mean', 'Std Dev']
    
    for band in sorted(rating_by_band.index):
        row_data = [f'Band {band}']
        for stat in ['min', 'max', 'mean', 'std']:
            row_data.append(f"{rating_by_band.loc[band, stat]:.1f}")
        table_data.append(row_data)
    
    # Add overall stats
    overall_stats = analysis_results['rating_stats']
    table_data.append([
        'Overall', 
        f"{overall_stats['min']:.1f}", 
        f"{overall_stats['max']:.1f}", 
        f"{overall_stats['mean']:.1f}", 
        f"{overall_stats['std']:.1f}"
    ])
    
    table = ax7.table(cellText=table_data, colLabels=columns, 
                      loc='center', cellLoc='center')
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1.2, 1.5)
    ax7.set_title('Rating Statistics by Band')
    
    # Add an overall title
    plt.suptitle('Codeforces Tournament Problem Set Analysis', 
                 fontsize=20, fontweight='bold', y=0.98)
    
    # Add metadata text
    metadata_text = (
        f"Total Problems: {len(df)}\n"
        f"Rating Range: {analysis_results['rating_stats']['min']} - "
        f"{analysis_results['rating_stats']['max']}\n"
        f"Problems with Fluctuations: {analysis_results['random_problems']['total']} "
        f"({analysis_results['random_problems']['total']/len(df)*100:.1f}%)\n"
        f"Unique Tags: {len(set(all_tags))}"
    )
    
    plt.figtext(0.5, 0.01, metadata_text, ha='center', 
                bbox=dict(facecolor='#d9d9d9', alpha=0.5), fontsize=12)
    
    # Adjust layout and save figure
    plt.tight_layout(rect=[0, 0.03, 1, 0.95])
    plt.savefig(output_filename, dpi=300, bbox_inches='tight')
    print(f"Analysis saved to {output_filename}")
    plt.close()
    
    return True

def generate_detailed_report(df, analysis_results, output_filename="problem_set_report.txt"):
    """
    Generate a detailed text report about the problem set.
    """
    tags_by_band, all_tags = extract_tag_data(df)
    
    with open(output_filename, 'w') as f:
        f.write("=" * 80 + "\n")
        f.write("CODEFORCES TOURNAMENT PROBLEM SET ANALYSIS REPORT\n")
        f.write("=" * 80 + "\n\n")
        
        # General statistics
        f.write("GENERAL STATISTICS\n")
        f.write("-" * 80 + "\n")
        f.write(f"Total Problems: {len(df)}\n")
        f.write(f"Rating Range: {analysis_results['rating_stats']['min']} - {analysis_results['rating_stats']['max']}\n")
        f.write(f"Mean Rating: {analysis_results['rating_stats']['mean']:.2f}\n")
        f.write(f"Median Rating: {analysis_results['rating_stats']['median']}\n")
        f.write(f"Rating Standard Deviation: {analysis_results['rating_stats']['std']:.2f}\n")
        f.write(f"Unique Tags: {len(set(all_tags))}\n\n")
        
        # Problems per band
        f.write("PROBLEMS PER TOURNAMENT BAND\n")
        f.write("-" * 80 + "\n")
        for band, count in analysis_results['problems_per_band'].items():
            f.write(f"Band {band}: {count} problems\n")
        f.write("\n")
        
        # Rating distribution by band
        f.write("RATING DISTRIBUTION BY BAND\n")
        f.write("-" * 80 + "\n")
        rating_by_band = analysis_results['rating_by_band']
        for band in sorted(rating_by_band.index):
            f.write(f"Band {band}:\n")
            f.write(f"  Min: {rating_by_band.loc[band, 'min']}\n")
            f.write(f"  Max: {rating_by_band.loc[band, 'max']}\n")
            f.write(f"  Mean: {rating_by_band.loc[band, 'mean']:.2f}\n")
            f.write(f"  Standard Deviation: {rating_by_band.loc[band, 'std']:.2f}\n\n")
        
        # Random problems analysis
        f.write("PROBLEMS WITH RATING FLUCTUATIONS\n")
        f.write("-" * 80 + "\n")
        random_data = analysis_results['random_problems']
        f.write(f"Band 1: {random_data['band1']} problems with ratings outside 900-1000 range\n")
        f.write(f"Band 2: {random_data['band2']} problems with ratings other than 1100\n")
        f.write(f"Band 3: {random_data['band3']} problems with ratings other than 1200\n")
        f.write(f"Total: {random_data['total']} problems with fluctuations ")
        f.write(f"({random_data['total']/len(df)*100:.1f}% of all problems)\n\n")
        
        # Tag analysis
        f.write("TAG ANALYSIS\n")
        f.write("-" * 80 + "\n")
        
        # Most common tags overall
        tag_counts = Counter(all_tags)
        f.write("Most Common Tags Overall:\n")
        for tag, count in tag_counts.most_common(15):
            f.write(f"  {tag}: {count} occurrences\n")
        f.write("\n")
        
        # Tags by band
        f.write("Top 5 Tags by Band:\n")
        for band in sorted(tags_by_band.keys()):
            f.write(f"  Band {band}:\n")
            band_tag_counts = Counter(tags_by_band[band])
            for tag, count in band_tag_counts.most_common(5):
                f.write(f"    {tag}: {count} occurrences\n")
            f.write("\n")
        
        # Tag diversity
        f.write("Tag Diversity:\n")
        for band in sorted(tags_by_band.keys()):
            unique_band_tags = len(set(tags_by_band[band]))
            total_band_tags = len(tags_by_band[band])
            f.write(f"  Band {band}: {unique_band_tags} unique tags / {total_band_tags} total tags ")
            f.write(f"(Diversity Index: {unique_band_tags/total_band_tags:.2f})\n")
        
        # Add conclusion
        f.write("\n" + "=" * 80 + "\n")
        f.write("CONCLUSION\n")
        f.write("=" * 80 + "\n")
        f.write(f"This problem set consists of {len(df)} carefully selected problems distributed across 4 tournament bands.\n")
        f.write(f"The problem set includes {random_data['total']} problems with intentional rating fluctuations to add variety.\n")
        f.write(f"With {len(set(all_tags))} unique tags across all problems, the set offers a diverse range of problem types.\n")
        f.write("The gradual increase in problem difficulty from band to band provides an appropriate challenge progression.\n")
        
    print(f"Detailed report saved to {output_filename}")
    return True

def main():
    """
    Main function to run the analysis and visualization.
    """
    print("Loading problem set data...")
    df = load_problem_set()
    
    if df is None:
        print("Failed to load problem set data. Please generate the CSV first.")
        return
    
    print(f"Loaded problem set with {len(df)} problems.")
    
    print("Analyzing problem set...")
    analysis_results = analyze_problem_set(df)
    
    print("Generating visualizations...")
    visualize_problem_set(df, analysis_results)
    
    print("Generating detailed report...")
    generate_detailed_report(df, analysis_results)
    
    print("Analysis complete!")
    print("\nSummary of findings:")
    print(f"- Total Problems: {len(df)}")
    print(f"- Problems per band: {dict(analysis_results['problems_per_band'])}")
    print(f"- Rating range: {analysis_results['rating_stats']['min']} - {analysis_results['rating_stats']['max']}")
    print(f"- Problems with fluctuations: {analysis_results['random_problems']['total']}")
    
    print("\nFor more details, check the generated visualization and report.")

if __name__ == "__main__":
    main()