#!/usr/bin/env python3
"""
Video Search and Download Skill for Smootie
============================================

This script helps you find and download loopable action videos suitable for
voice-controlled video switching applications.

IMPORTANT: Finding Cohesive Video Sets
--------------------------------------
For smooth transitions between actions, all videos in a set must feature:
- Same person/character
- Same background
- Same lighting and camera angle
- Compatible start/end poses

YouTube individual action searches rarely yield cohesive sets. Instead:

1. BEST APPROACH: Search for "multi-action source videos" (--search-source)
   - Animation reference reels showing multiple actions
   - Motion capture showcases with idle/walk/run/jump sequences
   - Download one video, then split into individual action clips

2. ALTERNATIVE: Use professional stock footage sites
   - Mixamo (free 3D animations): https://www.mixamo.com/
   - Pexels: https://www.pexels.com/videos/
   - Mixkit: https://mixkit.co/free-stock-video/

3. FALLBACK: Record your own cohesive set

Requirements:
- yt-dlp (pip install yt-dlp)
- ffmpeg (for video processing)

Usage:
    # Search for multi-action source videos (RECOMMENDED)
    python search_videos.py --search-source

    # Search for individual actions (less likely to find cohesive sets)
    python search_videos.py --action "standing" --preview-only

    # Download and split a source video
    python search_videos.py --download-source --url "URL" --set myset
    python search_videos.py --split --source videos/myset/source.mp4 --timestamps "0:00-0:05=idle,0:06-0:12=walk"

    python search_videos.py --list-actions
"""

import subprocess
import sys
import argparse
import json
from pathlib import Path

# Action categories with search keywords
ACTION_CATEGORIES = {
    # Basic static poses
    "standing": {
        "keywords": [
            "person standing idle breathing loop",
            "human standing still subtle movement",
            "character standing idle animation",
            "person standing neutral breathing",
        ],
        "type": "static",
        "description": "Person standing idle with natural breathing/subtle movements"
    },
    "sitting": {
        "keywords": [
            "person sitting idle breathing loop",
            "human sitting still subtle movement",
            "character sitting idle animation",
            "person sitting relaxed breathing",
        ],
        "type": "static",
        "description": "Person sitting idle with natural breathing/subtle movements"
    },

    # Dynamic actions
    "walking": {
        "keywords": [
            "person walking loop seamless",
            "human walking cycle animation",
            "character walking treadmill loop",
            "person walking in place loop",
        ],
        "type": "dynamic",
        "description": "Person walking (can be in place or on treadmill)"
    },
    "running": {
        "keywords": [
            "person running loop seamless",
            "human running cycle animation",
            "character running treadmill loop",
            "person jogging in place loop",
        ],
        "type": "dynamic",
        "description": "Person running or jogging"
    },
    "jumping": {
        "keywords": [
            "person jumping loop",
            "human jump animation loop",
            "character jumping rope loop",
            "person jumping jacks loop",
        ],
        "type": "dynamic",
        "description": "Person jumping"
    },
    "dancing": {
        "keywords": [
            "person dancing loop seamless",
            "human dance move loop",
            "character dancing animation loop",
            "person dance routine loop",
        ],
        "type": "dynamic",
        "description": "Person dancing"
    },
    "waving": {
        "keywords": [
            "person waving hand loop",
            "human waving hello loop",
            "character waving animation",
            "person greeting wave loop",
        ],
        "type": "dynamic",
        "description": "Person waving hand"
    },

    # Transitions
    "stand_to_sit": {
        "keywords": [
            "person standing to sitting transition",
            "human sit down animation",
            "character standing to sitting",
            "person sitting down motion",
        ],
        "type": "transition",
        "description": "Transition from standing to sitting"
    },
    "sit_to_stand": {
        "keywords": [
            "person sitting to standing transition",
            "human stand up animation",
            "character sitting to standing",
            "person standing up motion",
        ],
        "type": "transition",
        "description": "Transition from sitting to standing"
    },
    "stand_to_walk": {
        "keywords": [
            "person start walking from standing",
            "human begin walking animation",
            "character standing to walking",
            "person walking start motion",
        ],
        "type": "transition",
        "description": "Transition from standing to walking"
    },
    "walk_to_stand": {
        "keywords": [
            "person stop walking to standing",
            "human stop walking animation",
            "character walking to standing",
            "person walking stop motion",
        ],
        "type": "transition",
        "description": "Transition from walking to standing"
    },
}

