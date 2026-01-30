# Video Search Skill - Complete Package

## 📦 What's Included

This skill provides everything you need to find, download, and integrate loopable action videos into Smootie.

### Core Tools

1. **search_videos.py** - Main Python script for searching and downloading videos
   - Search YouTube for action videos
   - Filter by duration and quality
   - Download videos with yt-dlp
   - Support for 14+ action categories

2. **video_search.sh** - Interactive bash menu
   - User-friendly interface
   - Quick access to common tasks
   - Automatic dependency checking

3. **requirements-video-search.txt** - Python dependencies
   - yt-dlp for video downloading

### Documentation

1. **VIDEO_SEARCH_QUICKSTART.md** - Start here!
   - Quick installation
   - Common commands
   - Workflow examples
   - Troubleshooting

2. **VIDEO_SEARCH_GUIDE.md** - Complete guide
   - Detailed instructions
   - Video requirements
   - Best sources
   - Processing techniques
   - Legal considerations

3. **VIDEO_COMMANDS_REFERENCE.md** - Integration reference
   - Command mapping suggestions
   - app.js update examples
   - Video processing commands
   - Batch processing scripts

4. **VIDEO_EXAMPLES.md** - Specific examples
   - Direct links to good videos
   - YouTube channel recommendations
   - Processing examples
   - Common issues and solutions

5. **VIDEO_CREDITS.md** - License tracking
   - Template for tracking video sources
   - License type reference
   - Attribution guidelines
   - Legal compliance checklist

6. **videos/README.md** - Directory guide
   - Current videos list
   - Adding new videos
   - Processing tips
   - Organization structure

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install yt-dlp
pip install -r requirements-video-search.txt

# Install ffmpeg (for video processing)
# macOS:
brew install ffmpeg

# Ubuntu/Debian:
sudo apt install ffmpeg
```

### 2. List Available Actions

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

### 3. Search for Videos

```bash
# Search for walking videos
python search_videos.py --action walking --preview-only
```

### 4. Download a Video

```bash
# Download specific video
python search_videos.py --action walking --download --url "https://youtube.com/watch?v=VIDEO_ID"
```

### 5. Integrate into Smootie

Update `static/app.js`:
```javascript
// Add to videoFiles array
this.videoFiles = ['idle.mov', 'jump.mov', 'circle.mov', 'walking.mp4'];

// Add to commandMap
this.commandMap = {
    // ... existing commands ...
    'walk': 'walking.mp4',
    '走': 'walking.mp4',
};
```

## 📋 Action Categories

### Static Actions (Idle/Looping Poses with Natural Movement)
- **standing** - Idle standing with natural breathing and subtle movements
- **sitting** - Idle sitting with natural breathing and slight movements

**Note**: "Static" doesn't mean frozen! These should show natural idle behavior like breathing, slight body sway, blinking, and small weight shifts. The person should look alive and relaxed, not like a statue.

### Dynamic Actions (Repeating Movements)
- **walking** - Walking cycle
- **running** - Running/jogging
- **jumping** - Jumping motion
- **dancing** - Dance moves
- **waving** - Hand waving

### Transition Actions (One-time Movements)
- **stand_to_sit** - Standing → Sitting
- **sit_to_stand** - Sitting → Standing
- **stand_to_walk** - Standing → Walking
- **walk_to_stand** - Walking → Standing

## 🎯 Video Requirements

### Technical Specs
- **Format**: MP4 or MOV
- **Duration**: 2-30 seconds
- **Resolution**: 720p or higher (1280x720 recommended)
- **Frame Rate**: 30fps or 60fps
- **File Size**: Under 5MB per video
- **Audio**: Not required (will be muted)

### Quality Requirements
- ✅ Real human actors (not animated/CGI)
- ✅ Clean, simple background
- ✅ Stable camera (no movement)
- ✅ Full body or upper body visible
- ✅ Consistent lighting
- ✅ Loopable (starts and ends in similar position)

### Avoid
- ❌ Camera shake or movement
- ❌ Complex backgrounds
- ❌ Changing lighting
- ❌ Partial body shots
- ❌ Low resolution
- ❌ Watermarks (unless acceptable)

## 🌐 Best Video Sources

### Free Stock Video Sites
1. **Pexels Videos** - https://www.pexels.com/videos/
   - Free, no attribution required
   - High quality
   - Good selection

2. **Mixkit** - https://mixkit.co/free-stock-video/
   - Free video clips
   - No attribution required
   - Easy to use

3. **Pixabay Videos** - https://pixabay.com/videos/
   - Free stock videos
   - Large library
   - Various categories

4. **Videvo** - https://www.videvo.net/
   - Free and premium
   - Good quality
   - Regular updates

### YouTube Search Tips
- Search: "person [action] loop green screen"
- Search: "[action] cycle reference real person"
- Search: "human motion reference footage"
- Look for "animation reference" channels
- Filter by duration (under 4 minutes)

## 🛠️ Common Workflows

### Workflow 1: Add New Action Video

```bash
# 1. Search
python search_videos.py --action walking --preview-only

# 2. Download
python search_videos.py --action walking --download --url "VIDEO_URL"

# 3. Test loop
open videos/walking.mp4  # macOS
# or
xdg-open videos/walking.mp4  # Linux

# 4. Optimize if needed
ffmpeg -i videos/walking.mp4 -ss 00:00:02 -to 00:00:08 -c copy videos/walking_loop.mp4

# 5. Update app.js
# Add to videoFiles and commandMap

