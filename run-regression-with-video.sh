#!/bin/bash

# Regression Tests with Video Evidence
# This script runs regression tests and produces video recordings for evidence

echo "🎬 Starting Regression Tests with Video Evidence..."
echo "=================================================="

# Run regression tests with video recording
npm run test:regression:video

# Check if videos were created
echo ""
echo "📹 Video Evidence Generated:"
echo "============================"

if [ -d "test-results" ]; then
    video_count=$(find test-results -name "*.webm" -type f | wc -l)
    echo "✅ Found $video_count video files in test-results/"
    
    echo ""
    echo "📁 Video locations:"
    find test-results -name "*.webm" -type f | head -10
    
    if [ $video_count -gt 10 ]; then
        echo "... and $((video_count - 10)) more videos"
    fi
else
    echo "❌ No test-results directory found"
fi

echo ""
echo "🎯 Test Summary:"
echo "================"
echo "• Videos are saved in test-results/ directory"
echo "• Each test run creates videos for all browsers (Chrome, Firefox, Safari)"
echo "• Videos show the complete test execution for evidence"
echo "• Videos are automatically ignored by git (.gitignore configured)"

echo ""
echo "✨ Regression tests with video evidence completed!"
