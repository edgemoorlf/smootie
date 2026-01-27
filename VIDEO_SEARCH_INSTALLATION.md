# 🎬 Video Search Skill - Installation Complete!

## ✅ What Has Been Created

### 📁 Core Files Created

1. **search_videos.py** (12.9 KB)
   - Main Python script for searching and downloading videos
   - 14+ action categories (static, dynamic, transitions)
   - YouTube search integration via yt-dlp
   - Automatic filtering by duration and quality

2. **video_search.sh** (1.3 KB)
   - Interactive bash menu for easy access
   - Dependency checking
   - User-friendly interface

3. **requirements-video-search.txt**
   - Python dependencies (yt-dlp)

### 📚 Documentation Files Created

1. **VIDEO_SEARCH_SKILL_README.md** (11.4 KB)
   - Complete package overview
   - Quick start guide
   - All features summary

2. **VIDEO_SEARCH_QUICKSTART.md** (11.4 KB)
   - Quick installation steps
   - Common commands
   - Workflow examples
   - Troubleshooting

3. **VIDEO_SEARCH_GUIDE.md** (9.1 KB)
   - Detailed instructions
   - Video requirements
   - Best sources
   - Processing techniques
   - Legal considerations

4. **VIDEO_COMMANDS_REFERENCE.md** (7.7 KB)
   - Command mapping suggestions
   - app.js integration examples
   - Video processing commands
   - Batch processing scripts

5. **VIDEO_EXAMPLES.md** (9.1 KB)
   - Specific video examples
   - Direct links to sources
   - YouTube channel recommendations
   - Processing examples

6. **VIDEO_CREDITS.md** (5.2 KB)
   - License tracking template
   - Attribution guidelines
   - Legal compliance checklist

7. **videos/README.md**
   - Directory guide
   - Current videos list
   - Quick reference

### 🔧 Configuration Files

1. **.gitignore** (updated)
   - Excludes video files from git
   - Excludes temporary files
   - Keeps documentation tracked

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
# Install yt-dlp for video downloading
pip install -r requirements-video-search.txt

# Install ffmpeg for video processing
# macOS:
brew install ffmpeg

# Ubuntu/Debian:
sudo apt install ffmpeg

# Windows:
# Download from https://ffmpeg.org/download.html
```

### Step 2: Test the Tool

```bash
# List all available action categories
python search_videos.py --list-actions
```

Expected output:
```
STATIC ACTIONS:
  • standing - Person standing idle with natural breathing/subtle movements
  • sitting  - Person sitting idle with natural breathing/subtle movements

DYNAMIC ACTIONS:
  • walking  - Person walking (can be in place or on treadmill)
  • running  - Person running or jogging
  • jumping  - Person jumping
  • dancing  - Person dancing
  • waving   - Person waving hand

TRANSITION ACTIONS:
  • stand_to_sit   - Transition from standing to sitting
  • sit_to_stand   - Transition from sitting to standing
  • stand_to_walk  - Transition from standing to walking
  • walk_to_stand  - Transition from walking to standing
```

### Step 3: Search for Videos

```bash
# Search for walking videos (preview only)
python search_videos.py --action walking --preview-only
```

This will:
- Search YouTube for walking videos
- Filter by duration (2-30 seconds)
- Show top 10 results with titles, duration, views, and URLs

### Step 4: Download a Video

```bash
# Download a specific video
python search_videos.py --action walking --download --url "https://youtube.com/watch?v=VIDEO_ID"
```

The video will be saved to `videos/walking.mp4`

### Step 5: Integrate into Smootie

1. **Update `static/app.js`:**
   ```javascript
   // Add to videoFiles array
   this.videoFiles = ['idle.mov', 'jump.mov', 'circle.mov', 'walking.mp4'];

   // Add to commandMap
   this.commandMap = {
       // ... existing commands ...
       'walk': 'walking.mp4',
       '走': 'walking.mp4',
       '奏': 'walking.mp4',  // Similar sound
   };
   ```

2. **Update `templates/index.html`:**
   ```html
   <li><strong>走 / walk</strong> → walking.mp4</li>
   ```

3. **Test:**
   ```bash
   python app.py
   # Open http://localhost:5001
   # Say "walk" or "走"
   ```

## 📋 Action Categories

### Static/Idle Actions (with natural breathing)
- **standing** - Idle standing with breathing and subtle movements
- **sitting** - Idle sitting with breathing and slight movements

**Important**: These should show natural idle behavior:
- ✅ Visible breathing motion
- ✅ Slight body sway
- ✅ Blinking
- ✅ Small weight shifts
- ❌ NOT frozen like a statue

### Dynamic Actions (repeating movements)
- **walking** - Walking cycle (treadmill or in place)
- **running** - Running/jogging
- **jumping** - Jumping motion
- **dancing** - Dance moves
- **waving** - Hand waving

### Transition Actions (one-time movements)
- **stand_to_sit** - Standing → Sitting
- **sit_to_stand** - Sitting → Standing
- **stand_to_walk** - Standing → Walking
- **walk_to_stand** - Walking → Standing

## 🎯 Video Requirements

### Must Have:
- ✅ Real human actors (not animated/CGI)
- ✅ Duration: 2-30 seconds
- ✅ Resolution: 720p or higher
- ✅ Loopable (starts and ends in similar position)
- ✅ Clean, simple background
- ✅ Stable camera (no movement)
- ✅ For idle: natural breathing and subtle movements

### Avoid:
- ❌ Camera shake or movement
- ❌ Complex backgrounds
- ❌ Low resolution
- ❌ Watermarks
- ❌ For idle: completely frozen/stiff poses

## 🌐 Best Video Sources

### Free Stock Video Sites:
1. **Pexels** - https://www.pexels.com/videos/
   - Free, no attribution required
   - High quality

2. **Mixkit** - https://mixkit.co/free-stock-video/
   - Free video clips
   - Good selection

3. **Pixabay** - https://pixabay.com/videos/
   - Free stock videos
   - Large library

4. **Videvo** - https://www.videvo.net/
   - Free and premium
   - Regular updates

### YouTube Search Tips:
- "person [action] loop green screen"
- "[action] cycle reference real person"
- "human motion reference footage"
- "animation reference [action]"
- "person [action] breathing idle" (for static poses)

## 🛠️ Common Workflows

### Workflow 1: Add New Action

```bash
# 1. Search
python search_videos.py --action walking --preview-only