# Video quality and format preferences
VIDEO_PREFERENCES = {
    "format": "bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4]/best",
    "max_duration": 30,  # seconds
    "min_duration": 2,   # seconds
    "preferred_fps": 30,
}

# Additional search sources
SEARCH_SOURCES = {
    "youtube": {
        "enabled": True,
        "filters": "ytsearch10:",  # Search top 10 results
    },
    "vimeo": {
        "enabled": False,  # Requires authentication
    },
    "pexels": {
        "enabled": False,  # Use Pexels API separately
        "note": "Visit https://www.pexels.com/videos/ for free stock videos"
    },
    "mixkit": {
        "enabled": False,
        "note": "Visit https://mixkit.co/free-stock-video/ for free videos"
    },
}

# Multi-action source video search keywords
# These search for videos containing MULTIPLE actions from the same person
SOURCE_VIDEO_KEYWORDS = [
    "animation reference idle walk run jump",
    "motion capture reference all actions",
    "character animation reference reel",
    "actor reference idle walk run",
    "mocap reference video multiple actions",
    "animation reference video human actions",
    "movement reference idle to walk to run",
    "acting reference standing walking running",
]


def check_dependencies():
    """Check if required tools are installed."""
    try:
        subprocess.run(["yt-dlp", "--version"],
                      capture_output=True, check=True)
        print("✓ yt-dlp is installed")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("✗ yt-dlp is not installed")
        print("  Install with: pip install yt-dlp")
        return False

    try:
        subprocess.run(["ffmpeg", "-version"],
                      capture_output=True, check=True)
        print("✓ ffmpeg is installed")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("✗ ffmpeg is not installed")
        print("  Install from: https://ffmpeg.org/download.html")
        return False

    return True


def list_actions():
    """List all available action categories."""
    print("\n=== Available Action Categories ===\n")

    for category in ["static", "dynamic", "transition"]:
        actions = {k: v for k, v in ACTION_CATEGORIES.items()
                  if v["type"] == category}
        if actions:
            print(f"\n{category.upper()} ACTIONS:")
            for action, info in actions.items():
                print(f"  • {action:20s} - {info['description']}")

    print("\n" + "="*50 + "\n")


def search_source_videos():
    """Search for multi-action source videos (RECOMMENDED approach)."""
    print("\n=== Searching for Multi-Action Source Videos ===")
    print("These videos contain multiple actions from the same person,")
    print("which can be split into cohesive action clips.\n")

    results = []

    for i, keyword in enumerate(SOURCE_VIDEO_KEYWORDS, 1):
        print(f"[{i}/{len(SOURCE_VIDEO_KEYWORDS)}] Searching: '{keyword}'")

        search_query = f"ytsearch5:{keyword}"

        cmd = [
            "yt-dlp",
            "--dump-json",
            "--no-download",
            "--no-playlist",
            search_query
        ]

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)

            for line in result.stdout.strip().split('\n'):
                if line:
                    try:
                        video_info = json.loads(line)
                        duration = video_info.get('duration', 0)

                        # For source videos, we want longer videos (30s - 10min)
                        if 30 <= duration <= 600:
                            results.append({
                                'title': video_info.get('title', 'Unknown'),
                                'url': video_info.get('webpage_url', ''),
                                'duration': duration,
                                'uploader': video_info.get('uploader', 'Unknown'),
                                'view_count': video_info.get('view_count', 0),
                                'description': video_info.get('description', '')[:200],
                            })
                    except json.JSONDecodeError:
                        continue

        except subprocess.CalledProcessError as e:
            print(f"  Error searching: {e}")
            continue

    # Remove duplicates by URL
    seen_urls = set()
    unique_results = []
    for r in results:
        if r['url'] not in seen_urls:
            seen_urls.add(r['url'])
            unique_results.append(r)

    # Sort by view count
    unique_results.sort(key=lambda x: x['view_count'], reverse=True)

    print(f"\n=== Found {len(unique_results)} potential source videos ===\n")

    for i, video in enumerate(unique_results[:15], 1):
        duration_min = video['duration'] // 60
        duration_sec = video['duration'] % 60
        print(f"{i}. {video['title']}")
        print(f"   Duration: {duration_min}m{duration_sec}s | Views: {video['view_count']:,}")
        print(f"   Uploader: {video['uploader']}")
        print(f"   URL: {video['url']}")
        if video['description']:
            print(f"   Description: {video['description'][:100]}...")
        print()

    print("\n=== Next Steps ===")
    print("1. Watch the video to identify action timestamps")
    print("2. Download with: python search_videos.py --download-source --url <URL> --set <setname>")
    print("3. Split with: python search_videos.py --split --source videos/<set>/source.mp4 --timestamps '0:00-0:05=idle,0:06-0:12=walk'")

    return unique_results


