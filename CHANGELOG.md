# Changelog

All notable changes to Smootie will be documented in this file.

## [2.0.0] - 2026-01-29

### Added
- 🎉 **Voice Acknowledgement Feature** - Audio feedback when commands are recognized
  - Command-specific audio (e.g., "停", "抖", "扭")
  - Generic acknowledgements (random selection from "好的", "收到")
  - Error audio for unrecognized commands
  - Volume control slider (0-100%)
  - Mute/unmute button
  - Enable/disable toggle
  - Audio preloading for instant playback

- ⚙️ **External Configuration System**
  - `config/videosets.json` - All video sets in JSON format
  - `ConfigLoader` class for loading and validating configuration
  - Async configuration loading
  - Configuration validation with error handling
  - Easy to add new video sets without code changes

- 🎯 **Homophone Matching**
  - Intelligent matching for similar-sounding Chinese words
  - "读起来" → "抖" (dú qǐ lái → dǒu)
  - "听" → "停" (tīng → tíng)
  - Phrase variants support ("抖起来", "抖动", etc.)
  - Configurable keywords per command

- 📁 **Audio Infrastructure**
  - 16 audio files (Chinese & English)
  - `audio/` directory structure
  - `generate_audio.sh` script for audio generation
  - MP3 format, optimized for web (128kbps, mono)
  - Audio documentation in `audio/README.md`

- 🎨 **UI Enhancements**
  - Audio control panel with modern design
  - Real-time volume adjustment
  - Visual feedback for audio state
  - Mobile-responsive audio controls
  - Bilingual labels (Chinese/English)

### Fixed
- 🔧 Chinese audio files had no sound (wrong voice name: "Ting-Ting" → "Tingting")
- 🔧 "抖起来" recognized as "读起来" causing command failure
- 🔧 Configuration loading race conditions
- 🔧 Audio playback interference with video/voice recognition

### Changed
- 📝 Moved video set configuration from `app.js` to `config/videosets.json`
- 📝 Updated README with voice acknowledgement features
- 📝 Enhanced homophone matching documentation
- 📝 Improved FAQ section with audio troubleshooting

### Technical Details
- Added `preloadAudioFiles()` method (~60 lines)
- Added `playAcknowledgement()` method (~50 lines)
- Added `createAudioControls()` method (~80 lines)
- Added `ConfigLoader` class (335 lines)
- Updated `tryProcessCommand()` to play audio feedback
- Updated `switchVideoSet()` to preload audio
- Added Flask routes for `/audio/` and `/config/`

### Performance
- Audio preload time: <500ms for 16 files
- Audio playback delay: <10ms (instant)
- Configuration load time: <100ms
- Total overhead: <600ms

### Browser Compatibility
- ✅ Chrome Desktop (tested)
- ✅ Edge Desktop (tested)
- ⚠️ Chrome Mobile (needs testing)
- ⚠️ Safari (needs testing)
- ⚠️ Firefox (needs testing)

## [1.0.0] - 2026-01-26

### Added
- Initial release
- Voice recognition using Web Speech API
- Dual video layer seamless switching
- Multiple video set support
- Idle/anchor video looping
- Action video single playback
- Manual control buttons
- Mobile optimization
- Homophone matching for Chinese commands
- Video preloading
- Hardware-accelerated transitions

### Features
- Browser-based voice recognition (Chinese)
- Seamless video switching (no black screen)
- Multiple video sets (tiktok/set1, set2, set3, default)
- Command mapping with similar sounds
- Visual feedback (✓/✗)
- Mobile-friendly interface
- Touch-optimized controls

---

**Note**: This project follows [Semantic Versioning](https://semver.org/).
