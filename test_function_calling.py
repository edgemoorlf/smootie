#!/usr/bin/env python3
"""
Test script to verify function calling implementation
"""
import json
import requests

BASE_URL = "http://localhost:5001"

def test_chat_with_actions():
    """Test chat endpoint with actions for function calling"""

    # Define test actions (same as in videosets.json)
    actions = [
        {
            "action": "twist",
            "video": "1.mp4",
            "keywords": ["扭", "twist"],
            "has_audio": False
        },
        {
            "action": "shake",
            "video": "2.mp4",
            "keywords": ["抖", "shake"],
            "has_audio": False
        },
        {
            "action": "bounce",
            "video": "3.mp4",
            "keywords": ["颠", "bounce"],
            "has_audio": False
        },
        {
            "action": "sing",
            "video": "dance.mp4",
            "keywords": ["唱歌", "跳舞", "sing", "dance"],
            "has_audio": True
        }
    ]

    # Test cases with expected behavior
    test_cases = [
        {
            "message": "你好",
            "description": "Regular conversation - should return text only",
            "expect_function_call": False
        },
        {
            "message": "扭一下",
            "description": "Direct action request - should trigger twist action + text",
            "expect_function_call": True,
            "expected_action": "twist"
        },
        {
            "message": "我想看你扭",
            "description": "Natural language action request - should trigger twist action",
            "expect_function_call": True,
            "expected_action": "twist"
        },
        {
            "message": "唱个歌",
            "description": "Sing request - should trigger sing action with pre-recorded audio",
            "expect_function_call": True,
            "expected_action": "sing",
            "expect_has_audio": True
        }
    ]

    print("=" * 80)
    print("Testing Function Calling Implementation")
    print("=" * 80)

    for i, test_case in enumerate(test_cases, 1):
        print(f"\n[Test {i}] {test_case['description']}")
        print(f"Message: {test_case['message']}")
        print("-" * 80)

        # Make request
        response = requests.post(
            f"{BASE_URL}/api/chat/stream",
            json={
                "message": test_case["message"],
                "session_id": f"test_session_{i}",
                "actions": actions
            },
            stream=True
        )

        if response.status_code != 200:
            print(f"❌ Request failed with status {response.status_code}")
            continue

        # Parse streaming response
        text_chunks = []
        function_calls = []

        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                if line_str.startswith('data: '):
                    try:
                        data = json.loads(line_str[6:])

                        if data['type'] == 'text':
                            text_chunks.append(data['content'])
                            print(f"  Text chunk: {data['content']}")

                        elif data['type'] == 'function_call':
                            function_calls.append(data['function'])
                            print(f"  Function call: {json.dumps(data['function'], ensure_ascii=False)}")

                        elif data['type'] == 'done':
                            print(f"  Stream complete")

                        elif data['type'] == 'error':
                            print(f"  ❌ Error: {data['content']}")

                    except json.JSONDecodeError as e:
                        print(f"  ⚠️  Failed to parse: {line_str}")

        # Verify expectations
        full_text = ''.join(text_chunks)
        print(f"\nFull response: {full_text}")

        if test_case['expect_function_call']:
            if function_calls:
                print(f"✅ Function call detected as expected")

                # Verify action type
                if 'expected_action' in test_case:
                    actual_action = function_calls[0]['arguments'].get('action')
                    if actual_action == test_case['expected_action']:
                        print(f"✅ Correct action: {actual_action}")
                    else:
                        print(f"❌ Wrong action: expected {test_case['expected_action']}, got {actual_action}")

                # Verify has_audio flag
                if 'expect_has_audio' in test_case:
                    has_audio = function_calls[0]['arguments'].get('has_audio', False)
                    if has_audio == test_case['expect_has_audio']:
                        print(f"✅ Correct has_audio flag: {has_audio}")
                    else:
                        print(f"❌ Wrong has_audio: expected {test_case['expect_has_audio']}, got {has_audio}")
            else:
                print(f"❌ Expected function call but got none")
        else:
            if function_calls:
                print(f"❌ Unexpected function call: {function_calls}")
            else:
                print(f"✅ No function call as expected")

        print()

if __name__ == "__main__":
    print("\nStarting test suite...")
    print("Make sure Flask server is running on http://localhost:5001\n")

    try:
        # Test if server is running
        response = requests.get(BASE_URL, timeout=2)
        if response.status_code == 200:
            print("✅ Server is running\n")
            test_chat_with_actions()
        else:
            print(f"❌ Server returned status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Please start Flask server first:")
        print("   python3 app.py")
    except Exception as e:
        print(f"❌ Error: {e}")
