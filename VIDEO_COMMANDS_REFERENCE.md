# Quick Reference: Video Actions

## Command Mapping Suggestions

Based on the video search categories, here are suggested voice commands for your Smootie app:

### Static Actions (Idle with Natural Movements)
| Video File | Voice Commands (EN) | Voice Commands (CN) | Similar Sounds |
|------------|-------------------|-------------------|----------------|
| standing.mov | stand, idle | 站, 站立 | 赞, 栈 |
| sitting.mov | sit, seat | 坐, 坐下 | 做, 座 |

**Note**: Static/idle videos should show natural breathing and subtle movements, not be completely frozen.

### Dynamic Actions
| Video File | Voice Commands (EN) | Voice Commands (CN) | Similar Sounds |
|------------|-------------------|-------------------|----------------|
| walking.mov | walk, move | 走, 走路 | 奏, 揍 |
| running.mov | run, jog | 跑, 跑步 | 炮, 抛 |
| jumping.mov | jump, hop | 跳, 跳跃 | 条, 调 |
| dancing.mov | dance, groove | 跳舞, 舞 | 无, 武 |
| waving.mov | wave, hello | 挥手, 招手 | 会手 |

### Transition Actions
| Video File | Voice Commands (EN) | Voice Commands (CN) | Similar Sounds |
|------------|-------------------|-------------------|----------------|
| stand_to_sit.mov | sit down | 坐下 | 做下 |
| sit_to_stand.mov | stand up | 站起来 | 赞起来 |
| stand_to_walk.mov | start walking | 开始走 | 开始奏 |
| walk_to_stand.mov | stop walking | 停止走 | 听止走 |

## Updating app.js

After downloading new videos, update the command map in `static/app.js`:

```javascript
// Command map with similar-sounding alternatives
this.commandMap = {
    // Standing
    'stand': 'standing.mov',
    'idle': 'standing.mov',
    '站': 'standing.mov',
    '站立': 'standing.mov',
    '赞': 'standing.mov',
    '栈': 'standing.mov',

    // Sitting
    'sit': 'sitting.mov',
    'seat': 'sitting.mov',
    '坐': 'sitting.mov',
    '坐下': 'sitting.mov',
    '做': 'sitting.mov',
    '座': 'sitting.mov',

    // Walking
    'walk': 'walking.mov',
    'move': 'walking.mov',
    '走': 'walking.mov',
    '走路': 'walking.mov',
    '奏': 'walking.mov',
    '揍': 'walking.mov',

    // Running
    'run': 'running.mov',
    'jog': 'running.mov',
    '跑': 'running.mov',
    '跑步': 'running.mov',
    '炮': 'running.mov',
    '抛': 'running.mov',

    // Jumping (already exists)
    'jump': 'jumping.mov',
    'hop': 'jumping.mov',
    '跳': 'jumping.mov',
    '跳跃': 'jumping.mov',
    '条': 'jumping.mov',
    '调': 'jumping.mov',

    // Dancing
    'dance': 'dancing.mov',
    'groove': 'dancing.mov',
    '跳舞': 'dancing.mov',
    '舞': 'dancing.mov',
    '无': 'dancing.mov',
    '武': 'dancing.mov',

    // Waving
    'wave': 'waving.mov',
    'hello': 'waving.mov',
    '挥手': 'waving.mov',
    '招手': 'waving.mov',
    '会手': 'waving.mov',

    // Transitions
    'sit down': 'stand_to_sit.mov',
    'stand up': 'sit_to_stand.mov',
    'start walking': 'stand_to_walk.mov',
    'stop walking': 'walk_to_stand.mov',
    '站起来': 'sit_to_stand.mov',
    '开始走': 'stand_to_walk.mov',
    '停止走': 'walk_to_stand.mov',

    // Keep existing commands
    'circle': 'circle.mov',
    '转': 'circle.mov',
    '赚': 'circle.mov',
    '传': 'circle.mov',
    '专': 'circle.mov',
    'stop': 'idle.mov',
    '停': 'idle.mov',
    '听': 'idle.mov',
    '挺': 'idle.mov',
    '庭': 'idle.mov'
};
```

## Video File Organization

Recommended directory structure:

```
videos/
├── static/
│   ├── standing.mov
│   ├── sitting.mov
│   └── idle.mov
├── dynamic/
│   ├── walking.mov
│   ├── running.mov
│   ├── jumping.mov
│   ├── dancing.mov
│   └── waving.mov
├── transitions/
│   ├── stand_to_sit.mov
│   ├── sit_to_stand.mov
│   ├── stand_to_walk.mov
│   └── walk_to_stand.mov
└── original/
    └── (keep original downloads here)
```

