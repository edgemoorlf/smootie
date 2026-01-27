# Videos Directory

This directory contains video sets for the Smootie voice-controlled video player.

## Directory Structure

Videos are organized into **sets** - cohesive collections where all videos feature the same person, background, and visual style. This ensures smooth, professional-looking transitions between actions.

```
videos/
├── default/           # Default video set
│   ├── idle.mov       # Standing idle
│   ├── jump.mov       # Jumping action
│   └── circle.mov     # Spinning/turning action
├── set2/              # Another cohesive set (example)
│   ├── idle.mp4
│   ├── walk.mp4
│   └── run.mp4
└── README.md          # This file
```

## Video Set Requirements

### Cohesive Set Rules

All videos in a set **MUST** have:
- ✅ **Same person/character** - identical appearance throughout
- ✅ **Same background** - consistent environment
- ✅ **Same lighting** - matching color temperature and shadows
- ✅ **Same camera angle** - consistent framing and perspective
- ✅ **Same video quality** - matching resolution and style
- ✅ **Same clothing/costume** - no outfit changes between actions

### Why Sets Matter

When switching from "idle" to "jump", the transition should look natural - like the same person performing different actions. Mixing videos from different sources creates jarring, unprofessional transitions.

### Good Set Example
```
videos/office_worker/
├── idle.mp4      # Person standing at desk
├── typing.mp4    # Same person typing
├── phone.mp4     # Same person on phone
└── walking.mp4   # Same person walking
```
All videos: same person, same office, same lighting, same camera.

### Bad Set Example (DON'T DO THIS)
```
videos/mixed/
├── idle.mp4      # Person A, white background
├── jump.mp4      # Person B, green screen
├── walk.mp4      # Person C, outdoor setting
```
Different people, different backgrounds = bad transitions!

## Current Sets

### default/
The original video set included with Smootie.
- `idle.mov` - Standing idle position
- `jump.mov` - Jumping action
- `circle.mov` - Spinning/turning action

## Adding New Video Sets

### Step 1: Find a Cohesive Source

Look for video sources that provide multiple actions with the same character:
- **Motion capture packs** - Often include multiple actions
- **Stock video series** - Some creators offer action sets
- **Game asset packs** - Character animation references
- **Create your own** - Record multiple actions in one session

### Step 2: Create Set Directory

```bash
mkdir -p videos/myset
```

### Step 3: Download Videos to Set

```bash
# Download all actions from the same source to the same set
python search_videos.py --action idle --download --url "URL1" --set myset
python search_videos.py --action walk --download --url "URL2" --set myset
python search_videos.py --action jump --download --url "URL3" --set myset
```

### Step 4: Update Application

Edit `static/app.js` to use your new set:
```javascript
// Change the current set
this.currentSet = 'myset';

// Update video files list
this.videoFiles = ['idle.mp4', 'walk.mp4', 'jump.mp4'];

// Update command map
this.commandMap = {
    'stop': 'idle.mp4',
    '停': 'idle.mp4',
    'walk': 'walk.mp4',
    '走': 'walk.mp4',
    'jump': 'jump.mp4',
    '跳': 'jump.mp4',
};
```

### Step 5: Update HTML

Edit `templates/index.html`:
```html
<source src="/videos/myset/idle.mp4" type="video/mp4">
```

## Video Specifications

### Technical Requirements
- **Format**: MP4 (H.264) or MOV
- **Resolution**: 720p or higher (1280x720 recommended)
- **Duration**: 2-30 seconds per action
- **Frame Rate**: 30fps or 60fps
- **Audio**: Not required (will be muted)
- **File Size**: Under 5MB per video recommended

### Content Requirements
- **Loopable**: Start and end in similar positions
- **Clear action**: Easily distinguishable movements
- **Stable camera**: No camera movement
- **Clean background**: Simple, non-distracting

## Finding Cohesive Video Sets

### Best Sources

1. **Motion Capture Reference Packs**
   - Often include idle, walk, run, jump, etc.
   - Same character throughout
   - Search: "motion capture reference pack"

2. **Game Development Assets**
   - Character animation sets
   - Multiple actions per character
   - Search: "character animation reference"

3. **Stock Video Series**
   - Some creators offer action series
   - Same model, same setting
   - Check Pexels, Mixkit for series

4. **Create Your Own**
   - Record multiple actions in one session
   - Ensures perfect consistency
   - Most control over quality

### Search Tips

When searching for videos:
```bash
# Search for specific action
python search_videos.py --action walking --preview-only

# Look for videos that mention "series" or "pack"
# Check if the creator has other related videos
# Download all from the same source
```

## Processing Videos

### Optimize for Web
```bash
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -crf 23 -preset slow -an output.mp4
```

### Make Seamless Loop
```bash
# Trim to loop point
ffmpeg -i input.mp4 -ss 00:00:02 -to 00:00:08 -c copy output.mp4

# Ping-pong loop
ffmpeg -i input.mp4 -filter_complex "[0:v]reverse[r];[0:v][r]concat=n=2:v=1[v]" -map "[v]" output.mp4
```

## Switching Between Sets

To switch to a different video set in the application:

1. Edit `static/app.js`:
   ```javascript
   this.currentSet = 'newset';  // Change set name
   this.videoFiles = ['idle.mp4', 'action1.mp4', 'action2.mp4'];  // Update file list
   ```

2. Edit `templates/index.html`:
   ```html
   <source src="/videos/newset/idle.mp4" type="video/mp4">
   ```

3. Restart the application

## License Tracking

Track video sources for each set in `VIDEO_CREDITS.md`:

```markdown
## Set: myset

### Source Information
- **Creator**: [Name]
- **Source**: [URL]
- **License**: [License type]
- **Downloaded**: [Date]

### Videos
- idle.mp4 - Standing idle
- walk.mp4 - Walking cycle
- jump.mp4 - Jumping action
```

## Troubleshooting

### Videos don't match visually
- Ensure all videos are from the same source
- Check lighting and background consistency
- Consider creating your own set

### Transitions look jarring
- Videos may be from different sources
- Try finding a cohesive video pack
- Record your own consistent set

### Video won't play
- Check file format (MP4/MOV)
- Verify file isn't corrupted
- Check browser console for errors

## Summary

**Key Principle**: All videos in a set must be visually cohesive - same person, same background, same style.

**Directory Structure**: `videos/{set_name}/{action}.mp4`

**Default Set**: `videos/default/` contains the original videos

**Adding Sets**: Create new subdirectory, download cohesive videos, update app.js
