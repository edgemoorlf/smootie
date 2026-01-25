class VoiceVideoController {
    constructor() {
        this.videoPlayer = document.getElementById('videoPlayer');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.statusEl = document.getElementById('status');
        this.recognizedEl = document.getElementById('recognized');
        this.currentVideoEl = document.getElementById('currentVideo');
        this.queuedVideoEl = document.getElementById('queuedVideo');

        this.recognition = null;
        this.mediaRecorder = null;
        this.isListening = false;
        this.currentVideo = 'idle.mov';
        this.queuedVideo = null;
        this.isVideoPlaying = false;

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

        this.videoPlayer.addEventListener('play', () => {
            this.isVideoPlaying = true;
        });

        this.videoPlayer.addEventListener('ended', () => {
            this.isVideoPlaying = false;
            this.onVideoEnded();
        });

        // Prevent fullscreen on mobile
        this.videoPlayer.addEventListener('webkitbeginfullscreen', (e) => {
            console.log('Preventing fullscreen');
            e.preventDefault();
            e.stopPropagation();
        });

        this.videoPlayer.addEventListener('webkitendfullscreen', (e) => {
            console.log('Exiting fullscreen');
        });

        // Prevent fullscreen when clicking on video
        this.videoPlayer.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Exit fullscreen if in fullscreen
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
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
        this.videoPlayer.play().catch(err => {
            console.log('Autoplay prevented, user interaction required');
            this.videoPlayer.muted = true;
            this.videoPlayer.play();
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
        return document.querySelector('input[name="mode"]:checked').value;
    }

    startListening() {
        const mode = this.getRecognitionMode();

        if (mode === 'browser') {
            this.startBrowserRecognition();
        } else {
            this.startDashscopeRecognition();
        }

        this.isListening = true;
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.updateStatus('Listening...');
    }

    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
            this.recognition = null;
        }

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }

        this.isListening = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.updateStatus('Stopped');
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

    async startDashscopeRecognition() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);

            let audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                audioChunks = [];

                await this.sendAudioToDashscope(audioBlob);

                if (this.isListening) {
                    // Restart recording
                    audioChunks = [];
                    this.mediaRecorder.start();
                    setTimeout(() => {
                        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                            this.mediaRecorder.stop();
                        }
                    }, 3000); // Record for 3 seconds at a time
                }
            };

            this.mediaRecorder.start();
            setTimeout(() => {
                if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                    this.mediaRecorder.stop();
                }
            }, 3000);

        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone. Please grant permission.');
            this.stopListening();
        }
    }

    async sendAudioToDashscope(audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
            const response = await fetch('/api/recognize', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.text) {
                this.recognizedEl.textContent = data.text;
                this.processCommand(data.text);
            }
        } catch (err) {
            console.error('Error sending audio to server:', err);
        }
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
            return;
        }

        this.queuedVideo = videoFile;
        this.queuedVideoEl.textContent = videoFile;

        // If video is not playing or is about to end, switch immediately
        if (!this.isVideoPlaying || this.videoPlayer.currentTime >= this.videoPlayer.duration - 0.5) {
            this.switchVideo();
        }
    }

    switchVideo() {
        if (!this.queuedVideo) {
            return;
        }

        const videoToPlay = this.queuedVideo;
        this.queuedVideo = null;
        this.queuedVideoEl.textContent = '-';

        this.currentVideo = videoToPlay;
        this.currentVideoEl.textContent = videoToPlay;

        const wasPaused = this.videoPlayer.paused;

        // Use preloaded video if available for instant switching
        if (this.preloadedVideos[videoToPlay]) {
            const preloadedVideo = this.preloadedVideos[videoToPlay];
            this.videoPlayer.src = preloadedVideo.src;
            this.videoPlayer.currentTime = 0;
        } else {
            // Fallback to loading if not preloaded
            this.videoPlayer.src = `/videos/${videoToPlay}`;
            this.videoPlayer.load();
        }

        if (!wasPaused) {
            this.videoPlayer.play().catch(err => {
                console.error('Error playing video:', err);
            });
        }
    }

    onVideoEnded() {
        if (this.queuedVideo) {
            this.switchVideo();
        } else {
            // Loop current video
            this.videoPlayer.play();
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