def download_source_video(url, video_set, output_dir="videos"):
    """Download a multi-action source video."""
    output_path = Path(output_dir) / video_set
    output_path.mkdir(parents=True, exist_ok=True)

    output_file = output_path / "source.mp4"

    print(f"\n=== Downloading Source Video ===")
    print(f"Video Set: {video_set}")
    print(f"Output: {output_file}")

    cmd = [
        "yt-dlp",
        "-f", VIDEO_PREFERENCES['format'],
        "-o", str(output_file),
        url
    ]

    try:
        subprocess.run(cmd, check=True)
        print(f"\n✓ Downloaded successfully: {output_file}")

        # Get video duration
        probe_cmd = ["ffprobe", "-v", "quiet", "-print_format", "json",
                     "-show_format", str(output_file)]
        probe_result = subprocess.run(probe_cmd, capture_output=True, text=True)
        if probe_result.returncode == 0:
            info = json.loads(probe_result.stdout)
            duration = float(info.get('format', {}).get('duration', 0))
            print(f"   Duration: {int(duration)}s")

        print("\n=== Next Step ===")
        print("Watch the video and note timestamps for each action, then run:")
        print(f"  python search_videos.py --split --source {output_file} --timestamps '0:00-0:05=idle,0:06-0:12=walk,0:13-0:18=jump'")

        return True

    except subprocess.CalledProcessError as e:
        print(f"\n✗ Download failed: {e}")
        return False


def split_source_video(source_path, timestamps, output_dir=None):
    """Split a source video into individual action clips.

    timestamps format: "start-end=action,start-end=action,..."
    Example: "0:00-0:05=idle,0:06-0:12=walk,0:13-0:18=jump"
    """
    source_path = Path(source_path)
    if not source_path.exists():
        print(f"Error: Source file not found: {source_path}")
        return False

    if output_dir is None:
        output_dir = source_path.parent

    output_dir = Path(output_dir)

    print(f"\n=== Splitting Source Video ===")
    print(f"Source: {source_path}")
    print(f"Output directory: {output_dir}")

    # Parse timestamps
    clips = []
    for segment in timestamps.split(','):
        segment = segment.strip()
        if '=' not in segment or '-' not in segment:
            print(f"Warning: Invalid segment format '{segment}', skipping")
            continue

        time_range, action = segment.split('=')
        start, end = time_range.split('-')
        clips.append({
            'start': start.strip(),
            'end': end.strip(),
            'action': action.strip()
        })

    if not clips:
        print("Error: No valid clips found in timestamps")
        return False

    print(f"\nClips to extract:")
    for clip in clips:
        print(f"  • {clip['action']}: {clip['start']} - {clip['end']}")

    print("\nExtracting clips...")
    success_count = 0

    for clip in clips:
        output_file = output_dir / f"{clip['action']}.mp4"

        cmd = [
            "ffmpeg", "-y",
            "-i", str(source_path),
            "-ss", clip['start'],
            "-to", clip['end'],
            "-c:v", "libx264",
            "-c:a", "aac",
            "-preset", "fast",
            str(output_file)
        ]

        try:
            subprocess.run(cmd, capture_output=True, check=True)
            print(f"  ✓ {clip['action']}.mp4")
            success_count += 1
        except subprocess.CalledProcessError as e:
            print(f"  ✗ {clip['action']}.mp4 - Error: {e}")

    print(f"\n=== Split Complete ===")
    print(f"Successfully extracted {success_count}/{len(clips)} clips")

    if success_count > 0:
        print(f"\nClips saved to: {output_dir}/")
        print("You can now update app.js to use this video set.")

    return success_count == len(clips)


