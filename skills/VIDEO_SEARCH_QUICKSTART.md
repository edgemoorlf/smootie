# Video Search Skill - Quick Start

## Installation

```bash
# Install video search dependencies
pip install -r requirements-video-search.txt

# Or install directly
pip install yt-dlp
```

## Quick Commands

### 1. List Available Actions
```bash
python search_videos.py --list-actions
```

### 2. Search for Videos
```bash
# Search for walking videos
python search_videos.py --action walking --preview-only

# Search for jumping videos
python search_videos.py --action jumping --preview-only

# Search for standing videos
python search_videos.py --action standing --preview-only
```

### 3. Download Videos
```bash
# Download a specific video
python search_videos.py --action walking --download --url "https://youtube.com/watch?v=VIDEO_ID"

# Download to custom directory
python search_videos.py --action jumping --download --url "URL" --output-dir custom_videos
```

### 4. Interactive Mode
```bash
# Use the interactive script
./video_search.sh
```

## Workflow Example

### Complete workflow for adding a new "walking" video:

```bash
# Step 1: Search for videos
python search_videos.py --action walking --preview-only

# Step 2: Pick a video from results and download
python search_videos.py --action walking --download --url "https://youtube.com/watch?v=XXXXX"

# Step 3: Check the downloaded video
ls -lh videos/walking.mp4

# Step 4: Test if it loops well (open in video player)
open videos/walking.mp4  # macOS
# or
xdg-open videos/walking.mp4  # Linux

# Step 5: If needed, trim to perfect loop point
ffmpeg -i videos/walking.mp4 -ss 00:00:02 -to 00:00:08 -c copy videos/walking_final.mp4

# Step 6: Replace original with trimmed version
mv videos/walking_final.mp4 videos/walking.mp4

# Step 7: Update app.js to include new video
# Add 'walking.mp4' to videoFiles array
# Add voice commands to commandMap

# Step 8: Test in browser
python app.py
# Open http://localhost:5001
```

## Common Use Cases

### Use Case 1: Replace existing video with better quality

```bash
# Search for better jump video
python search_videos.py --action jumping --preview-only

# Download new video
python search_videos.py --action jumping --download --url "NEW_VIDEO_URL"

# Backup old video
mv videos/jump.mov videos/jump.mov.backup

# Rename new video
mv videos/jumping.mp4 videos/jump.mov

# Test in application
```

### Use Case 2: Add completely new action

```bash
# 1. Search for the action
python search_videos.py --action dancing --preview-only

# 2. Download video
python search_videos.py --action dancing --download --url "VIDEO_URL"

# 3. Update app.js
# Add to videoFiles array:
#   this.videoFiles = ['idle.mov', 'jump.mov', 'circle.mov', 'dancing.mp4'];
# Add to commandMap:
#   'dance': 'dancing.mp4',
#   '跳舞': 'dancing.mp4',

# 4. Update HTML (templates/index.html)
# Add to command list:
#   <li><strong>跳舞 / dance</strong> → dancing.mp4</li>

# 5. Test
python app.py
```

### Use Case 3: Create transition videos

```bash
# Search for sit-to-stand transition
python search_videos.py --action sit_to_stand --preview-only

# Download
python search_videos.py --action sit_to_stand --download --url "VIDEO_URL"

# This creates a one-time transition video (not looped)
# Use for transitioning between states
```

## Video Processing Tips

### Make video loop seamlessly

```bash
# Method 1: Find loop point manually
# 1. Open video in editor (e.g., VLC, QuickTime)
# 2. Find where action repeats (e.g., at 2.5s and 7.5s)
# 3. Trim to that range
ffmpeg -i videos/walking.mp4 -ss 00:00:02.5 -to 00:00:07.5 -c copy videos/walking_loop.mp4

# Method 2: Create ping-pong loop (forward then reverse)
ffmpeg -i videos/walking.mp4 \
    -filter_complex "[0:v]reverse[r];[0:v][r]concat=n=2:v=1[v]" \
    -map "[v]" videos/walking_pingpong.mp4

# Method 3: Crossfade beginning and end
ffmpeg -i videos/walking.mp4 \
    -filter_complex "[0:v]split[v1][v2];[v1]trim=start=0:end=1[start];[v2]trim=start=9:end=10[end];[end][start]xfade=transition=fade:duration=0.5:offset=0.5[v]" \
    -map "[v]" videos/walking_crossfade.mp4
```

