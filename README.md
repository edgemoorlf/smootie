# Smootie - Voice Controlled Video Player

A web-based proof-of-concept application that switches videos based on voice recognition. Supports both browser-based speech recognition and Dashscope API integration.

## Features

- Voice-controlled video switching
- Dual recognition modes: Browser (Web Speech API) and Dashscope API
- Supports English and Chinese commands
- Queue system: accepts commands anytime, switches videos when current video ends
- Smooth video transitions

## Voice Commands

| Command | Chinese | Action |
|---------|---------|--------|
| jump | 跳 | Switch to jump.mov |
| circle | 转 | Switch to circle.mov |
| stop | 停 | Switch to idle.mov |

## Setup

### Prerequisites

- Python 3.8+
- Modern web browser (Chrome/Edge recommended for browser recognition)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smootie
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. (Optional) For Dashscope API support:
   - Copy `.env.example` to `.env`
   - Add your Dashscope API key to `.env`

### Running the Application

1. Start the Flask server:
```bash
python app.py
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

3. Click "Start Listening" and grant microphone permissions

4. Speak commands to control the video playback

## Project Structure

```
smootie/
├── app.py                 # Flask backend server
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # Main HTML page
├── static/
│   ├── app.js            # Frontend JavaScript logic
│   └── style.css         # Styling
├── videos/
│   ├── idle.mov          # Default/stop video
│   ├── jump.mov          # Jump action video
│   └── circle.mov        # Circle action video
└── .env.example          # Environment variables template
```

## How It Works

1. The application starts with `idle.mov` playing
2. Voice recognition runs continuously in the background
3. When a command is recognized, the corresponding video is queued
4. The video switches when the current video finishes playing
5. Latest command always overrides previous queued commands

## Browser Compatibility

- **Browser Recognition**: Chrome, Edge (Web Speech API required)
- **Dashscope API**: All modern browsers

## License

MIT License - See LICENSE file for details