def search_videos(action, preview_only=False):
    """Search for videos matching the action."""
    if action not in ACTION_CATEGORIES:
        print(f"Error: Unknown action '{action}'")
        print("Use --list-actions to see available actions")
        return []

    action_info = ACTION_CATEGORIES[action]
    print(f"\n=== Searching for: {action} ===")
    print(f"Description: {action_info['description']}")
    print(f"Type: {action_info['type']}\n")

    results = []

    for i, keyword in enumerate(action_info['keywords'], 1):
        print(f"\n[{i}/{len(action_info['keywords'])}] Searching: '{keyword}'")

        search_query = f"ytsearch5:{keyword}"

        cmd = [
            "yt-dlp",
            "--dump-json",
            "--no-download",
            "--no-playlist",
            search_query
        ]

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)

            for line in result.stdout.strip().split('\n'):
                if line:
                    try:
                        video_info = json.loads(line)
                        duration = video_info.get('duration', 0)

                        # Filter by duration
                        if (VIDEO_PREFERENCES['min_duration'] <= duration <=
                            VIDEO_PREFERENCES['max_duration']):
                            results.append({
                                'title': video_info.get('title', 'Unknown'),
                                'url': video_info.get('webpage_url', ''),
                                'duration': duration,
                                'uploader': video_info.get('uploader', 'Unknown'),
                                'view_count': video_info.get('view_count', 0),
                            })
                    except json.JSONDecodeError:
                        continue

        except subprocess.CalledProcessError as e:
            print(f"  Error searching: {e}")
            continue

    # Sort by view count
    results.sort(key=lambda x: x['view_count'], reverse=True)

    # Display results
    print(f"\n=== Found {len(results)} suitable videos ===\n")

    for i, video in enumerate(results[:10], 1):  # Show top 10
        print(f"{i}. {video['title']}")
        print(f"   Duration: {video['duration']}s | Views: {video['view_count']:,}")
        print(f"   URL: {video['url']}")
        print()

    return results