### Optimize video for web

```bash
# Reduce file size while maintaining quality
ffmpeg -i videos/walking.mp4 \
    -vf scale=1280:720 \
    -c:v libx264 \
    -crf 23 \
    -preset slow \
    -an \
    videos/walking_optimized.mp4

# For mobile (smaller size)
ffmpeg -i videos/walking.mp4 \
    -vf scale=854:480 \
    -c:v libx264 \
    -crf 28 \
    -preset fast \
    -an \
    videos/walking_mobile.mp4
```

### Convert video format

```bash
# Convert MOV to MP4
ffmpeg -i input.mov -c:v libx264 -c:a aac output.mp4

# Convert AVI to MP4
ffmpeg -i input.avi -c:v libx264 -c:a aac output.mp4

# Convert WebM to MP4
ffmpeg -i input.webm -c:v libx264 -c:a aac output.mp4
```

## Troubleshooting

### Problem: "yt-dlp: command not found"

**Solution:**
```bash
pip install yt-dlp
# or
pip3 install yt-dlp
```

### Problem: "ffmpeg: command not found"

**Solution:**
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### Problem: "No suitable videos found"

**Solution:**
1. Try different search keywords
2. Search manually on Pexels/Mixkit
3. Adjust duration preferences in script
4. Try YouTube with different search terms

### Problem: Downloaded video doesn't loop well

**Solution:**
1. Use video editor to find exact loop point
2. Trim video to loop point with ffmpeg
3. Try ping-pong loop method
4. Consider downloading different video

### Problem: Video file is too large

**Solution:**
```bash
# Check current size
ls -lh videos/walking.mp4

# Compress video
ffmpeg -i videos/walking.mp4 -crf 28 videos/walking_compressed.mp4

# Compare sizes
ls -lh videos/walking*.mp4
```

### Problem: Video has wrong aspect ratio

**Solution:**
```bash
# Crop to 16:9
ffmpeg -i input.mp4 -vf "crop=ih*16/9:ih" output.mp4

# Scale and pad to 16:9
ffmpeg -i input.mp4 -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" output.mp4
```

## Best Practices

### 1. Video Selection
- ✅ Choose videos with clean backgrounds
- ✅ Prefer videos shot on tripod (no camera movement)
- ✅ Look for "loop" or "seamless" in title
- ✅ Check video duration (2-30 seconds ideal)
- ✅ Verify license allows your use case

### 2. File Organization
```
videos/
├── original/          # Keep original downloads
│   ├── walking_raw.mp4
│   └── jumping_raw.mp4
├── processed/         # Processed/trimmed versions
│   ├── walking_loop.mp4
│   └── jumping_loop.mp4
└── final/            # Final versions used in app
    ├── walking.mp4
    └── jumping.mp4
```

### 3. Testing
- Test video in browser before adding to app
- Check loop quality by playing on repeat
- Test on both desktop and mobile
- Verify file size is reasonable (<5MB per video)

### 4. Documentation
Keep track of video sources in `VIDEO_CREDITS.md`:
```markdown
## walking.mp4
- Source: Pexels
- URL: https://www.pexels.com/video/12345/
- License: Pexels License
- Author: John Doe
- Downloaded: 2026-01-26
- Modifications: Trimmed to 5s loop
```

## Advanced Usage

### Batch download multiple videos

Create `batch_download.sh`:
```bash
#!/bin/bash

# Array of actions and URLs
declare -A videos=(
    ["walking"]="https://youtube.com/watch?v=XXXXX"
    ["running"]="https://youtube.com/watch?v=YYYYY"
    ["jumping"]="https://youtube.com/watch?v=ZZZZZ"
)

# Download each video
for action in "${!videos[@]}"; do
    echo "Downloading: $action"
    python search_videos.py --action "$action" --download --url "${videos[$action]}"
    echo "---"
done

echo "All videos downloaded!"
```