Or keep flat structure (current):
```
videos/
├── idle.mov (standing)
├── jump.mov
├── circle.mov
├── walking.mov
├── running.mov
├── sitting.mov
└── ...
```

## Testing New Videos

1. **Add video to videos/ directory**
2. **Update videoFiles array in app.js:**
   ```javascript
   this.videoFiles = ['idle.mov', 'jump.mov', 'circle.mov', 'walking.mov', 'running.mov'];
   ```

3. **Test manually:**
   - Click manual control buttons
   - Verify smooth playback
   - Check loop quality

4. **Test voice commands:**
   - Start listening
   - Say command
   - Verify video switches after current video ends

## Video Specifications

### Recommended Settings:
- **Resolution**: 1280x720 (720p) or 1920x1080 (1080p)
- **Frame Rate**: 30fps or 60fps
- **Codec**: H.264
- **Format**: MP4
- **Duration**: 3-10 seconds for loops
- **Audio**: None (or muted)
- **Bitrate**: 2-5 Mbps

### Convert video to optimal format:
```bash
ffmpeg -i input.mov -c:v libx264 -preset slow -crf 22 -vf scale=1280:720 -r 30 -an output.mp4
```

Parameters explained:
- `-c:v libx264`: Use H.264 codec
- `-preset slow`: Better compression
- `-crf 22`: Quality (18-28, lower = better)
- `-vf scale=1280:720`: Resize to 720p
- `-r 30`: 30 fps
- `-an`: Remove audio

## Performance Optimization

### For mobile devices:
```bash
# Lower resolution for mobile
ffmpeg -i input.mp4 -vf scale=854:480 -c:v libx264 -crf 28 -preset fast output_mobile.mp4
```

### Reduce file size:
```bash
# Compress video
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset veryslow output_compressed.mp4
```

### Create thumbnail:
```bash
# Extract first frame as thumbnail
ffmpeg -i video.mp4 -vframes 1 -f image2 thumbnail.jpg
```

## Batch Processing Script

Create `process_videos.sh`:

```bash
#!/bin/bash
# Process all videos in a directory

INPUT_DIR="original"
OUTPUT_DIR="videos"

mkdir -p "$OUTPUT_DIR"

for video in "$INPUT_DIR"/*.{mp4,mov,avi}; do
    if [ -f "$video" ]; then
        filename=$(basename "$video")
        name="${filename%.*}"

        echo "Processing: $filename"

        # Convert to optimized format
        ffmpeg -i "$video" \
            -c:v libx264 \
            -preset slow \
            -crf 22 \
            -vf scale=1280:720 \
            -r 30 \
            -an \
            "$OUTPUT_DIR/${name}.mp4" \
            -y

        echo "✓ Completed: ${name}.mp4"
    fi
done

echo "All videos processed!"
```

Make it executable:
```bash
chmod +x process_videos.sh
./process_videos.sh
```

## Troubleshooting Videos

### Video doesn't loop smoothly:
1. Find exact loop point with video editor
2. Trim to loop point
3. Test in browser
4. Consider reverse-concatenate method

### Video is too large:
1. Reduce resolution
2. Increase CRF value (lower quality)
3. Reduce frame rate
4. Remove audio

### Video has wrong aspect ratio:
```bash
# Crop to 16:9
ffmpeg -i input.mp4 -vf "crop=ih*16/9:ih" output.mp4

# Add padding to 16:9
ffmpeg -i input.mp4 -vf "pad=ih*16/9:ih:(ow-iw)/2:(oh-ih)/2" output.mp4
```

### Video plays too fast/slow:
```bash
# Slow down to 0.5x speed
ffmpeg -i input.mp4 -filter:v "setpts=2.0*PTS" output.mp4

# Speed up to 2x speed
ffmpeg -i input.mp4 -filter:v "setpts=0.5*PTS" output.mp4
```

## Next Steps

1. **Install dependencies:**
   ```bash
   pip install yt-dlp
   ```

2. **Search for videos:**
   ```bash
   python search_videos.py --list-actions
   python search_videos.py --action walking --preview-only
   ```

3. **Download videos:**
   ```bash
   python search_videos.py --action walking --download --url "VIDEO_URL"
   ```

4. **Process videos:**
   - Trim to loop points
   - Optimize format
   - Test loops

5. **Update app:**
   - Add videos to videos/ directory
   - Update app.js command map
   - Update videoFiles array
   - Test voice commands

6. **Update UI:**
   - Update templates/index.html command list
   - Add new commands to documentation
