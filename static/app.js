class VoiceVideoController {
    constructor() {
        this.videoPlayer1 = document.getElementById('videoPlayer1');
        this.videoPlayer2 = document.getElementById('videoPlayer2');
        this.activePlayer = this.videoPlayer1;
        this.inactivePlayer = this.videoPlayer2;

        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.statusEl = document.getElementById('status');
        this.recognizedEl = document.getElementById('recognized');
        this.currentVideoEl = document.getElementById('currentVideo');
        this.queuedVideoEl = document.getElementById('queuedVideo');

        this.recognition = null;
        this.isListening = false;
        this.queuedVideo = null;
        this.isVideoPlaying = false;
        this.isSwitching = false;
        this.idleVideo = null; // Will be set when loading video set

        // Preloaded video elements for smooth switching
        this.preloadedVideos = {};

        // Configuration loader
        this.configLoader = new ConfigLoader();
        this.videoSets = null; // Will be loaded from config
        this.currentSet = null; // Will be set after config loads

        // Audio acknowledgement properties
        this.audioAckEnabled = true;
        this.audioAckVolume = 0.7;
        this.preloadedAudio = {};
        this.currentAudio = null;

        // Initialize asynchronously
        this.initAsync();
    }

    async initAsync() {
        try {
            this.updateStatus('Loading configuration...');
            console.log('Initializing VoiceVideoController...');

            // Load configuration
            await this.configLoader.loadConfig();

            // Convert to legacy format for backward compatibility
            this.videoSets = this.configLoader.convertToLegacyFormat();

            // Get default video set
            this.currentSet = this.configLoader.getDefaultSet();

            console.log('Configuration loaded, initializing with set:', this.currentSet);

            // Load configuration for current set
            this.loadVideoSet(this.currentSet);

            // Preload audio files for current set
            await this.preloadAudioFiles();

            // Initialize UI and functionality
            this.init();

            this.updateStatus('Ready - Configuration loaded');
        } catch (error) {
            console.error('Failed to initialize:', error);
            this.updateStatus(`Error: ${error.message}`);
            this.handleConfigLoadError(error);
        }
    }

    handleConfigLoadError(error) {
        // Display error to user
        const container = document.querySelector('.container');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h2>⚠️ Configuration Error</h2>
            <p>Failed to load configuration: ${error.message}</p>
            <p>Please check the console for more details.</p>
            <button onclick="location.reload()">Reload Page</button>
        `;
        errorDiv.style.cssText = `
            background: #ffebee;
            border: 2px solid #f44336;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            color: #c62828;
        `;
        container.insertBefore(errorDiv, container.firstChild);

        // Disable controls
        this.startBtn.disabled = true;
        this.stopBtn.disabled = true;
    }

    loadVideoSet(setName) {
        const config = this.videoSets[setName];
        if (!config) {
            console.error(`Video set '${setName}' not found`);
            return;
        }

        this.currentSet = setName;
        this.videoFiles = config.videos;
        this.commandMap = config.commands;
        this.currentVideo = config.defaultVideo;
        this.idleVideo = config.idleVideo; // Store the idle/anchor video

        console.log(`Loaded video set: ${setName}`, config);
        console.log(`Available commands: ${Object.keys(config.commands).join(', ')}`);
        console.log(`Idle video: ${this.idleVideo}`);
    }

    init() {
        // Add video set selector
        this.createVideoSetSelector();

        // Add audio controls
        this.createAudioControls();

        // Preload all videos first
        this.preloadVideos().then(() => {
            console.log('All videos preloaded');
            this.updateStatus('Ready - All videos loaded');
        });

        this.startBtn.addEventListener('click', () => this.startListening());
        this.stopBtn.addEventListener('click', () => this.stopListening());

        // Add manual control button listeners
        this.updateManualControls();

        // Update command list display
        this.updateCommandList();

        // Setup both video players
        [this.videoPlayer1, this.videoPlayer2].forEach(player => {
            player.addEventListener('play', () => {
                if (player === this.activePlayer) {
                    this.isVideoPlaying = true;
                    console.log('Active player started playing');
                }
            });

            player.addEventListener('ended', () => {
                console.log('Video ended event fired for', player === this.activePlayer ? 'active' : 'inactive', 'player');
                if (player === this.activePlayer) {
                    this.isVideoPlaying = false;
                    console.log('Active video ended, queued video:', this.queuedVideo);
                    this.onVideoEnded();
                }
            });

            player.addEventListener('timeupdate', () => {
                if (player === this.activePlayer && this.queuedVideo) {
                    // Preload queued video when approaching end
                    const remaining = player.duration - player.currentTime;
                    if (remaining < 2 && remaining > 1.8) {
                        console.log(`Video ending soon, ${remaining.toFixed(2)}s remaining, queued: ${this.queuedVideo}`);

                        // Ensure queued video is ready
                        if (!this.preloadedVideos[this.queuedVideo]) {
                            console.log('Emergency preload of queued video');
                            const video = document.createElement('video');
                            video.preload = 'auto';
                            video.src = `/videos/${this.currentSet}/${this.queuedVideo}`;
                            video.muted = true;
                            video.load();
                            this.preloadedVideos[this.queuedVideo] = video;
                        }
                    }
                }
            });

            // Prevent fullscreen on mobile
            player.addEventListener('webkitbeginfullscreen', (e) => {
                console.log('Preventing fullscreen');
                e.preventDefault();
                e.stopPropagation();
            });

            player.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Monitor fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                console.log('Entered fullscreen, exiting...');
                document.exitFullscreen();
            }
        });

        document.addEventListener('webkitfullscreenchange', () => {
            if (document.webkitFullscreenElement) {
                console.log('Entered webkit fullscreen, exiting...');
                document.webkitExitFullscreen();
            }
        });

        // Start playing the initial video
        this.activePlayer.play().catch(err => {
            console.log('Autoplay prevented, user interaction required');
            this.activePlayer.muted = true;
            this.activePlayer.play();
        });
    }

    createVideoSetSelector() {
        const controlsDiv = document.querySelector('.controls');
        const selectorDiv = document.createElement('div');
        selectorDiv.className = 'video-set-selector';
        selectorDiv.innerHTML = `
            <label>
                视频集 Video Set:
                <select id="videoSetSelect">
                    ${Object.keys(this.videoSets).map(setName =>
                        `<option value="${setName}" ${setName === this.currentSet ? 'selected' : ''}>${setName}</option>`
                    ).join('')}
                </select>
            </label>
        `;
        controlsDiv.insertBefore(selectorDiv, controlsDiv.firstChild);

        const selector = document.getElementById('videoSetSelect');
        selector.addEventListener('change', (e) => {
            this.switchVideoSet(e.target.value);
        });
    }

    switchVideoSet(setName) {
        console.log(`Switching to video set: ${setName}`);

        // Stop listening if active
        if (this.isListening) {
            this.stopListening();
        }

        // Stop any playing audio
        this.stopCurrentAudio();

        // Load new configuration
        this.loadVideoSet(setName);

        // Update UI
        this.updateManualControls();
        this.updateCommandList();

        // Reset video players and preloaded videos
        this.preloadedVideos = {};
        this.queuedVideo = null;
        this.queuedVideoEl.textContent = '-';

        // Reset audio
        this.preloadedAudio = {};

        this.activePlayer.src = `/videos/${this.currentSet}/${this.currentVideo}`;
        this.inactivePlayer.src = `/videos/${this.currentSet}/${this.currentVideo}`;
        this.activePlayer.load();
        this.inactivePlayer.load();

        // Update status display
        this.currentVideoEl.textContent = this.currentVideo;

        // Preload new videos and audio
        Promise.all([
            this.preloadVideos(),
            this.preloadAudioFiles()
        ]).then(() => {
            console.log('New video set loaded');
            this.updateStatus('Ready - New video set loaded');

            // Start playing
            this.activePlayer.play().catch(() => {
                console.log('Autoplay prevented, user interaction required');
            });
        });
    }

    updateManualControls() {
        const buttonGroup = document.querySelector('.button-group');
        if (!buttonGroup) return;

        const config = this.videoSets[this.currentSet];
        buttonGroup.innerHTML = config.buttons.map(btn =>
            `<button class="action-btn ${btn.class}" data-video="${btn.video}">${btn.label}</button>`
        ).join('');

        // Re-attach event listeners
        const actionButtons = buttonGroup.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const video = e.target.getAttribute('data-video');
                console.log('Manual button clicked:', video);
                this.queueVideoSwitch(video);
            });
        });
    }

    updateCommandList() {
        const commandsList = document.querySelector('.commands ul');
        if (!commandsList) return;

        const config = this.videoSets[this.currentSet];

        // Generate list items showing button label -> video file
        commandsList.innerHTML = config.buttons.map(btn =>
            `<li><strong>${btn.label}</strong> → ${btn.video}</li>`
        ).join('');
    }

    async preloadVideos() {
        // Ensure preloadedVideos is initialized
        if (!this.preloadedVideos) {
            this.preloadedVideos = {};
        }

        const preloadPromises = this.videoFiles.map(videoFile => {
            return new Promise((resolve, reject) => {
                const video = document.createElement('video');
                video.preload = 'auto';
                video.src = `/videos/${this.currentSet}/${videoFile}`;

                const onLoadedData = () => {
                    video.removeEventListener('loadeddata', onLoadedData);
                    video.removeEventListener('error', onError);
                    this.preloadedVideos[videoFile] = video;
                    console.log(`Preloaded: ${this.currentSet}/${videoFile}`);
                    resolve();
                };

                const onError = (e) => {
                    video.removeEventListener('loadeddata', onLoadedData);
                    video.removeEventListener('error', onError);
                    console.error(`Error preloading ${videoFile}:`, e);
                    reject(e);
                };

                video.addEventListener('loadeddata', onLoadedData);
                video.addEventListener('error', onError);

                // Start loading
                video.load();
            });
        });

        try {
            await Promise.all(preloadPromises);
        } catch (err) {
            console.error('Error preloading videos:', err);
        }
    }

    getRecognitionMode() {
        return 'browser'; // Always use browser recognition
    }

    startListening() {
        this.startBrowserRecognition();
        this.isListening = true;
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.updateStatus('正在监听... Listening...');
    }

    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
            this.recognition = null;
        }

        this.isListening = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.updateStatus('已停止 Stopped');
    }

    startBrowserRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('浏览器不支持语音识别。请使用 Chrome 或 Edge 浏览器。\nBrowser speech recognition is not supported. Please use Chrome or Edge.');
            this.stopListening();
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        // Mobile-optimized settings with Chinese by default
        this.recognition.continuous = false; // Better for mobile - one phrase at a time
        this.recognition.interimResults = true;
        this.recognition.lang = 'zh-CN'; // Default to Chinese
        this.recognition.maxAlternatives = 10; // Increased to get more alternatives for better matching

        console.log('Starting recognition with language: zh-CN');
        console.log('Valid commands:', Object.keys(this.commandMap));

        this.recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const result = event.results[last];

            if (result.isFinal) {
                // Check all alternatives, not just the first one
                let matched = false;
                for (let i = 0; i < result.length; i++) {
                    const text = result[i].transcript.trim();
                    console.log(`Alternative ${i}: "${text}" (confidence: ${result[i].confidence})`);

                    if (!matched) {
                        // Try to match this alternative
                        if (this.tryProcessCommand(text)) {
                            matched = true;
                            this.recognizedEl.textContent = `✓ ${text}`;
                            console.log(`Matched with alternative ${i}`);
                        }
                    }
                }

                if (!matched) {
                    console.log('No match found in any alternative');
                    // Show the first alternative but indicate no match
                    const text = result[0].transcript.trim();
                    this.recognizedEl.textContent = `✗ ${text}`;
                }
            } else {
                // Show interim results
                const text = result[0].transcript.trim();
                console.log('Recognized (interim):', text);
                this.recognizedEl.textContent = text + ' (...)';
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                console.log('No speech detected, restarting...');
                return;
            }
            if (event.error === 'aborted') {
                return;
            }
            if (event.error === 'network') {
                this.updateStatus('网络错误 Network error');
                return;
            }
            this.updateStatus(`错误 Error: ${event.error}`);
        };

        this.recognition.onend = () => {
            console.log('Recognition ended, isListening:', this.isListening);
            if (this.isListening) {
                // Restart recognition if still listening
                setTimeout(() => {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        console.error('Error restarting recognition:', e);
                    }
                }, 300); // Small delay for mobile
            }
        };

        this.recognition.onstart = () => {
            console.log('Recognition started');
            this.updateStatus('正在监听... Listening...');
        };

        try {
            this.recognition.start();
        } catch (e) {
            console.error('Error starting recognition:', e);
            this.updateStatus('启动识别失败 Error starting recognition');
        }
    }

    // Helper method to try processing a command and return if it matched
    tryProcessCommand(text) {
        const lowerText = text.toLowerCase();
        const chars = text.split('');
        const words = lowerText.split(/\s+/);

        // Get all valid commands from the current configuration
        const validCommands = Object.keys(this.commandMap);

        console.log('Valid commands for current set:', validCommands);
        console.log('Trying to match:', text);

        let matchedCommand = null;

        // First, try exact character match (for single Chinese characters)
        for (const char of chars) {
            if (validCommands.includes(char)) {
                const video = this.commandMap[char];
                console.log(`Exact character match: ${char} -> ${video}`);
                matchedCommand = char;
                this.queueVideoSwitch(video);
                this.playAcknowledgement(char, true);
                return true;
            }
        }

        // Then try exact word match
        for (const word of words) {
            const lowerWord = word.toLowerCase();
            for (const command of validCommands) {
                if (lowerWord === command.toLowerCase()) {
                    const video = this.commandMap[command];
                    console.log(`Exact word match: ${command} -> ${video}`);
                    matchedCommand = command;
                    this.queueVideoSwitch(video);
                    this.playAcknowledgement(command, true);
                    return true;
                }
            }
        }

        // Finally, try substring match (for commands within longer text)
        for (const command of validCommands) {
            const lowerCommand = command.toLowerCase();
            if (lowerText.includes(lowerCommand) || chars.includes(command)) {
                const video = this.commandMap[command];
                console.log(`Substring match: ${command} -> ${video}`);
                matchedCommand = command;
                this.queueVideoSwitch(video);
                this.playAcknowledgement(command, true);
                return true;
            }
        }

        console.log('No match found for:', text);
        // Play error acknowledgement for unmatched commands
        this.playAcknowledgement(text, false);
        return false;
    }

    processCommand(text) {
        console.log('Processing command:', text);
        if (!this.tryProcessCommand(text)) {
            console.log('No command matched');
        }
    }

    queueVideoSwitch(videoFile) {
        if (videoFile === this.currentVideo) {
            // Already playing this video
            console.log('Video already playing, ignoring queue request');
            return;
        }

        // If trying to queue the idle video while it's already playing, ignore
        if (videoFile === this.idleVideo && this.currentVideo === this.idleVideo) {
            console.log('Idle video already playing, ignoring queue request');
            return;
        }

        console.log(`Queueing video: ${videoFile}, will switch when current video ends`);
        this.queuedVideo = videoFile;
        this.queuedVideoEl.textContent = videoFile;

        // Preload the queued video for instant switching
        if (!this.preloadedVideos[videoFile]) {
            console.log(`Preloading queued video: ${videoFile}`);
            const video = document.createElement('video');
            video.preload = 'auto';
            video.src = `/videos/${this.currentSet}/${videoFile}`;
            video.muted = true;

            video.addEventListener('loadeddata', () => {
                this.preloadedVideos[videoFile] = video;
                console.log(`Queued video preloaded: ${videoFile}`);
            });

            video.load();
        }

        // DO NOT switch immediately - always wait for video to end
        // The switch will happen in onVideoEnded() when the current video finishes
    }

    switchVideo() {
        if (!this.queuedVideo) {
            console.log('switchVideo called but no queued video');
            return;
        }

        if (this.isSwitching) {
            console.log('switchVideo called but already switching');
            return;
        }

        const videoToPlay = this.queuedVideo;
        this.queuedVideo = null;
        this.queuedVideoEl.textContent = '-';

        this.currentVideo = videoToPlay;
        this.currentVideoEl.textContent = videoToPlay;

        this.isSwitching = true;
        console.log(`Starting switch to ${videoToPlay}`);

        // Use preloaded video if available, otherwise load it
        const preloadedVideo = this.preloadedVideos[videoToPlay];

        if (preloadedVideo) {
            console.log('Using preloaded video');
            // Clone the preloaded video source to the inactive player
            this.inactivePlayer.src = preloadedVideo.src;
            this.inactivePlayer.load();
        } else {
            console.log('Loading video on demand');
            this.inactivePlayer.src = `/videos/${this.currentSet}/${videoToPlay}`;
            this.inactivePlayer.load();
        }

        // Wait for the new video to be ready
        const onCanPlay = () => {
            this.inactivePlayer.removeEventListener('canplay', onCanPlay);
            this.inactivePlayer.removeEventListener('error', onError);
            console.log('New video ready to play');

            // Start playing the new video
            this.inactivePlayer.currentTime = 0;
            this.inactivePlayer.play().then(() => {
                console.log('New video playing, starting cross-fade');

                // Cross-fade: show new video, hide old video
                this.inactivePlayer.classList.add('active');
                this.activePlayer.classList.remove('active');

                // After transition completes, stop the old video
                setTimeout(() => {
                    this.activePlayer.pause();
                    this.activePlayer.currentTime = 0;

                    // Swap active/inactive references
                    const temp = this.activePlayer;
                    this.activePlayer = this.inactivePlayer;
                    this.inactivePlayer = temp;

                    this.isSwitching = false;
                    console.log('Video switch complete, new active video:', videoToPlay);
                }, 500); // Increased from 300ms for smoother transition
            }).catch(err => {
                console.error('Error playing new video:', err);
                this.isSwitching = false;
            });
        };

        const onError = (e) => {
            this.inactivePlayer.removeEventListener('canplay', onCanPlay);
            this.inactivePlayer.removeEventListener('error', onError);
            console.error('Error loading video:', e);
            this.isSwitching = false;
        };

        this.inactivePlayer.addEventListener('canplay', onCanPlay);
        this.inactivePlayer.addEventListener('error', onError);
    }

    onVideoEnded() {
        console.log('onVideoEnded called, queuedVideo:', this.queuedVideo);
        console.log('Current video:', this.currentVideo, 'Idle video:', this.idleVideo);

        if (this.queuedVideo) {
            console.log('Switching to queued video:', this.queuedVideo);
            // Small delay to ensure smooth transition
            setTimeout(() => {
                this.switchVideo();
            }, 50);
        } else {
            // Check if current video is the idle video
            if (this.currentVideo === this.idleVideo) {
                // Loop the idle video
                console.log('Looping idle video:', this.idleVideo);
                this.activePlayer.currentTime = 0;
                this.activePlayer.play().catch(() => {
                    console.error('Error looping idle video');
                });
            } else {
                // Non-idle video ended, return to idle video
                console.log('Non-idle video ended, returning to idle video:', this.idleVideo);
                this.queuedVideo = this.idleVideo;
                setTimeout(() => {
                    this.switchVideo();
                }, 50);
            }
        }
    }

    updateStatus(status) {
        this.statusEl.textContent = status;
    }

    // ========================================
    // Audio Acknowledgement Methods
    // ========================================

    /**
     * Preload audio files for the current video set
     */
    async preloadAudioFiles() {
        const config = this.videoSets[this.currentSet];
        if (!config.audioAck || !config.audioAck.enabled) {
            console.log('Audio acknowledgement disabled for this set');
            return;
        }

        console.log('Preloading audio files for set:', this.currentSet);

        // Collect all audio files to preload
        const audioFiles = [
            ...config.audioAck.generic,
            ...Object.values(config.audioAck.specific),
            config.audioAck.error
        ].filter(Boolean);

        console.log('Audio files to preload:', audioFiles);

        const preloadPromises = audioFiles.map(audioFile => {
            return new Promise((resolve, reject) => {
                const audio = new Audio(audioFile);
                audio.preload = 'auto';
                audio.volume = this.audioAckVolume;

                audio.addEventListener('canplaythrough', () => {
                    this.preloadedAudio[audioFile] = audio;
                    console.log(`Preloaded audio: ${audioFile}`);
                    resolve();
                });

                audio.addEventListener('error', (e) => {
                    console.error(`Error preloading audio ${audioFile}:`, e);
                    // Don't reject, just resolve to continue with other files
                    resolve();
                });

                audio.load();
            });
        });

        try {
            await Promise.all(preloadPromises);
            console.log('All audio files preloaded successfully');
        } catch (err) {
            console.error('Error preloading audio files:', err);
        }
    }

    /**
     * Play acknowledgement audio
     * @param {string} command - The recognized command
     * @param {boolean} matched - Whether the command matched
     */
    playAcknowledgement(command, matched) {
        if (!this.audioAckEnabled) {
            console.log('Audio acknowledgement disabled');
            return;
        }

        const config = this.videoSets[this.currentSet];
        if (!config.audioAck || !config.audioAck.enabled) {
            console.log('Audio acknowledgement not configured for this set');
            return;
        }

        // Stop current audio if playing
        this.stopCurrentAudio();

        let audioFile = null;

        if (matched) {
            // Try to find command-specific audio
            // Look for the primary keyword in the command
            const cmdConfig = this.configLoader.getCommandByKeyword(this.currentSet, command);
            if (cmdConfig && cmdConfig.primaryKeyword) {
                audioFile = config.audioAck.specific[cmdConfig.primaryKeyword];
                console.log(`Using specific audio for command: ${cmdConfig.primaryKeyword}`);
            }

            // If no specific audio, try direct match
            if (!audioFile) {
                audioFile = config.audioAck.specific[command];
            }

            // If still no specific audio, use generic acknowledgement
            if (!audioFile && config.audioAck.generic.length > 0) {
                const randomIndex = Math.floor(Math.random() * config.audioAck.generic.length);
                audioFile = config.audioAck.generic[randomIndex];
                console.log(`Using generic acknowledgement audio: ${audioFile}`);
            }
        } else {
            // Use error audio for unmatched commands
            audioFile = config.audioAck.error;
            console.log('Using error audio for unmatched command');
        }

        if (!audioFile) {
            console.log('No audio file configured');
            return;
        }

        // Play the audio
        const audio = this.preloadedAudio[audioFile];
        if (audio) {
            audio.currentTime = 0;
            audio.volume = this.audioAckVolume;
            audio.play().catch(err => {
                console.error('Error playing acknowledgement audio:', err);
            });
            this.currentAudio = audio;
            console.log(`Playing audio: ${audioFile}`);
        } else {
            console.warn(`Audio not preloaded: ${audioFile}`);
        }
    }

    /**
     * Stop currently playing audio
     */
    stopCurrentAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
    }

    /**
     * Set audio volume
     * @param {number} volume - Volume level (0.0 - 1.0)
     */
    setAudioVolume(volume) {
        this.audioAckVolume = Math.max(0, Math.min(1, volume));

        // Update all preloaded audio volumes
        Object.values(this.preloadedAudio).forEach(audio => {
            audio.volume = this.audioAckVolume;
        });

        // Update current playing audio volume
        if (this.currentAudio) {
            this.currentAudio.volume = this.audioAckVolume;
        }

        console.log(`Audio volume set to: ${this.audioAckVolume}`);
    }

    /**
     * Toggle audio acknowledgement on/off
     */
    toggleAudioAck() {
        this.audioAckEnabled = !this.audioAckEnabled;

        if (!this.audioAckEnabled) {
            this.stopCurrentAudio();
        }

        console.log(`Audio acknowledgement ${this.audioAckEnabled ? 'enabled' : 'disabled'}`);
        return this.audioAckEnabled;
    }

    /**
     * Create audio control UI
     */
    createAudioControls() {
        const controlsDiv = document.querySelector('.controls');
        const audioControlsDiv = document.createElement('div');
        audioControlsDiv.className = 'audio-controls';
        audioControlsDiv.innerHTML = `
            <h3>语音确认设置 Audio Acknowledgement:</h3>

            <div class="audio-control-item">
                <label>
                    <input type="checkbox" id="audioAckToggle" checked>
                    启用语音确认 Enable Audio Ack
                </label>
            </div>

            <div class="audio-control-item">
                <label>
                    音量 Volume:
                    <input type="range" id="audioVolumeSlider"
                           min="0" max="100" value="70" step="1">
                    <span id="audioVolumeValue">70%</span>
                </label>
            </div>

            <div class="audio-control-item">
                <button id="audioMuteBtn" class="btn-small">🔊 静音 Mute</button>
            </div>
        `;

        // Insert after the main controls
        controlsDiv.parentNode.insertBefore(audioControlsDiv, controlsDiv.nextSibling);

        // Add event listeners
        const audioAckToggle = document.getElementById('audioAckToggle');
        const audioVolumeSlider = document.getElementById('audioVolumeSlider');
        const audioVolumeValue = document.getElementById('audioVolumeValue');
        const audioMuteBtn = document.getElementById('audioMuteBtn');

        audioAckToggle.addEventListener('change', (e) => {
            this.audioAckEnabled = e.target.checked;
            console.log(`Audio acknowledgement ${this.audioAckEnabled ? 'enabled' : 'disabled'}`);
        });

        audioVolumeSlider.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value) / 100;
            this.setAudioVolume(volume);
            audioVolumeValue.textContent = `${e.target.value}%`;
        });

        let previousVolume = 0.7;
        audioMuteBtn.addEventListener('click', () => {
            if (this.audioAckVolume > 0) {
                // Mute
                previousVolume = this.audioAckVolume;
                this.setAudioVolume(0);
                audioVolumeSlider.value = 0;
                audioVolumeValue.textContent = '0%';
                audioMuteBtn.textContent = '🔇 取消静音 Unmute';
                audioMuteBtn.classList.add('muted');
            } else {
                // Unmute
                this.setAudioVolume(previousVolume);
                audioVolumeSlider.value = Math.round(previousVolume * 100);
                audioVolumeValue.textContent = `${Math.round(previousVolume * 100)}%`;
                audioMuteBtn.textContent = '🔊 静音 Mute';
                audioMuteBtn.classList.remove('muted');
            }
        });
    }
}

// Initialize the controller when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VoiceVideoController();
});
