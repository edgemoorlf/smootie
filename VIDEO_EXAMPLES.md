# Example Videos Collection

This document provides direct links and examples of suitable videos for each action category.

## Free Stock Video Examples

### Static Actions

#### Standing / Idle
**Good Examples:**
- Pexels: Search "person standing breathing"
  - https://www.pexels.com/search/videos/person%20standing%20breathing/
- Mixkit: "Person standing idle"
  - https://mixkit.co/free-stock-video/person-standing/
- YouTube: "idle standing breathing animation reference"

**Characteristics:**
- Person in neutral standing position
- **Natural breathing visible** (chest/shoulder movement)
- Slight weight shifts or body sway
- Blinking and micro-movements
- Clean background
- 3-10 seconds duration
- Feels alive, not frozen like a statue

**What to look for:**
- ✅ Visible breathing motion (chest rises and falls)
- ✅ Natural body sway (slight)
- ✅ Relaxed posture
- ✅ Blinking
- ✅ Small weight shifts
- ❌ NOT completely frozen/still
- ❌ NOT stiff or unnatural

#### Sitting
**Good Examples:**
- Pexels: "person sitting breathing"
  - https://www.pexels.com/search/videos/person%20sitting%20breathing/
- Mixkit: "Person sitting relaxed"
- YouTube: "sitting idle animation reference"

**Characteristics:**
- Person sitting in chair or on surface
- **Natural breathing visible**
- Relaxed, comfortable position
- Small posture adjustments
- Blinking and subtle movements
- 3-10 seconds duration
- Natural idle behavior

**What to look for:**
- ✅ Breathing motion visible
- ✅ Slight posture adjustments
- ✅ Relaxed state
- ✅ Natural fidgeting (small movements)
- ✅ Blinking
- ❌ NOT completely motionless
- ❌ NOT stiff or uncomfortable looking

### Dynamic Actions

#### Walking
**Good Examples:**
- Pexels: "person walking treadmill"
  - https://www.pexels.com/search/videos/walking%20treadmill/
- YouTube: "walking cycle reference"
  - Search: "person walking loop green screen"
  - Search: "walking treadmill side view"

**Characteristics:**
- Side view or front view
- Consistent walking pace
- Treadmill or walking in place preferred
- 5-15 seconds for full cycle

**Example Search Results:**
```bash
python search_videos.py --action walking --preview-only
```

#### Running
**Good Examples:**
- Pexels: "person running treadmill"
- Mixkit: "jogging exercise"
- YouTube: "running cycle reference"

**Characteristics:**
- Consistent running pace
- Treadmill preferred for loop
- Side view works best
- 5-15 seconds

#### Jumping
**Good Examples:**
- Pexels: "person jumping"
- Mixkit: "jumping jacks"
- YouTube: "jump animation reference"

**Characteristics:**
- Clear jump motion
- Lands in same position
- 2-5 seconds per jump
- Can be single jump or continuous

#### Dancing
**Good Examples:**
- Pexels: "person dancing"
- Mixkit: "dance move"
- YouTube: "dance loop"

**Characteristics:**
- Repeatable dance move
- Consistent rhythm
- 5-10 seconds
- Simple moves work best

#### Waving
**Good Examples:**
- Pexels: "person waving hand"
- YouTube: "waving hello animation reference"

**Characteristics:**
- Clear hand wave motion
- 2-5 seconds
- Returns to neutral position
- Front or side view

### Transition Actions

#### Stand to Sit
**Good Examples:**
- YouTube: "sitting down motion reference"
- Pexels: "person sitting down"

**Characteristics:**
- Starts standing
- Ends sitting
- Smooth transition
- 2-4 seconds

#### Sit to Stand
**Good Examples:**
- YouTube: "standing up motion reference"
- Pexels: "person standing up"

**Characteristics:**
- Starts sitting
- Ends standing
- Smooth transition
- 2-4 seconds

#### Stand to Walk
**Good Examples:**
- YouTube: "start walking animation reference"

**Characteristics:**
- Starts in standing position
- Transitions to walking
- 3-5 seconds

#### Walk to Stand
**Good Examples:**
- YouTube: "stop walking animation reference"

**Characteristics:**
- Starts walking
- Slows down and stops
- Ends in standing position
- 3-5 seconds

## Recommended YouTube Channels

### Animation Reference Channels
1. **EndlessReference**
   - Motion reference videos
   - Various actions and poses
   - High quality footage

2. **Anatomy 360**
   - Human motion reference
   - Multiple angles
   - Professional quality

3. **New Masters Academy**
   - Figure drawing and animation reference
   - Various poses and actions

### Stock Footage Channels
1. **Videvo**
   - Free stock footage
   - People and actions

2. **Motion Array**
   - Stock video clips
   - Some free content

## Specific Video Recommendations

### For Current Smootie Actions

#### Jump (跳)
**Recommended searches:**
```
"person jumping rope loop"
"jump animation reference real person"
"jumping jacks exercise loop"
```

**Example URLs to try:**
- Search on Pexels: https://www.pexels.com/search/videos/jumping/
- Search on Mixkit: https://mixkit.co/free-stock-video/jumping/

#### Circle (转)
**Recommended searches:**
```
"person spinning around loop"
"turning 360 degrees"
"person rotating in place"
```

**Alternative interpretations:**
- Person turning in circle
- Person spinning
- Person doing pirouette

#### Stop/Idle (停)
**Recommended searches:**
```
"person standing idle breathing"
"idle pose natural breathing loop"
"person standing relaxed breathing"
"human idle animation breathing"
```

**Important**: Look for natural idle behavior:
- Visible breathing motion
- Slight body sway
- Natural posture
- Not frozen/stiff

