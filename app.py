from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
import dashscope
from dashscope.audio.asr import Transcription
from http import HTTPStatus

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Dashscope API key
dashscope.api_key = os.getenv('DASHSCOPE_API_KEY')

if not dashscope.api_key:
    print("WARNING: DASHSCOPE_API_KEY not found in .env file")
else:
    print(f"Dashscope API key loaded: {dashscope.api_key[:10]}...")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/recognize', methods=['POST'])
def recognize_audio():
    """
    Endpoint to handle audio recognition via Dashscope API
    """
    temp_audio_path = None
    try:
        if not dashscope.api_key:
            return jsonify({'error': 'Dashscope API key not configured', 'success': False}), 500

        audio_data = request.files.get('audio')
        if not audio_data:
            return jsonify({'error': 'No audio data provided', 'success': False}), 400

        # Save audio temporarily with proper extension
        temp_audio_path = '/tmp/temp_audio.wav'
        audio_data.save(temp_audio_path)

        # Use Dashscope Transcription API (file-based, not streaming)
        task_response = Transcription.async_call(
            model='paraformer-v2',
            file_urls=[temp_audio_path],
            language_hints=['zh', 'en']
        )

        if task_response.status_code != HTTPStatus.OK:
            return jsonify({
                'error': f'Failed to submit transcription task: {task_response.message}',
                'success': False
            }), 500

        # Get the task result
        transcription_response = Transcription.wait(task=task_response.output.task_id)

        # Clean up temp file
        if temp_audio_path and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

        if transcription_response.status_code == HTTPStatus.OK:
            # Extract recognized text
            text = ''
            results = transcription_response.output.get('results', [])
            if results and len(results) > 0:
                transcription = results[0].get('transcription', {})
                text = transcription.get('text', '')

            print(f"Recognized text: {text}")
            return jsonify({
                'text': text,
                'success': True
            })
        else:
            return jsonify({
                'error': f'Recognition failed: {transcription_response.message}',
                'success': False
            }), 500

    except Exception as e:
        # Clean up temp file on error
        if temp_audio_path and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
        print(f"Error in recognize_audio: {str(e)}")
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/videos/<path:filename>')
def serve_video(filename):
    """Serve video files"""
    return send_from_directory('videos', filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