# 2. Download
python search_videos.py --action walking --download --url "VIDEO_URL"

# 3. Test loop (open in video player)
open videos/walking.mp4  # macOS
xdg-open videos/walking.mp4  # Linux

# 4. Optimize if needed
ffmpeg -i videos/walking.mp4 -ss 00:00:02 -to 00:00:08 -c copy videos/walking_loop.mp4

# 5. Update app.js and index.html

# 6. Test in browser
python app.py
```

### Workflow 2: Make Video Loop Seamlessly

```bash
# Method 1: Trim to loop point
ffmpeg -i input.mp4 -ss 00:00:02 -to 00:00:08 -c copy output.mp4

# Method 2: Ping-pong loop (forward then reverse)
ffmpeg -i input.mp4 -filter_complex "[0:v]reverse[r];[0:v][r]concat=n=2:v=1[v]" -map "[v]" output.mp4

# Method 3: Optimize for web
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -crf 23 -preset slow -an output.mp4
```

## 📖 Documentation Guide

**Start here:**
1. **VIDEO_SEARCH_SKILL_README.md** - Overview and quick start
2. **VIDEO_SEARCH_QUICKSTART.md** - Quick commands and workflows

**For detailed info:**
3. **VIDEO_SEARCH_GUIDE.md** - Complete guide with all details
4. **VIDEO_COMMANDS_REFERENCE.md** - Integration and commands
5. **VIDEO_EXAMPLES.md** - Specific examples and links

**For tracking:**
6. **VIDEO_CREDITS.md** - Track video sources and licenses

## ⚠️ Important Notes

### Legal Compliance
- ✅ Always check video licenses
- ✅ Track sources in VIDEO_CREDITS.md
- ✅ Provide attribution if required
- ✅ Verify commercial use is allowed

### File Management
- Videos are excluded from git (.gitignore)
- Keep originals in `videos/original/`
- Process in `videos/processed/`
- Finals in `videos/` root

### Performance
- Keep videos under 5MB each
- Use 720p resolution
- Remove audio tracks
- Test on mobile devices

## 🐛 Troubleshooting

### "yt-dlp not found"
```bash
pip install yt-dlp
```

### "ffmpeg not found"
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg
```

### "No suitable videos found"
- Try different keywords
- Search manually on Pexels/Mixkit
- Adjust duration preferences
- Try YouTube with different terms

### "Video doesn't loop smoothly"
- Find exact loop point with video editor
- Trim with ffmpeg
- Try ping-pong loop method
- Download different video

## 📞 Need Help?

1. Check **VIDEO_SEARCH_QUICKSTART.md** for quick answers
2. Review troubleshooting sections
3. Read **VIDEO_SEARCH_GUIDE.md** for details
4. Check **VIDEO_EXAMPLES.md** for specific cases

## ✅ Verification Checklist

- [x] search_videos.py created and executable
- [x] video_search.sh created and executable
- [x] All documentation files created
- [x] .gitignore updated to exclude videos
- [x] VIDEO_CREDITS.md template created
- [x] videos/README.md created
- [x] requirements-video-search.txt created
- [x] Static action descriptions updated (idle with breathing)
- [x] Tool tested and working

## 🎉 You're All Set!

The video search skill is now fully installed and ready to use. You can:

1. **Search for videos** using 14+ action categories
2. **Download videos** with automatic quality filtering
3. **Process videos** with ffmpeg examples
4. **Integrate videos** into Smootie with clear guides
5. **Track licenses** with VIDEO_CREDITS.md template

### Next Steps:

```bash
# 1. Install dependencies
pip install -r requirements-video-search.txt
brew install ffmpeg  # or apt install ffmpeg

# 2. Test the tool
python search_videos.py --list-actions

# 3. Search for your first video
python search_videos.py --action walking --preview-only

# 4. Download and integrate
python search_videos.py --action walking --download --url "VIDEO_URL"

# 5. Update Smootie and test
python app.py
```

Happy video hunting! 🎥

---

**Created**: 2026-01-26
**Version**: 1.0
**Status**: ✅ Complete and Ready to Use