**Alternative interpretations:**
- Person standing idle with breathing
- Person in relaxed neutral pose
- Natural idle stance with subtle movements

## Video Processing Examples

### Example 1: Perfect Loop from Walking Video

```bash
# Download walking video
python search_videos.py --action walking --download --url "VIDEO_URL"

# Find loop point (example: 2s to 8s is one complete cycle)
ffmpeg -i videos/walking.mp4 -ss 00:00:02 -to 00:00:08 -c copy videos/walking_loop.mp4

# Test the loop
# Open in video player and enable repeat
```

### Example 2: Create Seamless Jump Loop

```bash
# Download jump video
python search_videos.py --action jumping --download --url "VIDEO_URL"

# Extract single jump (example: 1s to 3s)
ffmpeg -i videos/jumping.mp4 -ss 00:00:01 -to 00:00:03 -c copy videos/jump_single.mp4

# Create ping-pong loop (up and down)
ffmpeg -i videos/jump_single.mp4 -filter_complex "[0:v]reverse[r];[0:v][r]concat=n=2:v=1[v]" -map "[v]" videos/jump_loop.mp4
```

### Example 3: Optimize for Web

```bash
# Reduce file size for faster loading
ffmpeg -i videos/walking.mp4 \
    -vf scale=1280:720 \
    -c:v libx264 \
    -crf 28 \
    -preset slow \
    -an \
    videos/walking_optimized.mp4
```

## Testing Checklist

After downloading and processing a video:

- [ ] Video plays smoothly
- [ ] Loop point is seamless
- [ ] File size is reasonable (<5MB)
- [ ] Resolution is adequate (720p+)
- [ ] No audio (or muted)
- [ ] Background is clean
- [ ] Action is clear and visible
- [ ] Duration is appropriate (2-30s)
- [ ] Works on mobile devices
- [ ] Loads quickly

## Common Issues and Solutions

### Issue: Video has watermark
**Solution:**
- Use free stock sites (Pexels, Mixkit)
- Crop video to remove watermark (if allowed by license)
- Find alternative video

### Issue: Video doesn't loop smoothly
**Solution:**
```bash
# Method 1: Find exact loop point
# Use video editor to find frame where action repeats
# Trim to that exact point

# Method 2: Crossfade loop
ffmpeg -i input.mp4 -filter_complex \
    "[0:v]split[v1][v2]; \
     [v1]trim=start=0:end=0.5[start]; \
     [v2]trim=start=9.5:end=10[end]; \
     [end][start]xfade=transition=fade:duration=0.5:offset=0[v]" \
    -map "[v]" output.mp4
```

### Issue: Video is too long
**Solution:**
```bash
# Speed up video
ffmpeg -i input.mp4 -filter:v "setpts=0.5*PTS" output.mp4
```

### Issue: Video has wrong orientation
**Solution:**
```bash
# Rotate 90 degrees clockwise
ffmpeg -i input.mp4 -vf "transpose=1" output.mp4

# Rotate 180 degrees
ffmpeg -i input.mp4 -vf "transpose=2,transpose=2" output.mp4
```

### Issue: Background is too busy
**Solution:**
- Use video editing software to blur background
- Find video with cleaner background
- Use green screen video and replace background

## Advanced: Green Screen Videos

If you find green screen videos, you can replace the background:

```bash
# Remove green screen and make transparent
ffmpeg -i input.mp4 -vf "chromakey=green:0.1:0.2" -c:v png output.mov

# Or replace with solid color
ffmpeg -i input.mp4 -vf "chromakey=green:0.1:0.2,format=yuv420p" -c:v libx264 output.mp4
```

## License Compliance

### Always Check:
1. **License type** (CC0, CC-BY, etc.)
2. **Attribution requirements**
3. **Commercial use allowed**
4. **Modifications allowed**

### Keep Records:
Create a `VIDEO_CREDITS.md` file:

```markdown
# Video Credits

## jump.mov
- Source: Pexels
- URL: https://www.pexels.com/video/...
- License: Pexels License (Free to use)
- Author: John Doe
- Downloaded: 2026-01-26

## walking.mov
- Source: Mixkit
- URL: https://mixkit.co/...
- License: Mixkit License (Free to use)
- Downloaded: 2026-01-26
```

## Next Steps

1. **Browse recommended sources:**
   - Visit Pexels, Mixkit, Pixabay
   - Search for specific actions
   - Preview videos before downloading

2. **Use search tool:**
   ```bash
   python search_videos.py --action walking --preview-only
   ```

3. **Download and test:**
   ```bash
   python search_videos.py --action walking --download --url "URL"
   ```

4. **Process and optimize:**
   - Trim to loop points
   - Optimize file size
   - Test in browser

5. **Update application:**
   - Add to videos/ directory
   - Update command map
   - Test voice commands

## Resources

### Video Sources:
- **Pexels**: https://www.pexels.com/videos/
- **Mixkit**: https://mixkit.co/free-stock-video/
- **Pixabay**: https://pixabay.com/videos/
- **Videvo**: https://www.videvo.net/
- **Coverr**: https://coverr.co/

### Tools:
- **yt-dlp**: https://github.com/yt-dlp/yt-dlp
- **ffmpeg**: https://ffmpeg.org/
- **HandBrake**: https://handbrake.fr/ (GUI for video conversion)
- **Shotcut**: https://shotcut.org/ (Free video editor)

### Learning:
- **ffmpeg Cookbook**: https://trac.ffmpeg.org/wiki
- **Video Loop Tutorials**: YouTube search "seamless video loop"
- **Stock Video Tips**: Search "finding stock footage"
