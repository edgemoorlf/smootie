/**
 * DashScope Client for streaming LLM chat and TTS
 * Handles communication with Flask backend proxy
 */
class DashScopeClient {
    constructor() {
        this.baseUrl = window.location.origin;
        this.sessionId = this.generateSessionId();
        this.isStreaming = false;
        this.currentEventSource = null;
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Stream chat response from LLM
     * @param {string} message - User message
     * @param {function} onChunk - Callback for each text chunk
     * @param {function} onComplete - Callback when streaming completes
     * @param {function} onError - Callback for errors
     */
    async streamChat(message, onChunk, onComplete, onError) {
        if (this.isStreaming) {
            console.warn('Already streaming, ignoring new request');
            return;
        }

        this.isStreaming = true;
        let fullResponse = '';

        try {
            // Use EventSource for Server-Sent Events
            const url = `${this.baseUrl}/api/chat/stream`;

            // EventSource doesn't support POST, so we'll use fetch with streaming
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    session_id: this.sessionId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                // Decode the chunk
                const chunk = decoder.decode(value, { stream: true });

                // Parse SSE format (data: {...}\n\n)
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.substring(6));

                            if (data.type === 'text') {
                                fullResponse += data.content;
                                if (onChunk) {
                                    onChunk(data.content, fullResponse);
                                }
                            } else if (data.type === 'done') {
                                console.log('Stream completed, full response:', fullResponse);
                                if (onComplete) {
                                    onComplete(fullResponse);
                                }
                            } else if (data.type === 'error') {
                                console.error('Stream error:', data.content);
                                if (onError) {
                                    onError(new Error(data.content));
                                }
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e, line);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Error in streamChat:', error);
            if (onError) {
                onError(error);
            }
        } finally {
            this.isStreaming = false;
        }
    }

    /**
     * Stop current streaming
     */
    stopStreaming() {
        if (this.currentEventSource) {
            this.currentEventSource.close();
            this.currentEventSource = null;
        }
        this.isStreaming = false;
    }

    /**
     * Synthesize speech from text
     * @param {string} text - Text to synthesize
     * @returns {Promise<Blob>} Audio blob
     */
    async synthesizeSpeech(text) {
        try {
            const response = await fetch(`${this.baseUrl}/api/tts/synthesize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                throw new Error(`TTS error! status: ${response.status}`);
            }

            const audioBlob = await response.blob();
            return audioBlob;

        } catch (error) {
            console.error('Error in synthesizeSpeech:', error);
            throw error;
        }
    }

    /**
     * Clear conversation history
     */
    async clearHistory() {
        try {
            await fetch(`${this.baseUrl}/api/chat/clear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: this.sessionId
                })
            });
            console.log('Conversation history cleared');
        } catch (error) {
            console.error('Error clearing history:', error);
        }
    }

    /**
     * Reset session (generates new session ID)
     */
    resetSession() {
        this.sessionId = this.generateSessionId();
        console.log('Session reset, new ID:', this.sessionId);
    }
}
