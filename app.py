from flask import Flask, render_template, send_from_directory, request, Response, jsonify, stream_with_context
from flask_cors import CORS
import os
from dotenv import load_dotenv
import dashscope
from dashscope import Generation
import json
import time
from http import HTTPStatus

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure DashScope API key
dashscope.api_key = os.getenv('DASHSCOPE_API_KEY')

# Store conversation history per session (in-memory for POC)
# In production, use Redis or database
conversation_histories = {}

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

@app.route('/api/chat/stream', methods=['POST'])
def chat_stream():
    """Stream LLM responses using DashScope"""
    try:
        data = request.json
        user_message = data.get('message', '')
        session_id = data.get('session_id', 'default')

        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        # Get or create conversation history for this session
        if session_id not in conversation_histories:
            conversation_histories[session_id] = []

        history = conversation_histories[session_id]

        # Build messages with system prompt and history
        messages = [
            {
                'role': 'system',
                'content': '你是一个甜美、性感、撩人的女孩。你的回答要简短、俏皮、带有一点挑逗的语气。每次回答控制在1-2句话以内，让对话更自然流畅。'
            }
        ]

        # Add conversation history (keep last 10 turns for context)
        messages.extend(history[-20:])  # Last 10 turns = 20 messages (user + assistant)

        # Add current user message
        messages.append({'role': 'user', 'content': user_message})

        def generate():
            """Generator function for streaming responses"""
            try:
                full_response = ''

                # Call DashScope streaming API
                responses = Generation.call(
                    model='qwen-turbo',
                    messages=messages,
                    result_format='message',
                    stream=True,
                    incremental_output=True,
                    temperature=0.8,
                    max_tokens=200
                )

                for response in responses:
                    if response.status_code == HTTPStatus.OK:
                        # Get the incremental text
                        chunk = response.output.choices[0].message.content
                        full_response += chunk

                        # Send chunk to frontend
                        yield f"data: {json.dumps({'type': 'text', 'content': chunk})}\n\n"
                    else:
                        error_msg = f"Error: {response.code} - {response.message}"
                        yield f"data: {json.dumps({'type': 'error', 'content': error_msg})}\n\n"
                        return

                # Save to conversation history
                history.append({'role': 'user', 'content': user_message})
                history.append({'role': 'assistant', 'content': full_response})

                # Send completion signal
                yield f"data: {json.dumps({'type': 'done', 'content': full_response})}\n\n"

            except Exception as e:
                error_msg = f"Exception: {str(e)}"
                print(f"Error in generate(): {error_msg}")
                yield f"data: {json.dumps({'type': 'error', 'content': error_msg})}\n\n"

        return Response(
            stream_with_context(generate()),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no'
            }
        )

    except Exception as e:
        print(f"Error in chat_stream: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/clear', methods=['POST'])
def clear_history():
    """Clear conversation history for a session"""
    try:
        data = request.json
        session_id = data.get('session_id', 'default')

        if session_id in conversation_histories:
            conversation_histories[session_id] = []

        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tts/synthesize', methods=['POST'])
def tts_synthesize():
    """Synthesize speech using DashScope TTS"""
    try:
        data = request.json
        text = data.get('text', '')

        print(f"=== TTS Request ===", flush=True)
        print(f"Text to synthesize: {text}", flush=True)
        print(f"Text length: {len(text)}", flush=True)

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        # Remove emojis and special characters that might cause issues
        import re
        clean_text = re.sub(r'[^\u4e00-\u9fff\u3000-\u303fa-zA-Z0-9\s，。！？、；：""''（）《》【】…—～]', '', text)
        print(f"Cleaned text: {clean_text}", flush=True)

        # Use DashScope CosyVoice for TTS - with callback to collect audio
        from dashscope.audio.tts import SpeechSynthesizer, ResultCallback
        import io

        audio_buffer = io.BytesIO()
        error_occurred = False

        class AudioCallback(ResultCallback):
            def on_open(self):
                print("TTS: Stream opened", flush=True)

            def on_complete(self):
                print("TTS: Stream completed", flush=True)

            def on_error(self, message: str):
                nonlocal error_occurred
                error_occurred = True
                print(f"TTS error: {message}", flush=True)

            def on_close(self):
                print("TTS: Stream closed", flush=True)

            def on_event(self, result):
                if result.get_audio_frame():
                    audio_data = result.get_audio_frame()
                    audio_buffer.write(audio_data)
                    print(f"TTS: Received audio chunk of {len(audio_data)} bytes, total: {audio_buffer.tell()}", flush=True)

        callback = AudioCallback()

        print("TTS: Calling SpeechSynthesizer.call() with streaming callback...", flush=True)

        # Call with callback - use sambert model which works correctly
        try:
            result = SpeechSynthesizer.call(
                model='sambert-zhimiao-emo-v1',  # Sweet female voice with emotion
                text=clean_text,
                format='mp3',
                sample_rate=22050,
                callback=callback
            )
            print(f"TTS: Call completed successfully", flush=True)
        except KeyError as e:
            # Expected bug in dashscope library - audio is already in buffer
            print(f"TTS: Caught expected KeyError: {e} (audio already collected)", flush=True)
        except Exception as e:
            print(f"TTS: Unexpected error: {e}", flush=True)
            import traceback
            traceback.print_exc()

        # Get the complete audio from buffer
        full_audio = audio_buffer.getvalue()
        print(f"TTS synthesis complete: {len(full_audio)} bytes total", flush=True)

        if len(full_audio) > 0 and not error_occurred:
            return Response(
                full_audio,
                mimetype='audio/mpeg',
                headers={
                    'Content-Type': 'audio/mpeg',
                    'Cache-Control': 'no-cache'
                }
            )
        else:
            print("TTS synthesis failed - no audio data collected or error occurred", flush=True)
            return jsonify({'error': 'TTS synthesis failed - no audio data'}), 500

    except Exception as e:
        print(f"Error in tts_synthesize: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
