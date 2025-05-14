#!/bin/bash

# tournament_generator.sh - Script to run Codeforces tournament problem generator

# Help text function
show_help() {
    echo "Usage: ./tournament_generator.sh [OPTIONS]"
    echo ""
    echo "Generate a Codeforces tournament problem set with customizable number of problems per band."
    echo ""
    echo "Options:"
    echo "  -a, --all NUM       Set the same number of problems for all bands"
    echo "  -1, --band1 NUM     Set number of problems for Band 1"
    echo "  -2, --band2 NUM     Set number of problems for Band 2"
    echo "  -3, --band3 NUM     Set number of problems for Band 3"
    echo "  -4, --band4 NUM     Set number of problems for Band 4"
    echo "  -5, --band5 NUM     Set number of problems for Band 5"
    echo "  -o, --output FILE   Specify output CSV filename"
    echo "  -s, --seed NUM      Set random seed for reproducibility"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Example:"
    echo "  ./tournament_generator.sh --all 20       # Generate 20 problems for each band"
    echo "  ./tournament_generator.sh -1 30 -2 20    # 30 problems for Band 1, 20 for Band 2"
}

# Initialize parameters
ALL_PROBLEMS=""
BAND1=""
BAND2=""
BAND3=""
BAND4=""
BAND5=""
OUTPUT=""
SEED=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -a|--all)
            ALL_PROBLEMS="$2"
            shift 2
            ;;
        -1|--band1)
            BAND1="$2"
            shift 2
            ;;
        -2|--band2)
            BAND2="$2"
            shift 2
            ;;
        -3|--band3)
            BAND3="$2"
            shift 2
            ;;
        -4|--band4)
            BAND4="$2"
            shift 2
            ;;
        -5|--band5)
            BAND5="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT="$2"
            shift 2
            ;;
        -s|--seed)
            SEED="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Build command
CMD="python problemstegen.py"

if [ ! -z "$ALL_PROBLEMS" ]; then
    CMD="$CMD --problems $ALL_PROBLEMS"
fi

if [ ! -z "$BAND1" ]; then
    CMD="$CMD --band1 $BAND1"
fi

if [ ! -z "$BAND2" ]; then
    CMD="$CMD --band2 $BAND2"
fi

if [ ! -z "$BAND3" ]; then
    CMD="$CMD --band3 $BAND3"
fi

if [ ! -z "$BAND4" ]; then
    CMD="$CMD --band4 $BAND4"
fi

if [ ! -z "$BAND5" ]; then
    CMD="$CMD --band5 $BAND5"
fi

if [ ! -z "$OUTPUT" ]; then
    CMD="$CMD --output $OUTPUT"
fi

if [ ! -z "$SEED" ]; then
    CMD="$CMD --seed $SEED"
fi

# Execute the command
echo "Executing: $CMD"
eval $CMD