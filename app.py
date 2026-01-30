from flask import Flask, render_template, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/videos/<path:filename>')
def serve_video(filename):
    """Serve video files"""
    return send_from_directory('videos', filename)

@app.route('/audio/<path:filename>')
def serve_audio(filename):
    """Serve audio files for voice acknowledgement"""
    return send_from_directory('audio', filename)

@app.route('/config/<path:filename>')
def serve_config(filename):
    """Serve configuration files"""
    return send_from_directory('config', filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