### Automated video processing pipeline

Create `process_pipeline.sh`:
```bash
#!/bin/bash

INPUT_DIR="videos/original"
OUTPUT_DIR="videos/final"

mkdir -p "$OUTPUT_DIR"

for video in "$INPUT_DIR"/*.mp4; do
    filename=$(basename "$video" .mp4)

    echo "Processing: $filename"

    # 1. Optimize format
    ffmpeg -i "$video" \
        -vf scale=1280:720 \
        -c:v libx264 \
        -crf 23 \
        -preset slow \
        -an \
        "$OUTPUT_DIR/${filename}_optimized.mp4" \
        -y

    # 2. Create thumbnail
    ffmpeg -i "$OUTPUT_DIR/${filename}_optimized.mp4" \
        -vframes 1 \
        -f image2 \
        "$OUTPUT_DIR/${filename}_thumb.jpg" \
        -y

    echo "✓ Completed: $filename"
done
```

## Integration with Smootie

### After downloading videos:

1. **Update JavaScript** (`static/app.js`):
```javascript
// Add to videoFiles array
this.videoFiles = [
    'idle.mov',
    'jump.mov',
    'circle.mov',
    'walking.mp4',  // New video
    'running.mp4'   // New video
];

// Add to commandMap
this.commandMap = {
    // ... existing commands ...
    'walk': 'walking.mp4',
    '走': 'walking.mp4',
    'run': 'running.mp4',
    '跑': 'running.mp4',
};
```

2. **Update HTML** (`templates/index.html`):
```html
<div class="commands">
    <h3>语音指令:</h3>
    <ul>
        <li><strong>跳 / jump</strong> → jump.mov</li>
        <li><strong>转 / circle</strong> → circle.mov</li>
        <li><strong>停 / stop</strong> → idle.mov</li>
        <li><strong>走 / walk</strong> → walking.mp4</li>
        <li><strong>跑 / run</strong> → running.mp4</li>
    </ul>
</div>
```

3. **Update manual controls** (if desired):
```html
<div class="button-group">
    <button class="action-btn jump-btn" data-video="jump.mov">跳 Jump</button>
    <button class="action-btn circle-btn" data-video="circle.mov">转 Circle</button>
    <button class="action-btn stop-btn" data-video="idle.mov">停 Stop</button>
    <button class="action-btn walk-btn" data-video="walking.mp4">走 Walk</button>
    <button class="action-btn run-btn" data-video="running.mp4">跑 Run</button>
</div>
```

4. **Test the application**:
```bash
python app.py
# Open http://localhost:5001
# Test voice commands and manual buttons
```

## Resources

### Documentation
- `VIDEO_SEARCH_GUIDE.md` - Complete guide to finding videos
- `VIDEO_COMMANDS_REFERENCE.md` - Command mapping reference
- `VIDEO_EXAMPLES.md` - Specific video examples and links

### Tools
- `search_videos.py` - Main search and download script
- `video_search.sh` - Interactive menu script
- `requirements-video-search.txt` - Python dependencies

### External Resources
- **yt-dlp docs**: https://github.com/yt-dlp/yt-dlp
- **ffmpeg docs**: https://ffmpeg.org/documentation.html
- **Pexels**: https://www.pexels.com/videos/
- **Mixkit**: https://mixkit.co/free-stock-video/

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the full guide in `VIDEO_SEARCH_GUIDE.md`
3. Check video examples in `VIDEO_EXAMPLES.md`
4. Verify dependencies are installed correctly
5. Try manual download from video sites

## Next Steps

1. **Install dependencies**:
   ```bash
   pip install -r requirements-video-search.txt
   ```

2. **Explore available actions**:
   ```bash
   python search_videos.py --list-actions
   ```

3. **Search for your first video**:
   ```bash
   python search_videos.py --action walking --preview-only
   ```

4. **Download and test**:
   ```bash
   python search_videos.py --action walking --download --url "VIDEO_URL"
   ```

5. **Integrate into Smootie**:
   - Update app.js
   - Update index.html
   - Test voice commands

Happy video hunting! 🎥
