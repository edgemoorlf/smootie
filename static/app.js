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
        this.intentEl = document.getElementById('intent');
        this.currentVideoEl = document.getElementById('currentVideo');
        this.queuedVideoEl = document.getElementById('queuedVideo');
        this.listeningIndicator = document.querySelector('.listening-indicator');
        this.listeningStatus = document.querySelector('.listening-status');

        this.recognition = null;
        this.isListening = false;
        this.queuedVideo = null;
        this.isVideoPlaying = false;
        this.isSwitching = false;
        this.idleVideo = null; // Will be set when loading video set
        this.previousVideo = null; // Track previous video for special actions
        this.lastProcessedInterim = null; // Track last processed interim result to avoid duplicates
        this.recognitionTimeout = null; // Timeout to force restart if stuck
        this.lastRecognitionTime = Date.now(); // Track when we last got a result

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

        // DashScope conversation properties
        this.dashscopeClient = null;
        this.conversationEnabled = this.loadConversationEnabled(); // Load from localStorage
        this.isTalking = false; // Is currently in conversation mode
        this.talkVideo = null; // Talk video path
        this.ttsAudio = null; // Current TTS audio element
        this.ttsQueue = []; // Queue of TTS audio to play
        this.conversationActions = []; // Available actions for function calling

        // Speech recognition retry logic
        this.recognitionRetryCount = 0;
        this.maxRecognitionRetries = 3; // Reduced from 5 to fail faster
        this.recognitionRetryDelay = 1000; // Reduced from 2000ms to 1000ms
        this.isRestarting = false; // Flag to prevent concurrent restarts
        this.restartTimeout = null; // Track restart timeout
        this.useDashScopeASR = false; // Fallback to DashScope ASR if browser fails

        // Speech recognition settings - load from localStorage or use defaults
        this.recognitionSettings = this.loadRecognitionSettings();

        // Force continuous mode for streaming experience
        this.recognitionSettings.continuous = true;

        // Video switching mode - load from localStorage or use default (immediate)
        this.immediateSwitch = this.loadImmediateSwitchSetting();

        // Check browser compatibility
        this.checkBrowserCompatibility();

        // Initialize asynchronously
        this.initAsync();
    }

    async initAsync() {
        try {
            this.updateStatus('加载配置中...');
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

            // Initialize DashScope client
            this.dashscopeClient = new DashScopeClient();
            console.log('DashScope client initialized');

            // Preload audio files for current set
            await this.preloadAudioFiles();

            // Initialize UI and functionality
            this.init();

            this.updateStatus('就绪 - 配置已加载');
        } catch (error) {
            console.error('Failed to initialize:', error);
            this.updateStatus(`错误: ${error.message}`);
            this.handleConfigLoadError(error);
        }
    }

    handleConfigLoadError(error) {
        // Display error to user
        const container = document.querySelector('.container');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h2>⚠️ 配置错误</h2>
            <p>加载配置失败: ${error.message}</p>
            <p>请查看控制台获取更多详情。</p>
            <button onclick="location.reload()">重新加载页面</button>
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
        this.startBtn.style.display = 'none';
        this.stopBtn.style.display = 'none';
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

        // Load conversation config if available
        if (config.conversation) {
            // Keep the conversationEnabled value from localStorage (don't override it)
            // Only set it if conversation is explicitly disabled in config
            if (config.conversation.enabled === false) {
                this.conversationEnabled = false;
            }
            this.talkVideo = config.conversation.talkVideo;
            this.conversationActions = config.conversation.actions || [];
            if (config.conversation.sessionId) {
                this.dashscopeClient.sessionId = config.conversation.sessionId;
            }
            console.log(`Conversation mode: ${this.conversationEnabled ? 'enabled' : 'disabled'}`);
            console.log(`Talk video: ${this.talkVideo}`);
            console.log(`Available actions for function calling:`, this.conversationActions);
        } else {
            this.conversationEnabled = false;
            this.talkVideo = null;
            this.conversationActions = [];
        }

        console.log(`Loaded video set: ${setName}`, config);
        console.log(`Available commands: ${Object.keys(config.commands).join(', ')}`);
        console.log(`Idle video: ${this.idleVideo}`);
    }

    init() {
        // Add video set selector
        this.createVideoSetSelector();

        // Add speech recognition settings
        this.createRecognitionSettings();

        // Add audio controls
        this.createAudioControls();

        // Add conversation mode toggle
        this.createConversationToggle();

        // Set initial BGM volume - allow BGM for action videos, mute for idle
        this.videoPlayer1.volume = 0.2;
        this.videoPlayer2.volume = 0.2;
        console.log('Initial BGM set to 0.2');

        // Preload all videos first
        this.preloadVideos().then(() => {
            console.log('All videos preloaded');
            this.updateStatus('就绪 - 所有视频已加载');
        });

        this.startBtn.addEventListener('click', () => this.startListening());
        this.stopBtn.addEventListener('click', () => {
            this.stopListening();
            // Show start button when stopped
            this.startBtn.style.display = 'inline-block';
            this.stopBtn.style.display = 'none';
        });

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

        // Initialize listening indicator to idle state
        this.updateListeningIndicator('idle', '待机');

        // Start playing the initial video (muted to allow autoplay)
        this.activePlayer.play().then(() => {
            console.log('Video autoplay succeeded');
            // Don't auto-start listening - wait for user to click "命令她"
            this.updateStatus('点击"命令她"按钮开始语音识别');
        }).catch(() => {
            console.log('Autoplay prevented, user interaction required');
            this.activePlayer.muted = true;
            this.activePlayer.play().then(() => {
                console.log('Muted video autoplay succeeded');
            });

            // Show a message prompting user to click to enable audio
            this.updateStatus('点击"命令她"按钮开始语音识别');
        });
    }

    createVideoSetSelector() {
        const controlsDiv = document.querySelector('.controls');
        const selectorDiv = document.createElement('div');
        selectorDiv.className = 'video-set-selector';
        selectorDiv.innerHTML = `
            <label>
                视频集:
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
            this.startBtn.style.display = 'inline-block';
            this.stopBtn.style.display = 'none';
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
            this.updateStatus('就绪 - 新视频集已加载');

            // Start playing
            this.activePlayer.play().catch(() => {
                console.log('Autoplay prevented, user interaction required');
            });

            // Restart listening if it was active
            if (this.isListening) {
                this.startListening();
            }
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

                // Check if this is a special button that returns to previous video
                const videoConfig = this.videoFiles.find(v => v.id === video);
                const isSpecialCommand = videoConfig && videoConfig.returnToPrevious;

                this.queueVideoSwitch(video, isSpecialCommand);
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
        console.log('startListening called');

        // Reset flags
        this.isRestarting = false;
        this.recognitionRetryCount = 0;

        this.startBrowserRecognition();
        this.isListening = true;
        this.startBtn.style.display = 'none';
        this.stopBtn.style.display = 'inline-block';
        this.updateStatus('正在监听...');
        this.updateListeningIndicator('listening', '正在监听...');

        // Unmute video players after user interaction (browser autoplay policy)
        this.videoPlayer1.muted = false;
        this.videoPlayer2.muted = false;
        console.log('Video players unmuted after user interaction');
    }

    stopListening() {
        console.log('stopListening called');

        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                console.error('Error stopping recognition:', e);
            }
            this.recognition = null;
        }

        // Clear any pending timeouts
        if (this.recognitionTimeout) {
            clearTimeout(this.recognitionTimeout);
            this.recognitionTimeout = null;
        }

        // Reset flags
        this.isListening = false;
        this.isRestarting = false;
        this.recognitionRetryCount = 0;

        this.startBtn.style.display = 'inline-block';
        this.stopBtn.style.display = 'none';
        this.updateStatus('已停止');
        this.updateListeningIndicator('idle', '待机');
    }

    startBrowserRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('浏览器不支持语音识别。请使用 Chrome 或 Edge 浏览器。');
            this.stopListening();
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        // Use non-continuous mode for short, discrete commands
        this.recognition.continuous = false;
        this.recognition.interimResults = this.recognitionSettings.interimResults;
        this.recognition.lang = this.recognitionSettings.language;
        this.recognition.maxAlternatives = this.recognitionSettings.maxAlternatives;

        console.log('Starting recognition in discrete command mode');
        console.log('Valid commands:', Object.keys(this.commandMap));

        this.recognition.onresult = (event) => {
            // Update last recognition time and clear timeout
            this.lastRecognitionTime = Date.now();
            if (this.recognitionTimeout) {
                clearTimeout(this.recognitionTimeout);
                this.recognitionTimeout = null;
            }

            const last = event.results.length - 1;
            const result = event.results[last];

            if (result.isFinal) {
                // Show processing state
                this.updateListeningIndicator('processing', '处理中...');

                // Check all alternatives, not just the first one
                let matched = false;
                let hasValidAlternative = false;

                for (let i = 0; i < result.length; i++) {
                    const text = result[i].transcript.trim();
                    const confidence = result[i].confidence;

                    // Skip empty results (indicates recognition issue)
                    if (text === '' || confidence === 0) {
                        console.log(`Alternative ${i}: empty or zero confidence, skipping`);
                        continue;
                    }

                    hasValidAlternative = true;
                    console.log(`Alternative ${i}: "${text}" (confidence: ${confidence})`);

                    // Apply confidence threshold
                    if (confidence < this.recognitionSettings.confidenceThreshold) {
                        console.log(`Skipping alternative ${i} due to low confidence (${confidence} < ${this.recognitionSettings.confidenceThreshold})`);
                        continue;
                    }

                    if (!matched) {
                        // Try to match this alternative
                        if (this.tryProcessCommand(text)) {
                            matched = true;
                            this.recognizedEl.textContent = `✓ ${text} (${(confidence * 100).toFixed(0)}%)`;
                            this.updateButtonPressedState(text);
                            this.updateListeningIndicator('listening', '✓ 匹配成功');
                            console.log(`Matched with alternative ${i}`);

                            // Return to listening state after a brief moment
                            setTimeout(() => {
                                if (this.isListening) {
                                    this.updateListeningIndicator('listening', '正在监听...');
                                }
                            }, 1000);
                        }
                    }
                }

                // If no valid alternatives, recognition might be broken - restart it
                if (!hasValidAlternative) {
                    console.warn('Recognition returned no valid alternatives - may be broken, restarting...');
                    this.updateListeningIndicator('error', '⚠️ 重启识别...');

                    // Force restart recognition
                    if (this.recognition) {
                        this.recognition.stop();
                    }

                    setTimeout(() => {
                        if (this.isListening) {
                            console.log('Restarting recognition after empty results');
                            this.startBrowserRecognition();
                        }
                    }, 500);
                    return;
                }

                if (!matched) {
                    console.log('No match found in any alternative');
                    // Show the first alternative but indicate no match
                    const text = result[0].transcript.trim();
                    const confidence = result[0].confidence;
                    this.recognizedEl.textContent = `✗ ${text} (${(confidence * 100).toFixed(0)}%)`;
                    this.updateButtonPressedState(text);

                    // Check if it was filtered by confidence threshold
                    if (confidence < this.recognitionSettings.confidenceThreshold) {
                        this.updateListeningIndicator('error', '✗ 置信度过低');
                    } else {
                        this.updateListeningIndicator('error', '✗ 未匹配');

                        // Always trigger conversation mode if enabled (no command matching in voice recognition)
                        if (this.conversationEnabled && this.dashscopeClient) {
                            console.log('Starting conversation with:', text);
                            this.startConversation(text);
                        } else {
                            // Only play error sound if conversation mode is disabled
                            console.log('Conversation mode disabled, playing error acknowledgement');
                            this.playAcknowledgement(text, false);
                        }
                    }

                    // Return to listening state after a brief moment
                    setTimeout(() => {
                        if (this.isListening && !this.isTalking) {
                            this.updateListeningIndicator('listening', '正在监听...');
                        }
                    }, 1500);
                }
            } else {
                // Show interim results
                const text = result[0].transcript.trim();
                console.log('Recognized (interim):', text);
                this.recognizedEl.textContent = text + ' (...)';
                this.updateButtonPressedState(text);
                this.updateListeningIndicator('listening', '识别中...');

                // Also try to match interim results for faster response
                // This helps when final results are delayed or never arrive
                if (text.length > 0 && !this.lastProcessedInterim) {
                    const matched = this.tryProcessCommand(text);
                    if (matched) {
                        console.log('Matched from interim result:', text);
                        this.lastProcessedInterim = text;
                        this.recognizedEl.textContent = `✓ ${text} (interim)`;
                        this.updateListeningIndicator('listening', '✓ 匹配成功');

                        // Clear the interim flag after a delay to allow new commands
                        setTimeout(() => {
                            this.lastProcessedInterim = null;
                        }, 2000);
                    }
                }
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            console.log('Error details - type:', event.type, 'error:', event.error, 'message:', event.message);
            console.log('Network status:', {
                online: navigator.onLine,
                connection: navigator.connection?.effectiveType || 'unknown',
                timestamp: new Date().toISOString()
            });

            if (event.error === 'no-speech') {
                console.log('No speech detected, continuing...');
                this.updateListeningIndicator('listening', '等待语音...');
                return;
            }
            if (event.error === 'aborted') {
                console.log('Recognition aborted');
                return;
            }
            if (event.error === 'audio-capture') {
                this.updateStatus('麦克风错误');
                this.updateListeningIndicator('error', '麦克风错误');
                // Try to restart after audio-capture error
                setTimeout(() => {
                    if (this.isListening) {
                        console.log('Attempting to restart after audio-capture error');
                        this.stopListening();
                        setTimeout(() => this.startListening(), 1000);
                    }
                }, 1000);
                return;
            }
            if (event.error === 'network') {
                console.warn('Network error detected');
                this.updateStatus('网络错误');
                this.updateListeningIndicator('error', '网络错误');

                // Simple restart - just like the original code
                setTimeout(() => {
                    if (this.isListening) {
                        console.log('Attempting to restart after network error');
                        this.stopListening();
                        setTimeout(() => this.startListening(), 2000);
                    }
                }, 1000);
                return;
            }

            // Other errors
            this.updateStatus(`错误: ${event.error}`);
            this.updateListeningIndicator('error', `错误: ${event.error}`);
        };

        this.recognition.onend = () => {
            console.log('Recognition ended, isListening:', this.isListening, 'isRestarting:', this.isRestarting);
            console.log('Recognition object exists:', !!this.recognition);

            // Don't restart if already restarting (prevents race condition)
            if (this.isRestarting) {
                console.log('Already restarting from error handler, skipping onend restart');
                return;
            }

            if (this.isListening) {
                // Restart recognition immediately for next command
                console.log('Attempting to restart recognition for next command...');
                setTimeout(() => {
                    if (!this.isListening) {
                        console.log('isListening is now false, aborting restart');
                        return;
                    }

                    if (this.isRestarting) {
                        console.log('Already restarting, skipping onend restart');
                        return;
                    }

                    try {
                        if (!this.recognition) {
                            console.error('Recognition object is null, recreating...');
                            this.startBrowserRecognition();
                            return;
                        }

                        this.recognition.start();
                        console.log('Recognition restarted for next command');
                    } catch (e) {
                        console.error('Error restarting recognition:', e);
                        console.log('Error name:', e.name, 'Error message:', e.message);

                        // If already started, just log and continue
                        if (e.name === 'InvalidStateError') {
                            console.log('Recognition already running, continuing...');
                            return;
                        }

                        // Try again after a longer delay if there was an error
                        setTimeout(() => {
                            if (this.isListening && !this.isRestarting) {
                                try {
                                    console.log('Second restart attempt...');
                                    this.recognition.start();
                                    console.log('Recognition restarted on second attempt');
                                } catch (e2) {
                                    console.error('Failed to restart recognition on second attempt:', e2);
                                    // Last resort: recreate the recognition object
                                    console.log('Recreating recognition object...');
                                    this.startBrowserRecognition();
                                }
                            }
                        }, 1000);
                    }
                }, 150); // Reduced delay for faster response
            } else {
                console.log('isListening is false, not restarting recognition');
            }
        };

        this.recognition.onstart = () => {
            console.log('Recognition started successfully');
            console.log('Recognition state - isListening:', this.isListening, 'continuous:', this.recognition.continuous, 'isRestarting:', this.isRestarting);
            this.updateStatus('正在监听...');
            this.updateListeningIndicator('listening', '正在监听...');

            // Reset flags on successful start
            this.isRestarting = false;
            this.recognitionRetryCount = 0;
            console.log('Recognition started successfully, flags reset');

            // Set a timeout to force restart if no result comes back within 5 seconds
            // This prevents the recognition from getting stuck waiting for silence
            if (this.recognitionTimeout) {
                clearTimeout(this.recognitionTimeout);
            }
            this.recognitionTimeout = setTimeout(() => {
                const timeSinceLastResult = Date.now() - this.lastRecognitionTime;
                console.warn(`Recognition timeout: no result for ${timeSinceLastResult}ms, forcing restart...`);
                this.updateListeningIndicator('error', '⏱️ 超时重启...');

                // Force stop and restart
                if (this.recognition && this.isListening && !this.isRestarting) {
                    try {
                        this.recognition.stop();
                    } catch (e) {
                        console.error('Error stopping recognition:', e);
                    }

                    setTimeout(() => {
                        if (this.isListening && !this.isRestarting) {
                            console.log('Restarting recognition after timeout');
                            this.startBrowserRecognition();
                        }
                    }, 500);
                }
            }, 5000); // 5 second timeout
        };

        try {
            this.recognition.start();
        } catch (e) {
            console.error('Error starting recognition:', e);
            this.updateStatus('启动识别失败');
        }
    }

    // Helper method to try processing a command and return if it matched
    tryProcessCommand(text) {
        const lowerText = text.toLowerCase();

        // Get all valid commands from the current configuration
        const validCommands = Object.keys(this.commandMap);

        console.log('Valid commands for current set:', validCommands);
        console.log('Trying to match:', text);

        // Find all keywords that appear in the text with their positions
        const matches = [];

        for (const command of validCommands) {
            // Try to find the command in the text (case-insensitive for non-Chinese, exact for Chinese)
            let position = -1;

            // For single character commands (like Chinese characters), do exact match
            if (command.length === 1) {
                position = text.indexOf(command);
            }

            // If not found, try case-insensitive match
            if (position === -1) {
                const lowerCommand = command.toLowerCase();
                position = lowerText.indexOf(lowerCommand);
            }

            if (position !== -1) {
                matches.push({
                    command: command,
                    position: position,
                    video: this.commandMap[command]
                });
            }
        }

        // If we found matches, sort by position and take the first one
        if (matches.length > 0) {
            // If in conversation mode, interrupt it
            if (this.isTalking) {
                this.interruptConversation();
            }

            matches.sort((a, b) => a.position - b.position);
            const firstMatch = matches[0];

            console.log(`Found ${matches.length} match(es), using first: ${firstMatch.command} at position ${firstMatch.position} -> ${firstMatch.video}`);
            if (matches.length > 1) {
                console.log('Other matches ignored:', matches.slice(1).map(m => `${m.command} at ${m.position}`).join(', '));
            }

            // Check if this is a special command that returns to previous video
            const commandConfig = this.configLoader.getCommandByKeyword(this.currentSet, firstMatch.command);
            const isSpecialCommand = commandConfig && commandConfig.returnToPrevious;

            // Update intent display with action name + "起来"
            this.updateIntentDisplay(commandConfig);

            this.queueVideoSwitch(firstMatch.video, isSpecialCommand);
            this.playAcknowledgement(firstMatch.command, true);
            return true;
        }

        console.log('No match found for:', text);
        // Clear intent display on no match
        this.intentEl.textContent = '-';

        // Don't play error acknowledgement - will start conversation instead
        // this.playAcknowledgement(text, false);
        return false;
    }

    processCommand(text) {
        console.log('Processing command:', text);

        // If conversation mode is enabled, always send to LLM for semantic understanding
        if (this.conversationEnabled && this.dashscopeClient) {
            console.log('Conversation mode enabled, sending to LLM:', text);
            this.startConversation(text);
            return;
        }

        // Otherwise, use traditional command matching (for when conversation is disabled)
        if (!this.tryProcessCommand(text)) {
            console.log('No command matched and conversation mode disabled');
            this.playAcknowledgement(text, false);
        }
    }

    queueVideoSwitch(videoFile, isSpecialCommand = false) {
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

        // Store previous video before switching (for special commands that return to previous)
        if (isSpecialCommand) {
            this.previousVideo = this.currentVideo;
            console.log(`Special command detected, storing previous video: ${this.previousVideo}`);
        }

        // Set queued video
        this.queuedVideo = videoFile;
        this.queuedVideoEl.textContent = videoFile;

        if (this.immediateSwitch) {
            // Immediate switch mode: interrupt current video and switch right away
            console.log(`Switching immediately to video: ${videoFile}`);

            // Preload the video for instant switching
            if (!this.preloadedVideos[videoFile]) {
                console.log(`Preloading video: ${videoFile}`);
                const video = document.createElement('video');
                video.preload = 'auto';
                video.src = `/videos/${this.currentSet}/${videoFile}`;
                video.muted = true;

                video.addEventListener('loadeddata', () => {
                    this.preloadedVideos[videoFile] = video;
                    console.log(`Video preloaded: ${videoFile}`);
                    // Switch immediately after preload
                    this.switchVideo();
                });

                video.load();
            } else {
                // Video already preloaded, switch immediately
                this.switchVideo();
            }
        } else {
            // Wait for current video to finish mode: just queue it
            console.log(`Queued video: ${videoFile} (will play after current video ends)`);

            // Preload in background for smooth transition
            if (!this.preloadedVideos[videoFile]) {
                console.log(`Preloading video in background: ${videoFile}`);
                const video = document.createElement('video');
                video.preload = 'auto';
                video.src = `/videos/${this.currentSet}/${videoFile}`;
                video.muted = true;
                video.load();

                video.addEventListener('loadeddata', () => {
                    this.preloadedVideos[videoFile] = video;
                    console.log(`Video preloaded in background: ${videoFile}`);
                });
            }
        }
    }

    switchVideo() {
        if (!this.queuedVideo) {
            console.log('switchVideo called but no queued video');
            return;
        }

        if (this.isSwitching) {
            console.log('switchVideo called but already switching, will retry after current switch');
            // Queue another switch after current one completes
            setTimeout(() => {
                if (!this.isSwitching && this.queuedVideo) {
                    this.switchVideo();
                }
            }, 600);
            return;
        }

        const videoToPlay = this.queuedVideo;
        this.queuedVideo = null;
        this.queuedVideoEl.textContent = '-';

        this.currentVideo = videoToPlay;
        this.currentVideoEl.textContent = videoToPlay;

        this.isSwitching = true;
        console.log(`Starting immediate switch to ${videoToPlay}`);

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
                }, 500); // Transition duration
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
        console.log('Previous video:', this.previousVideo);

        if (this.queuedVideo) {
            console.log('Switching to queued video:', this.queuedVideo);
            // Immediate switch to queued video
            this.switchVideo();
        } else {
            // Check if current video is a special video that should return to previous
            const currentVideoConfig = this.videoFiles.find(v => v.id === this.currentVideo);
            if (currentVideoConfig && currentVideoConfig.returnToPrevious && this.previousVideo) {
                // Return to previous video
                console.log('Special video ended, returning to previous video:', this.previousVideo);
                this.queuedVideo = this.previousVideo;
                this.previousVideo = null; // Clear previous video after using it
                this.switchVideo();
            } else if (this.currentVideo === this.idleVideo) {
                // Loop the idle video
                console.log('Looping idle video:', this.idleVideo);
                this.activePlayer.currentTime = 0;
                this.activePlayer.play().catch(() => {
                    console.error('Error looping idle video');
                });
            } else {
                // Non-idle video ended, return to idle video immediately
                console.log('Non-idle video ended, returning to idle video:', this.idleVideo);
                this.queuedVideo = this.idleVideo;
                this.switchVideo();
            }
        }
    }

    updateStatus(status) {
        this.statusEl.textContent = status;
    }

    updateIntentDisplay(commandConfig) {
        if (!commandConfig || !this.intentEl) {
            return;
        }

        // Get the primary keyword (the main action name)
        const primaryKeyword = commandConfig.primaryKeyword;

        // Display as "action起来" (e.g., "扭起来", "抖起来", "唱起来")
        const intentText = `${primaryKeyword}起来`;
        this.intentEl.textContent = intentText;

        console.log('Intent recognized:', intentText);
    }

    updateButtonPressedState(text) {
        // Check if the recognized text contains '停'
        if (text.includes('停')) {
            this.stopBtn.classList.add('pressed');
        } else {
            this.stopBtn.classList.remove('pressed');
        }
    }

    updateListeningIndicator(state, statusText) {
        if (!this.listeningIndicator || !this.listeningStatus) return;

        // Remove all state classes
        this.listeningIndicator.classList.remove('idle', 'listening', 'processing', 'error');

        // Add the new state class
        this.listeningIndicator.classList.add(state);

        // Update status text
        this.listeningStatus.textContent = statusText;
    }

    /**
     * Load recognition settings from localStorage
     */
    loadRecognitionSettings() {
        const defaultSettings = {
            continuous: true, // Always true for streaming mode
            interimResults: true,
            language: 'zh-CN',
            maxAlternatives: 10,
            confidenceThreshold: 0.3
        };

        try {
            const saved = localStorage.getItem('recognitionSettings');
            if (saved) {
                const parsed = JSON.parse(saved);
                console.log('Loaded recognition settings from localStorage:', parsed);
                // Force continuous mode even if saved settings say otherwise
                return { ...defaultSettings, ...parsed, continuous: true };
            }
        } catch (e) {
            console.error('Error loading recognition settings:', e);
        }

        return defaultSettings;
    }

    /**
     * Load immediate switch setting from localStorage
     */
    loadImmediateSwitchSetting() {
        try {
            const saved = localStorage.getItem('immediateSwitch');
            if (saved !== null) {
                const value = JSON.parse(saved);
                console.log('Loaded immediate switch setting from localStorage:', value);
                return value;
            }
        } catch (e) {
            console.error('Error loading immediate switch setting:', e);
        }

        // Default to true (immediate switch)
        return true;
    }

    /**
     * Save immediate switch setting to localStorage
     */
    saveImmediateSwitchSetting() {
        try {
            localStorage.setItem('immediateSwitch', JSON.stringify(this.immediateSwitch));
            console.log('Saved immediate switch setting to localStorage:', this.immediateSwitch);
        } catch (e) {
            console.error('Error saving immediate switch setting:', e);
        }
    }

    /**
     * Save recognition settings to localStorage
     */
    saveRecognitionSettings() {
        try {
            localStorage.setItem('recognitionSettings', JSON.stringify(this.recognitionSettings));
            console.log('Saved recognition settings to localStorage');
        } catch (e) {
            console.error('Error saving recognition settings:', e);
        }
    }

    /**
     * Check browser compatibility for speech recognition
     */
    checkBrowserCompatibility() {
        const hasSupport = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);

        if (!hasSupport) {
            console.warn('Browser does not support Web Speech API');

            // Show warning banner
            const container = document.querySelector('.container');
            const warningDiv = document.createElement('div');
            warningDiv.className = 'browser-warning';
            warningDiv.innerHTML = `
                <h3>⚠️ 浏览器不支持语音识别</h3>
                <p>您的浏览器不支持 Web Speech API。请使用 Chrome、Edge 或 Safari 浏览器。</p>
            `;
            container.insertBefore(warningDiv, container.firstChild);

            return false;
        }

        console.log('Browser supports Web Speech API');
        return true;
    }

    /**
     * Load conversation enabled setting from localStorage
     */
    loadConversationEnabled() {
        try {
            const saved = localStorage.getItem('conversationEnabled');
            console.log('[loadConversationEnabled] localStorage value:', saved, 'type:', typeof saved);

            // If no value is saved, set default to true and save it
            if (saved === null) {
                console.log('[loadConversationEnabled] No localStorage value, setting default: true');
                localStorage.setItem('conversationEnabled', 'true');
                return true;
            }

            const enabled = saved === 'true';
            console.log('[loadConversationEnabled] Loaded from localStorage:', enabled);
            return enabled;
        } catch (e) {
            console.error('Error loading conversation enabled:', e);
            return true; // Default to true on error
        }
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
                // Handle autoplay policy errors gracefully
                if (err.name === 'NotAllowedError') {
                    console.log('Audio playback blocked by browser autoplay policy. User interaction required first.');
                    // Silently fail - audio will work after first user interaction
                } else {
                    console.error('Error playing acknowledgement audio:', err);
                }
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
     * Create speech recognition settings UI
     */
    createRecognitionSettings() {
        const settingsDiv = document.createElement('div');
        settingsDiv.className = 'recognition-settings collapsed';
        settingsDiv.innerHTML = `
            <h3>⚙️ 语音识别设置</h3>

            <div class="settings-grid">
                <div class="setting-item">
                    <label>
                        语言:
                        <select id="recognitionLanguage">
                            <option value="zh-CN" selected>中文</option>
                            <option value="en-US">英语 (美国)</option>
                            <option value="en-GB">英语 (英国)</option>
                            <option value="ja-JP">日本語</option>
                            <option value="ko-KR">한국어</option>
                        </select>
                    </label>
                </div>

                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="continuousMode" checked disabled>
                        连续模式 (流式体验)
                    </label>
                    <span class="setting-hint">自动启动，持续监听</span>
                </div>

                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="interimResults" checked>
                        实时结果
                    </label>
                    <span class="setting-hint">显示识别中的临时结果</span>
                </div>

                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="immediateSwitchToggle" checked>
                        立即切换视频
                    </label>
                    <span class="setting-hint">收到命令后立即切换，不等待当前视频播放完毕</span>
                </div>

                <div class="setting-item">
                    <label>
                        备选数量:
                        <input type="range" id="maxAlternatives"
                               min="1" max="20" value="10" step="1">
                        <span id="maxAlternativesValue">10</span>
                    </label>
                    <span class="setting-hint">更多备选可提高匹配准确度</span>
                </div>

                <div class="setting-item">
                    <label>
                        置信度阈值:
                        <input type="range" id="confidenceThreshold"
                               min="0" max="1" value="0.5" step="0.05">
                        <span id="confidenceThresholdValue">0.30</span>
                    </label>
                    <span class="setting-hint">过滤低置信度结果 (0-1)</span>
                </div>
            </div>
        `;

        // Insert after the recognized display
        const recognizedDisplay = document.querySelector('.recognized-display');
        recognizedDisplay.parentNode.insertBefore(settingsDiv, recognizedDisplay.nextSibling);

        // Add collapse/expand functionality
        const settingsHeader = settingsDiv.querySelector('h3');
        settingsHeader.addEventListener('click', () => {
            settingsDiv.classList.toggle('collapsed');
        });

        // Add event listeners
        const languageSelect = document.getElementById('recognitionLanguage');
        const continuousMode = document.getElementById('continuousMode');
        const interimResults = document.getElementById('interimResults');
        const immediateSwitchToggle = document.getElementById('immediateSwitchToggle');
        const maxAlternatives = document.getElementById('maxAlternatives');
        const maxAlternativesValue = document.getElementById('maxAlternativesValue');
        const confidenceThreshold = document.getElementById('confidenceThreshold');
        const confidenceThresholdValue = document.getElementById('confidenceThresholdValue');

        // Set initial values from saved settings
        languageSelect.value = this.recognitionSettings.language;
        continuousMode.checked = true; // Always true for streaming mode
        interimResults.checked = this.recognitionSettings.interimResults;
        immediateSwitchToggle.checked = this.immediateSwitch;
        maxAlternatives.value = this.recognitionSettings.maxAlternatives;
        maxAlternativesValue.textContent = this.recognitionSettings.maxAlternatives;
        confidenceThreshold.value = this.recognitionSettings.confidenceThreshold;
        confidenceThresholdValue.textContent = this.recognitionSettings.confidenceThreshold.toFixed(2);

        languageSelect.addEventListener('change', (e) => {
            this.recognitionSettings.language = e.target.value;
            this.saveRecognitionSettings();
            console.log('Language changed to:', e.target.value);
            if (this.isListening) {
                // Restart recognition with new settings
                this.stopListening();
                setTimeout(() => this.startListening(), 300);
            }
        });

        // Continuous mode is always enabled for streaming experience
        // continuousMode.addEventListener('change', (e) => {
        //     this.recognitionSettings.continuous = e.target.checked;
        //     this.saveRecognitionSettings();
        //     console.log('Continuous mode:', e.target.checked);
        //     if (this.isListening) {
        //         this.stopListening();
        //         setTimeout(() => this.startListening(), 300);
        //     }
        // });

        interimResults.addEventListener('change', (e) => {
            this.recognitionSettings.interimResults = e.target.checked;
            this.saveRecognitionSettings();
            console.log('Interim results:', e.target.checked);
            if (this.isListening) {
                this.stopListening();
                setTimeout(() => this.startListening(), 300);
            }
        });

        immediateSwitchToggle.addEventListener('change', (e) => {
            this.immediateSwitch = e.target.checked;
            this.saveImmediateSwitchSetting();
            console.log('Immediate switch:', e.target.checked);
        });

        maxAlternatives.addEventListener('input', (e) => {
            this.recognitionSettings.maxAlternatives = parseInt(e.target.value);
            maxAlternativesValue.textContent = e.target.value;
            this.saveRecognitionSettings();
            console.log('Max alternatives:', e.target.value);
            if (this.isListening) {
                this.stopListening();
                setTimeout(() => this.startListening(), 300);
            }
        });

        confidenceThreshold.addEventListener('input', (e) => {
            this.recognitionSettings.confidenceThreshold = parseFloat(e.target.value);
            confidenceThresholdValue.textContent = parseFloat(e.target.value).toFixed(2);
            this.saveRecognitionSettings();
            console.log('Confidence threshold:', e.target.value);
        });
    }

    /**
     * Create audio control UI
     */
    createAudioControls() {
        const controlsDiv = document.querySelector('.controls');
        const audioControlsDiv = document.createElement('div');
        audioControlsDiv.className = 'audio-controls';
        audioControlsDiv.innerHTML = `
            <div class="audio-control-item">
                <label>
                    <input type="checkbox" id="audioAckToggle" checked>
                    启用语音确认
                </label>
            </div>

            <div class="audio-control-item">
                <label>
                    音量:
                    <input type="range" id="audioVolumeSlider"
                           min="0" max="100" value="70" step="1">
                    <span id="audioVolumeValue">70%</span>
                </label>
            </div>

            <div class="audio-control-item">
                <button id="audioMuteBtn" class="btn-small">🔊 静音 </button>
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
            console.log(`Audio ack ${this.audioAckEnabled ? 'enabled' : 'disabled'}`);
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
                audioMuteBtn.textContent = '🔇 取消静音';
                audioMuteBtn.classList.add('muted');
            } else {
                // Unmute
                this.setAudioVolume(previousVolume);
                audioVolumeSlider.value = Math.round(previousVolume * 100);
                audioVolumeValue.textContent = `${Math.round(previousVolume * 100)}%`;
                audioMuteBtn.textContent = '🔊 静音 ';
                audioMuteBtn.classList.remove('muted');
            }
        });
    }

    /**
     * Create conversation mode toggle UI
     */
    createConversationToggle() {
        console.log('createConversationToggle called, conversationEnabled:', this.conversationEnabled);

        const controlsDiv = document.querySelector('.controls');
        const conversationToggleDiv = document.createElement('div');
        conversationToggleDiv.className = 'conversation-toggle';
        conversationToggleDiv.innerHTML = `
            <div class="toggle-item">
                <label>
                    <input type="checkbox" id="conversationToggle" ${this.conversationEnabled ? 'checked' : ''}>
                    <span class="toggle-label">💬 对话模式</span>
                </label>
                <span class="toggle-hint">启用后，未匹配的语音将触发AI对话</span>
            </div>
        `;

        console.log('Checkbox HTML:', conversationToggleDiv.innerHTML);

        // Insert after audio controls
        const audioControls = document.querySelector('.audio-controls');
        if (audioControls) {
            audioControls.parentNode.insertBefore(conversationToggleDiv, audioControls.nextSibling);
        } else {
            controlsDiv.parentNode.insertBefore(conversationToggleDiv, controlsDiv.nextSibling);
        }

        // Add event listener
        const conversationToggle = document.getElementById('conversationToggle');
        conversationToggle.addEventListener('change', (e) => {
            this.conversationEnabled = e.target.checked;
            console.log(`Conversation mode ${this.conversationEnabled ? 'enabled' : 'disabled'}`);

            // Save to localStorage
            localStorage.setItem('conversationEnabled', this.conversationEnabled);

            // Show feedback
            const status = this.conversationEnabled ? '已启用' : '已禁用';
            this.updateStatus(`对话模式${status}`);
            setTimeout(() => {
                if (!this.isListening && !this.isTalking) {
                    this.updateStatus('就绪');
                }
            }, 2000);
        });
    }

    /**
     * Start conversation with DashScope LLM
     */
    async startConversation(userMessage) {
        if (this.isTalking) {
            console.log('Already in conversation, ignoring new request');
            return;
        }

        console.log('Starting conversation with message:', userMessage);
        this.isTalking = true;

        // Stop current TTS if playing
        this.stopTTS();

        // BGM volume is now controlled by conversation mode toggle, not here

        // Update UI
        this.updateStatus('💬 对话中...');
        this.updateListeningIndicator('processing', '💬 思考中...');
        this.intentEl.textContent = '对话模式';

        // Start playing talk video in loop
        this.startTalkVideoLoop();

        let fullResponse = '';
        let firstChunk = true;
        let hasAudioVideo = false; // Track if function call has pre-recorded audio

        try {
            await this.dashscopeClient.streamChat(
                userMessage,
                {
                    // onChunk - called for each text chunk
                    onChunk: (chunk, accumulated) => {
                        fullResponse = accumulated;
                        console.log('LLM chunk:', chunk);

                        // Update recognized display with response
                        this.recognizedEl.textContent = `💬 ${accumulated}`;

                        // For first chunk, start TTS immediately for low latency
                        if (firstChunk) {
                            firstChunk = false;
                            this.updateListeningIndicator('processing', '💬 回复中...');
                        }
                    },
                    // onFunctionCall - called when LLM triggers a function
                    onFunctionCall: (functionCall) => {
                        console.log('Function call received:', functionCall);

                        if (functionCall.name === 'play_action_video') {
                            const args = functionCall.arguments;
                            const videoId = args.video_id;
                            const hasAudio = args.has_audio || false;

                            console.log(`Playing action video: ${videoId}, has_audio: ${hasAudio}`);

                            // Queue the action video to play
                            this.queueVideoSwitch(videoId, false);

                            // If video has pre-recorded audio, skip TTS
                            if (hasAudio) {
                                hasAudioVideo = true;
                                console.log('Video has pre-recorded audio, will skip TTS');
                            }
                        }
                    },
                    // onComplete - called when streaming finishes
                    onComplete: async (response) => {
                        console.log('LLM complete, full response:', response);

                        // If video has pre-recorded audio, skip TTS synthesis
                        if (hasAudioVideo) {
                            console.log('Skipping TTS - video has pre-recorded audio');

                            // Stop talk video loop immediately
                            this.stopTalkVideoLoop();
                            this.isTalking = false;

                            // Return to listening state
                            this.updateStatus('正在监听...');
                            this.updateListeningIndicator('listening', '正在监听...');
                            this.intentEl.textContent = '-';

                            // Restart voice recognition if it was listening
                            const wasListening = this.isListening;
                            if (wasListening) {
                                console.log('Restarting voice recognition after action video');
                                setTimeout(() => {
                                    if (!this.isListening) {
                                        this.startBrowserRecognition();
                                    }
                                }, 500);
                            }

                            return;
                        }

                        // Synthesize the full response to speech (only if no pre-recorded audio)
                        if (response && response.trim().length > 0) {
                            try {
                                this.updateListeningIndicator('processing', '🔊 合成语音...');
                                console.log('Calling synthesizeSpeech with text:', response);

                                const audioBlob = await this.dashscopeClient.synthesizeSpeech(response);
                                console.log('TTS synthesis complete, blob size:', audioBlob.size, 'type:', audioBlob.type);

                                // Play TTS audio
                                console.log('Starting TTS playback...');

                                // Stop voice recognition during TTS to avoid feedback loop
                                const wasListening = this.isListening;
                                if (wasListening && this.recognition) {
                                    console.log('Stopping voice recognition during TTS playback');
                                    try {
                                        this.recognition.stop();
                                    } catch (e) {
                                        console.error('Error stopping recognition:', e);
                                    }
                                }

                                await this.playTTS(audioBlob);
                                console.log('TTS playback complete');

                                // Restart voice recognition after TTS with a small delay
                                if (wasListening) {
                                    console.log('Restarting voice recognition after TTS');
                                    setTimeout(() => {
                                        if (!this.isListening) {
                                            this.startBrowserRecognition();
                                        }
                                    }, 500); // Small delay to ensure TTS audio is fully stopped
                                }

                                // After TTS finishes, stop talk video and return to idle
                                this.stopTalkVideoLoop();
                                this.isTalking = false;

                                // BGM volume is controlled by conversation mode toggle, not restored here

                                // Return to listening state
                                this.updateStatus('正在监听...');
                                this.updateListeningIndicator('listening', '正在监听...');
                                this.intentEl.textContent = '-';

                            } catch (error) {
                                console.error('Error in TTS:', error);
                                console.error('Error stack:', error.stack);
                                this.stopTalkVideoLoop();
                                this.isTalking = false;

                                // BGM volume is controlled by conversation mode toggle

                                this.updateStatus('TTS错误');
                                this.updateListeningIndicator('error', 'TTS错误');
                            }
                        } else {
                            // No text response, just stop talk video
                            console.log('No text response, stopping talk video');
                            this.stopTalkVideoLoop();
                            this.isTalking = false;

                            this.updateStatus('正在监听...');
                            this.updateListeningIndicator('listening', '正在监听...');
                            this.intentEl.textContent = '-';
                        }
                    },
                    // onError - called on error
                    onError: (error) => {
                        console.error('LLM error:', error);
                        this.stopTalkVideoLoop();
                        this.isTalking = false;

                        // BGM volume is controlled by conversation mode toggle

                        this.updateStatus('对话错误');
                        this.updateListeningIndicator('error', '对话错误');
                        this.recognizedEl.textContent = `✗ 错误: ${error.message}`;

                        // Return to listening after a delay
                        setTimeout(() => {
                            if (this.isListening) {
                                this.updateStatus('正在监听...');
                                this.updateListeningIndicator('listening', '正在监听...');
                            }
                        }, 2000);
                    },
                    // Pass available actions for function calling
                    actions: this.conversationActions
                }
            );

        } catch (error) {
            console.error('Error starting conversation:', error);
            this.stopTalkVideoLoop();
            this.isTalking = false;
            this.updateStatus('对话错误');
            this.updateListeningIndicator('error', '对话错误');
        }
    }

    /**
     * Start playing talk video in infinite loop
     */
    startTalkVideoLoop() {
        if (!this.talkVideo) {
            console.warn('No talk video configured');
            return;
        }

        console.log('Starting talk video loop:', this.talkVideo);

        // Store current video to return to later
        if (!this.isTalking) {
            this.previousVideo = this.currentVideo;
        }

        // Extract just the filename from the path
        const talkVideoFile = this.talkVideo.split('/').pop();

        // Queue the talk video
        this.queuedVideo = talkVideoFile;
        this.queuedVideoEl.textContent = talkVideoFile + ' (循环)';

        // Switch to talk video immediately
        if (!this.preloadedVideos[talkVideoFile]) {
            console.log(`Preloading talk video: ${talkVideoFile}`);
            const video = document.createElement('video');
            video.preload = 'auto';
            video.src = this.talkVideo;
            video.muted = false;

            video.addEventListener('loadeddata', () => {
                this.preloadedVideos[talkVideoFile] = video;
                console.log(`Talk video preloaded: ${talkVideoFile}`);
                this.switchVideo();
            });

            video.load();
        } else {
            console.log(`Talk video already preloaded, switching now`);
            this.switchVideo();
        }

        // Set the active player to loop
        this.activePlayer.loop = true;
        console.log('Talk video set to loop mode');
    }

    /**
     * Stop talk video loop and return to previous video
     */
    stopTalkVideoLoop() {
        console.log('Stopping talk video loop');

        // Disable loop mode
        this.activePlayer.loop = false;
        this.videoPlayer1.loop = false;
        this.videoPlayer2.loop = false;

        // Return to previous video or idle
        const returnVideo = this.previousVideo || this.idleVideo;
        console.log('Returning to video:', returnVideo);

        this.queuedVideo = returnVideo;
        this.queuedVideoEl.textContent = returnVideo;

        // Switch back to previous/idle video
        setTimeout(() => {
            this.switchVideo();
        }, 100);
    }

    /**
     * Play TTS audio
     */
    async playTTS(audioBlob) {
        return new Promise((resolve, reject) => {
            try {
                console.log('playTTS called with blob:', audioBlob);

                // Stop any currently playing TTS
                this.stopTTS();

                // Video is already muted when conversation starts, no need to mute again
                console.log('Playing TTS (video already muted in conversation mode)');

                // Create audio element
                this.ttsAudio = new Audio();
                const audioUrl = URL.createObjectURL(audioBlob);
                this.ttsAudio.src = audioUrl;
                this.ttsAudio.volume = 1.0; // Full volume for TTS
                console.log('TTS audio element created, volume: 1.0');

                this.ttsAudio.addEventListener('ended', () => {
                    console.log('TTS audio finished');
                    URL.revokeObjectURL(audioUrl);
                    this.ttsAudio = null;
                    resolve();
                });

                this.ttsAudio.addEventListener('error', (e) => {
                    console.error('TTS audio error:', e);
                    console.error('TTS audio error details:', e.target.error);
                    reject(new Error('TTS playback error: ' + (e.target.error?.message || 'Unknown error')));
                });

                this.ttsAudio.addEventListener('loadeddata', () => {
                    console.log('TTS audio loaded, duration:', this.ttsAudio.duration);
                });

                console.log('Starting TTS audio playback...');
                this.ttsAudio.play().then(() => {
                    console.log('TTS audio play() succeeded');
                }).catch(error => {
                    console.error('Error playing TTS audio:', error);
                    reject(error);
                });

            } catch (error) {
                console.error('Error in playTTS:', error);
                reject(error);
            }
        });
    }

    /**
     * Stop TTS audio playback
     */
    stopTTS() {
        if (this.ttsAudio) {
            console.log('Stopping TTS audio');
            this.ttsAudio.pause();
            this.ttsAudio.currentTime = 0;
            if (this.ttsAudio.src) {
                URL.revokeObjectURL(this.ttsAudio.src);
            }
            this.ttsAudio = null;

            // BGM volume is controlled by conversation mode toggle
        }

        // Clear TTS queue
        this.ttsQueue = [];
    }

    /**
     * Handle interruption during conversation
     * Called when a command is matched while in conversation mode
     */
    interruptConversation() {
        if (!this.isTalking) {
            return;
        }

        console.log('Interrupting conversation');

        // Stop TTS audio
        this.stopTTS();

        // Stop DashScope streaming
        if (this.dashscopeClient) {
            this.dashscopeClient.stopStreaming();
        }

        // Stop talk video loop
        this.stopTalkVideoLoop();

        // Reset state
        this.isTalking = false;

        // Clear conversation display
        this.intentEl.textContent = '-';
    }
}

// Initialize the controller when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VoiceVideoController();
});