def download_video(url, action, output_dir="videos", video_set="default"):
    """Download a video and prepare it for looping."""
    output_path = Path(output_dir) / video_set
    output_path.mkdir(parents=True, exist_ok=True)

    output_file = output_path / f"{action}.mp4"

    print(f"\n=== Downloading video ===")
    print(f"Action: {action}")
    print(f"Video Set: {video_set}")
    print(f"Output: {output_file}")

    cmd = [
        "yt-dlp",
        "-f", VIDEO_PREFERENCES['format'],
        "-o", str(output_file),
        url
    ]

    try:
        subprocess.run(cmd, check=True)
        print(f"\n✓ Downloaded successfully: {output_file}")

        # Suggest loop optimization
        print("\n=== Loop Optimization Tips ===")
        print("To make the video loop seamlessly, you may need to:")
        print("1. Trim the start/end to remove non-loopable parts")
        print("2. Use ffmpeg to create a perfect loop:")
        print(f"   ffmpeg -i {output_file} -filter_complex \"[0:v]reverse[r];[0:v][r]concat=n=2:v=1[v]\" -map \"[v]\" {action}_loop.mp4")
        print("3. Test the loop in your application")

        return True

    except subprocess.CalledProcessError as e:
        print(f"\n✗ Download failed: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Search and download loopable action videos for Smootie",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # RECOMMENDED: Search for multi-action source videos
  python search_videos.py --search-source

  # Download a source video to a new set
  python search_videos.py --download-source --url "https://youtube.com/watch?v=..." --set myset

  # Split source video into action clips (after watching and noting timestamps)
  python search_videos.py --split --source videos/myset/source.mp4 --timestamps "0:00-0:05=idle,0:06-0:12=walk,0:13-0:18=jump"

  # List all available actions
  python search_videos.py --list-actions

  # Search for individual action videos (less reliable for cohesive sets)
  python search_videos.py --action standing --preview-only

  # Download individual video
  python search_videos.py --action walking --download --url "https://youtube.com/watch?v=..." --set myset

IMPORTANT: Video Sets
  - Videos should be grouped into cohesive sets (same person, background, style)
  - The BEST way to get cohesive sets is to find a multi-action source video
    and split it into individual clips using --split
  - Use --set to specify which set to download to
  - Each set is a subdirectory under videos/ (e.g., videos/default/, videos/myset/)
        """
    )

    parser.add_argument("--list-actions", action="store_true",
                       help="List all available action categories")
    parser.add_argument("--search-source", action="store_true",
                       help="Search for multi-action source videos (RECOMMENDED)")
    parser.add_argument("--download-source", action="store_true",
                       help="Download a multi-action source video")
    parser.add_argument("--split", action="store_true",
                       help="Split a source video into action clips")
    parser.add_argument("--source", type=str,
                       help="Path to source video for splitting")
    parser.add_argument("--timestamps", type=str,
                       help="Timestamps for splitting: '0:00-0:05=idle,0:06-0:12=walk'")
    parser.add_argument("--action", type=str,
                       help="Action to search for (individual search)")
    parser.add_argument("--preview-only", action="store_true",
                       help="Only search and preview results, don't download")
    parser.add_argument("--download", action="store_true",
                       help="Download the video")
    parser.add_argument("--url", type=str,
                       help="Specific video URL to download")
    parser.add_argument("--output-dir", type=str, default="videos",
                       help="Output directory for downloaded videos (default: videos)")
    parser.add_argument("--set", type=str, default="default",
                       help="Video set name (subdirectory for cohesive video sets, default: default)")

    args = parser.parse_args()

    # Check dependencies
    if not check_dependencies():
        sys.exit(1)

    # Search for multi-action source videos (RECOMMENDED)
    if args.search_source:
        search_source_videos()
        return

    # Download source video
    if args.download_source:
        if not args.url:
            print("Error: --url is required for --download-source")
            sys.exit(1)
        if args.set == "default":
            print("Warning: Consider using --set <name> to create a new video set")
        download_source_video(args.url, args.set, args.output_dir)
        return

    # Split source video
    if args.split:
        if not args.source:
            print("Error: --source is required for --split")
            sys.exit(1)
        if not args.timestamps:
            print("Error: --timestamps is required for --split")
            print("Format: '0:00-0:05=idle,0:06-0:12=walk,0:13-0:18=jump'")
            sys.exit(1)
        split_source_video(args.source, args.timestamps)
        return

    # List actions
    if args.list_actions:
        list_actions()
        return

    # Validate action for individual search
    if not args.action:
        parser.print_help()
        print("\nRecommended: Use --search-source to find multi-action videos")
        print("Or use --action <name> for individual action search")
        sys.exit(1)

    # Search for videos
    if args.preview_only or not args.url:
        results = search_videos(args.action, preview_only=args.preview_only)

        if not results:
            print("No suitable videos found. Try:")
            print("1. Use --search-source to find multi-action source videos")
            print("2. Search manually on YouTube/Pexels/Mixkit")
            print("3. Create custom videos")
            return

        if not args.download:
            print("\nTo download a video, use:")
            print(f"  python search_videos.py --action {args.action} --download --url <VIDEO_URL>")
            return

    # Download video
    if args.download:
        if not args.url:
            print("Error: --url is required for download")
            print("First search for videos, then download with --url")
            sys.exit(1)

        download_video(args.url, args.action, args.output_dir, args.set)


if __name__ == "__main__":
    main()
