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
        this.currentVideo = 'idle.mov';
        this.queuedVideo = null;
        this.isVideoPlaying = false;
        this.isSwitching = false;

        // Preloaded video elements for smooth switching
        this.preloadedVideos = {};
        this.videoFiles = ['idle.mov', 'jump.mov', 'circle.mov'];

        // Command map with similar-sounding alternatives
        this.commandMap = {
            'jump': 'jump.mov',
            '跳': 'jump.mov',
            '条': 'jump.mov',  // Similar sound to 跳
            '调': 'jump.mov',  // Similar sound to 跳
            'circle': 'circle.mov',
            '转': 'circle.mov',
            '赚': 'circle.mov',  // Similar sound to 转
            '传': 'circle.mov',  // Similar sound to 转
            '专': 'circle.mov',  // Similar sound to 转
            'stop': 'idle.mov',
            '停': 'idle.mov',
            '听': 'idle.mov',  // Similar sound to 停
            '挺': 'idle.mov',  // Similar sound to 停
            '庭': 'idle.mov'   // Similar sound to 停
        };

        this.init();
    }

    init() {
        // Preload all videos first
        this.preloadVideos().then(() => {
            console.log('All videos preloaded');
            this.updateStatus('Ready - All videos loaded');
        });

        this.startBtn.addEventListener('click', () => this.startListening());
        this.stopBtn.addEventListener('click', () => this.stopListening());

        // Add manual control button listeners
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const video = e.target.getAttribute('data-video');
                console.log('Manual button clicked:', video);
                this.queueVideoSwitch(video);
            });
        });

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
                    // Log when approaching end
                    const remaining = player.duration - player.currentTime;
                    if (remaining < 1 && remaining > 0.9) {
                        console.log(`Video ending soon, ${remaining.toFixed(2)}s remaining, queued: ${this.queuedVideo}`);
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

    async preloadVideos() {
        const preloadPromises = this.videoFiles.map(videoFile => {
            return new Promise((resolve, reject) => {
                const video = document.createElement('video');
                video.preload = 'auto';
                video.src = `/videos/${videoFile}`;

                video.addEventListener('loadeddata', () => {
                    this.preloadedVideos[videoFile] = video;
                    console.log(`Preloaded: ${videoFile}`);
                    resolve();
                });

                video.addEventListener('error', (e) => {
                    console.error(`Error preloading ${videoFile}:`, e);
                    reject(e);
                });

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

        const languageSelect = document.getElementById('languageSelect');
        const selectedLang = languageSelect ? languageSelect.value : 'zh-CN';

        // Mobile-optimized settings
        this.recognition.continuous = false; // Better for mobile - one phrase at a time
        this.recognition.interimResults = true;
        this.recognition.lang = selectedLang;
        this.recognition.maxAlternatives = 5; // More alternatives for better matching

        console.log('Starting recognition with language:', selectedLang);

        this.recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const result = event.results[last];

            if (result.isFinal) {
                // Check all alternatives, not just the first one
                let matched = false;
                for (let i = 0; i < result.length; i++) {
                    const text = result[i].transcript.trim();
                    console.log(`Alternative ${i}: ${text} (confidence: ${result[i].confidence})`);

                    if (!matched) {
                        this.recognizedEl.textContent = text;
                        // Try to match this alternative
                        if (this.tryProcessCommand(text)) {
                            matched = true;
                            console.log(`Matched with alternative ${i}`);
                        }
                    }
                }

                if (!matched) {
                    console.log('No match found in any alternative');
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

        for (const [command, video] of Object.entries(this.commandMap)) {
            const lowerCommand = command.toLowerCase();

            if (lowerText.includes(lowerCommand) ||
                chars.includes(command) ||
                words.includes(lowerCommand)) {
                console.log(`Command matched: ${command} -> ${video}`);
                this.queueVideoSwitch(video);
                return true;
            }
        }
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

        console.log(`Queueing video: ${videoFile}, will switch when current video ends`);
        this.queuedVideo = videoFile;
        this.queuedVideoEl.textContent = videoFile;

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

        // Prepare the inactive player with the new video
        this.inactivePlayer.src = `/videos/${videoToPlay}`;
        this.inactivePlayer.load();

        // Wait for the new video to be ready
        const onCanPlay = () => {
            this.inactivePlayer.removeEventListener('canplay', onCanPlay);
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
                }, 300); // Match CSS transition duration
            }).catch(err => {
                console.error('Error playing new video:', err);
                this.isSwitching = false;
            });
        };

        this.inactivePlayer.addEventListener('canplay', onCanPlay);
    }

    onVideoEnded() {
        console.log('onVideoEnded called, queuedVideo:', this.queuedVideo);
        if (this.queuedVideo) {
            console.log('Switching to queued video:', this.queuedVideo);
            this.switchVideo();
        } else {
            // Loop current video
            console.log('No queued video, looping current video');
            this.activePlayer.currentTime = 0;
            this.activePlayer.play();
        }
    }

    updateStatus(status) {
        this.statusEl.textContent = status;
    }
}

// Initialize the controller when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VoiceVideoController();
});