# 6. Test in browser
python app.py
```

### Workflow 2: Replace Existing Video

```bash
# 1. Backup current video
cp videos/jump.mov videos/jump.mov.backup

# 2. Search for better video
python search_videos.py --action jumping --preview-only

# 3. Download new video
python search_videos.py --action jumping --download --url "NEW_VIDEO_URL"

# 4. Rename to match existing
mv videos/jumping.mp4 videos/jump.mov

# 5. Test
python app.py
```

### Workflow 3: Batch Download Multiple Videos

```bash
# Create download script
cat > download_all.sh << 'EOF'
#!/bin/bash
python search_videos.py --action walking --download --url "URL1"
python search_videos.py --action running --download --url "URL2"
python search_videos.py --action dancing --download --url "URL3"
EOF

chmod +x download_all.sh
./download_all.sh
```

## 🔧 Video Processing

### Make Video Loop Seamlessly

```bash
# Method 1: Trim to loop point
ffmpeg -i input.mp4 -ss 00:00:02 -to 00:00:08 -c copy output.mp4

# Method 2: Ping-pong loop (forward then reverse)
ffmpeg -i input.mp4 -filter_complex "[0:v]reverse[r];[0:v][r]concat=n=2:v=1[v]" -map "[v]" output.mp4

# Method 3: Crossfade loop
ffmpeg -i input.mp4 -filter_complex "[0:v]split[v1][v2];[v1]trim=start=0:end=1[start];[v2]trim=start=9:end=10[end];[end][start]xfade=transition=fade:duration=0.5:offset=0.5[v]" -map "[v]" output.mp4
```

### Optimize for Web

```bash
# Reduce file size
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -crf 23 -preset slow -an output.mp4

# For mobile (smaller)
ffmpeg -i input.mp4 -vf scale=854:480 -c:v libx264 -crf 28 -preset fast -an output_mobile.mp4
```

### Convert Format

```bash
# MOV to MP4
ffmpeg -i input.mov -c:v libx264 -c:a aac output.mp4

# Any format to optimized MP4
ffmpeg -i input.* -c:v libx264 -crf 23 -preset slow -an output.mp4
```

## 📚 Documentation Structure

```
VIDEO_SEARCH_QUICKSTART.md    ← Start here for quick setup
    ↓
VIDEO_SEARCH_GUIDE.md         ← Complete detailed guide
    ↓
VIDEO_COMMANDS_REFERENCE.md   ← Integration and commands
    ↓
VIDEO_EXAMPLES.md             ← Specific examples and links
    ↓
VIDEO_CREDITS.md              ← Track licenses and sources
```

## ⚠️ Important Notes

### Legal Compliance
- Always check video licenses
- Track sources in VIDEO_CREDITS.md
- Provide attribution if required
- Verify commercial use is allowed
- Keep backup of license documentation

### File Management
- Keep original downloads in `videos/original/`
- Process videos in `videos/processed/`
- Final versions in `videos/` root
- Videos are excluded from git (.gitignore)

### Performance
- Keep videos under 5MB each
- Use 720p resolution for balance
- Remove audio tracks (not needed)
- Test on mobile devices
- Preload all videos for smooth switching

## 🐛 Troubleshooting

### "yt-dlp not found"
```bash
pip install yt-dlp
# or
pip3 install yt-dlp
```

### "ffmpeg not found"
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### "No suitable videos found"
- Try different search keywords
- Search manually on Pexels/Mixkit
- Adjust duration preferences in script
- Try YouTube with different terms

### "Video doesn't loop smoothly"
- Use video editor to find exact loop point
- Trim with ffmpeg
- Try ping-pong loop method
- Consider different video

### "Video file too large"
```bash
# Compress video
ffmpeg -i input.mp4 -crf 28 output.mp4

# Check size
ls -lh videos/*.mp4
```

## 🎓 Learning Resources

### Tools Documentation
- **yt-dlp**: https://github.com/yt-dlp/yt-dlp
- **ffmpeg**: https://ffmpeg.org/documentation.html
- **Video editing**: https://shotcut.org/

### Video Sources
- **Pexels**: https://www.pexels.com/videos/
- **Mixkit**: https://mixkit.co/free-stock-video/
- **Pixabay**: https://pixabay.com/videos/

### Tutorials
- Search: "seamless video loop tutorial"
- Search: "ffmpeg video processing"
- Search: "finding stock footage"

## 📞 Support

If you need help:
1. Check VIDEO_SEARCH_QUICKSTART.md
2. Review troubleshooting sections
3. Read VIDEO_SEARCH_GUIDE.md
4. Check VIDEO_EXAMPLES.md for specific cases
5. Verify dependencies are installed

## ✅ Next Steps

1. **Install dependencies**:
   ```bash
   pip install -r requirements-video-search.txt
   brew install ffmpeg  # or apt install ffmpeg
   ```

2. **Test the tool**:
   ```bash
   python search_videos.py --list-actions
   ```

3. **Search for your first video**:
   ```bash
   python search_videos.py --action walking --preview-only
   ```

4. **Download and integrate**:
   ```bash
   python search_videos.py --action walking --download --url "VIDEO_URL"
   ```

5. **Update Smootie**:
   - Edit static/app.js
   - Edit templates/index.html
   - Test voice commands

## 🎉 Summary

You now have a complete video search and download system with:
- ✅ Automated search tool
- ✅ 14+ action categories
- ✅ Comprehensive documentation
- ✅ Processing examples
- ✅ Integration guides
- ✅ License tracking
- ✅ Troubleshooting help

Happy video hunting! 🎥
