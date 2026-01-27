# Video Search and Download Guide

This guide helps you find and download suitable loopable action videos for Smootie.

## Quick Start

```bash
# Install dependencies
pip install yt-dlp

# List available actions
python search_videos.py --list-actions

# Search for videos
python search_videos.py --action standing --preview-only

# Download a specific video
python search_videos.py --action standing --download --url "https://youtube.com/watch?v=..."
```

## Video Requirements

### 1. **Loopable**
   - Video should start and end in similar positions
   - Seamless loop when played repeatedly
   - No abrupt cuts or transitions at start/end

### 2. **Specific Actions**
   - **Static/Idle**: standing idle with breathing, sitting idle with slight movements
   - **Dynamic**: walking, running, jumping, dancing, waving
   - **Transitions**: stand↔sit, stand↔walk, walk↔stand

### 3. **Real Humans**
   - Actual human actors (not animated/CGI)
   - Clear, visible full body or upper body
   - Consistent lighting and background

### 4. **Technical Quality**
   - Duration: 2-30 seconds
   - Resolution: 720p or higher
   - Format: MP4 preferred
   - Clean background (solid color, green screen, or minimal)

## Best Sources for Videos

### Free Stock Video Sites

1. **Pexels Videos** (https://www.pexels.com/videos/)
   - Free, no attribution required
   - High quality stock footage
   - Search terms: "person standing", "walking loop", "sitting idle"

2. **Mixkit** (https://mixkit.co/free-stock-video/)
   - Free video clips
   - Good selection of people actions
   - Search: "person", "human action", "walking"

3. **Pixabay Videos** (https://pixabay.com/videos/)
   - Free stock videos
   - Search: "person standing", "human walking"

4. **Videvo** (https://www.videvo.net/)
   - Free and premium stock footage
   - Filter by "people" category

### YouTube Channels

Search for these types of channels:
- Motion capture reference videos
- Animation reference footage
- Acting reference for animators
- Green screen stock footage
- Fitness/exercise demonstrations (for dynamic actions)

**Example search queries:**
```
"person standing loop green screen"
"walking cycle reference real person"
"sitting idle animation reference"
"human motion reference footage"
"green screen person standing"
```

### Professional Motion Capture Libraries

For higher quality (may require purchase):
- **Mixamo** (Adobe) - Has some free content
- **TurboSquid** - 3D and video references
- **CGTrader** - Motion capture data and videos

## Using the Search Script

### List All Actions

```bash
python search_videos.py --list-actions
```

Output:
```
STATIC ACTIONS:
  • standing              - Person standing in neutral position
  • sitting               - Person sitting in neutral position

DYNAMIC ACTIONS:
  • walking               - Person walking (can be in place or on treadmill)
  • running               - Person running or jogging
  • jumping               - Person jumping
  • dancing               - Person dancing
  • waving                - Person waving hand

TRANSITION ACTIONS:
  • stand_to_sit          - Transition from standing to sitting
  • sit_to_stand          - Transition from sitting to standing
  • stand_to_walk         - Transition from standing to walking
  • walk_to_stand         - Transition from walking to standing
```

### Search for Videos

```bash
# Preview search results
python search_videos.py --action walking --preview-only
```

This will:
1. Search YouTube for relevant videos
2. Filter by duration (2-30 seconds)
3. Show top 10 results sorted by views
4. Display title, duration, views, and URL

### Download Videos

```bash
# Download a specific video
python search_videos.py --action walking --download --url "https://youtube.com/watch?v=VIDEO_ID"

# Specify output directory
python search_videos.py --action jumping --download --url "URL" --output-dir custom_videos
```

## Making Videos Loop Seamlessly

### Method 1: Trim to Loop Point

Find the frame where the action repeats and trim:

```bash
# Trim video to loop point (example: 2s to 8s)
ffmpeg -i walking.mp4 -ss 00:00:02 -to 00:00:08 -c copy walking_loop.mp4
```

### Method 2: Reverse and Concatenate

Create a ping-pong loop (forward then backward):

```bash
ffmpeg -i input.mp4 -filter_complex "[0:v]reverse[r];[0:v][r]concat=n=2:v=1[v]" -map "[v]" output_loop.mp4
```

### Method 3: Crossfade Loop

Blend the end into the beginning:

```bash
ffmpeg -i input.mp4 -filter_complex "[0:v]split[v1][v2];[v1]trim=start=0:end=1[start];[v2]trim=start=9:end=10[end];[end][start]xfade=transition=fade:duration=0.5:offset=0.5[v]" -map "[v]" output_loop.mp4
```

### Method 4: Use Video Editing Software

- **DaVinci Resolve** (Free) - Professional video editor
- **Shotcut** (Free) - Simple and effective
- **Adobe Premiere Pro** (Paid) - Industry standard

## Tips for Finding Good Videos

### Search Keywords

**For static/idle poses:**
- "person standing idle breathing"
- "human standing natural breathing loop"
- "character idle animation breathing"
- "person sitting idle subtle movement"
- "person standing relaxed breathing"

**For dynamic actions:**
- "walking cycle seamless loop"
- "person walking treadmill"
- "running in place loop"
- "jumping jacks loop"

**For transitions:**
- "person sitting down motion"
- "standing up animation reference"
- "start walking from standing"

### Quality Checklist

✅ **Good Video Characteristics:**
- Clean, simple background
- Consistent lighting
- Stable camera (no movement)
- Full body visible
- Clear action
- Natural movement
- Good resolution (720p+)

❌ **Avoid:**
- Camera shake or movement
- Complex backgrounds
- Changing lighting
- Partial body shots
- Unnatural movements
- Low resolution
- Watermarks (unless acceptable)

## Example Workflow

1. **Search for videos:**
   ```bash
   python search_videos.py --action standing --preview-only
   ```

2. **Review results and pick a video**

3. **Download the video:**
   ```bash
   python search_videos.py --action standing --download --url "https://youtube.com/watch?v=..."
   ```

4. **Test the loop:**
   - Open in video player
   - Enable loop/repeat
   - Check if it loops smoothly

5. **Optimize if needed:**
   ```bash
   # Trim to perfect loop point
   ffmpeg -i videos/standing.mp4 -ss 00:00:01 -to 00:00:05 -c copy videos/standing_final.mp4
   ```

6. **Add to Smootie:**
   - Place in `videos/` directory
   - Update command map in `app.js` if needed
   - Test with voice commands

## Alternative: Create Your Own Videos

If you can't find suitable videos, consider creating your own:

### Equipment Needed:
- Smartphone or camera
- Tripod (for stable shots)
- Good lighting
- Plain background (or green screen)

### Recording Tips:
1. Set up camera on tripod
2. Frame full body in shot
3. Record 10-15 seconds of action
4. Start and end in same position (for loops)
5. Keep movements consistent
6. Record multiple takes

### Editing:
1. Import to video editor
2. Trim to best take
3. Find loop point
4. Export as MP4
5. Test loop

## Troubleshooting

### "yt-dlp not found"
```bash
pip install yt-dlp
# or
pip3 install yt-dlp
```

### "ffmpeg not found"
- **macOS**: `brew install ffmpeg`
- **Ubuntu/Debian**: `sudo apt install ffmpeg`
- **Windows**: Download from https://ffmpeg.org/download.html

### "No suitable videos found"
- Try different action keywords
- Search manually on Pexels/Mixkit
- Adjust duration preferences in script
- Consider creating custom videos

### "Video doesn't loop smoothly"
- Use ffmpeg to trim to exact loop point
- Try reverse concatenation method
- Use crossfade transition
- Record new video with better loop points

## Legal Considerations

### Copyright and Licensing:
- ✅ Use videos with Creative Commons licenses
- ✅ Use royalty-free stock footage
- ✅ Create your own videos
- ✅ Get permission from video creators
- ❌ Don't use copyrighted content without permission
- ❌ Check license terms for commercial use

### Attribution:
- Some free videos require attribution
- Check license terms on each platform
- Keep track of video sources
- Add credits if required

## Advanced: Batch Processing

Download multiple actions at once:

```bash
#!/bin/bash
# download_all.sh

actions=("standing" "sitting" "walking" "jumping")

for action in "${actions[@]}"; do
    echo "Searching for: $action"
    python search_videos.py --action "$action" --preview-only
    echo "---"
done
```

## Resources

### Video Sources:
- https://www.pexels.com/videos/
- https://mixkit.co/free-stock-video/
- https://pixabay.com/videos/
- https://www.videvo.net/

### Tools:
- yt-dlp: https://github.com/yt-dlp/yt-dlp
- ffmpeg: https://ffmpeg.org/
- DaVinci Resolve: https://www.blackmagicdesign.com/products/davinciresolve

### Learning:
- ffmpeg documentation: https://ffmpeg.org/documentation.html
- Video loop tutorials: Search "seamless video loop tutorial"
- Motion reference: https://www.youtube.com/c/EndlessReference

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify dependencies are installed
3. Try manual download from video sites
4. Consider creating custom videos
5. Open an issue on the project repository
