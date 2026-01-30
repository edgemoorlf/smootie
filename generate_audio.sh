#!/bin/bash

# Script to generate audio files for voice acknowledgement
# Uses macOS 'say' command with correct Chinese voice name

echo "Regenerating Chinese audio files with correct voice..."

# Function to generate audio with Chinese voice
generate_chinese_audio() {
    local text="$1"
    local output="$2"
    echo "Generating: $output"

    # Use Tingting (not Ting-Ting) for Chinese voice
    say -v Tingting "$text" -o "${output%.mp3}.aiff" 2>/dev/null

    if [ $? -ne 0 ]; then
        echo "  Warning: Tingting voice not available, trying default Chinese voices..."
        # Try other Chinese voices as fallback
        say -v Meijia "$text" -o "${output%.mp3}.aiff" 2>/dev/null || \
        say -v Sinji "$text" -o "${output%.mp3}.aiff" 2>/dev/null || \
        say -v "Eddy (Chinese (China mainland))" "$text" -o "${output%.mp3}.aiff"
    fi

    # Convert to MP3 if ffmpeg is available
    if command -v ffmpeg &> /dev/null; then
        ffmpeg -i "${output%.mp3}.aiff" -codec:a libmp3lame -b:a 128k -ac 1 -ar 44100 "$output" -y 2>/dev/null
        rm "${output%.mp3}.aiff"
        echo "  ✓ Created: $output"
    else
        echo "  Warning: ffmpeg not found, keeping AIFF format"
        mv "${output%.mp3}.aiff" "$output"
    fi
}

# Generate common audio files (Chinese)
echo ""
echo "=== Generating common Chinese audio files ==="
generate_chinese_audio "好的" "audio/common/acknowledged_zh.mp3"
generate_chinese_audio "收到" "audio/common/received_zh.mp3"
generate_chinese_audio "明白" "audio/common/understood_zh.mp3"
generate_chinese_audio "嗯" "audio/common/ok_zh.mp3"
generate_chinese_audio "没听清" "audio/common/error_zh.mp3"

# Generate TikTok Set 1 audio files
echo ""
echo "=== Generating TikTok Set 1 audio files ==="
generate_chinese_audio "跳" "audio/tiktok/set1/jump_zh.mp3"
generate_chinese_audio "转" "audio/tiktok/set1/circle_zh.mp3"
generate_chinese_audio "停" "audio/tiktok/set1/stop_zh.mp3"

# Generate TikTok Set 2 audio files
echo ""
echo "=== Generating TikTok Set 2 audio files ==="
generate_chinese_audio "跳" "audio/tiktok/set2/jump_zh.mp3"
generate_chinese_audio "转" "audio/tiktok/set2/circle_zh.mp3"
generate_chinese_audio "停" "audio/tiktok/set2/stop_zh.mp3"

# Generate TikTok Set 3 audio files
echo ""
echo "=== Generating TikTok Set 3 audio files ==="
generate_chinese_audio "停" "audio/tiktok/set3/stop_zh.mp3"
generate_chinese_audio "抖" "audio/tiktok/set3/shake_zh.mp3"
generate_chinese_audio "扭" "audio/tiktok/set3/twist_zh.mp3"

echo ""
echo "=== Audio regeneration complete! ==="
echo ""
echo "Testing audio files:"
echo "  English: $(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 audio/common/acknowledged_en.mp3 2>/dev/null)s"
echo "  Chinese: $(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 audio/common/acknowledged_zh.mp3 2>/dev/null)s"
echo ""
echo "Generated files:"
find audio -name "*.mp3" | sort

echo ""
echo "✓ All Chinese audio files regenerated successfully!"
