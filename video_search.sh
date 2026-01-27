#!/bin/bash
# Quick start script for video search

echo "=== Smootie Video Search Tool ==="
echo ""

# Check if yt-dlp is installed
if ! command -v yt-dlp &> /dev/null; then
    echo "yt-dlp is not installed."
    echo "Installing yt-dlp..."
    pip install yt-dlp
    echo ""
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  ffmpeg is not installed."
    echo "Please install ffmpeg:"
    echo "  macOS: brew install ffmpeg"
    echo "  Ubuntu: sudo apt install ffmpeg"
    echo "  Windows: Download from https://ffmpeg.org/download.html"
    echo ""
fi

# Show menu
echo "What would you like to do?"
echo ""
echo "1. List all available actions"
echo "2. Search for videos"
echo "3. Download a video"
echo "4. Show help"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        python search_videos.py --list-actions
        ;;
    2)
        read -p "Enter action name (e.g., walking, jumping): " action
        python search_videos.py --action "$action" --preview-only
        ;;
    3)
        read -p "Enter action name: " action
        read -p "Enter video URL: " url
        python search_videos.py --action "$action" --download --url "$url"
        ;;
    4)
        python search_videos.py --help
        ;;
    *)
        echo "Invalid choice"
        ;;
esac
