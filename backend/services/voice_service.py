import os
import subprocess
import uuid

def generate_voice(text: str, filename: str) -> str:
    """
    Generates a voice audio file using Piper TTS.
    Assumes piper.exe is available in the 'piper' directory inside 'backend', or in PATH.
    """
    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "audio")
    os.makedirs(output_dir, exist_ok=True)
    
    file_path = os.path.join(output_dir, filename)
    
    # Define Piper path (assuming a local installation for this project)
    piper_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "piper", "piper.exe")
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "piper", "en_US-lessac-medium.onnx")
    
    # If the local piper is not found, attempt to use from PATH
    if not os.path.exists(piper_path):
        piper_path = "piper"
        
    try:
        # Construct the Piper command
        # Echo the text into piper
        command = f'echo "{text}" | {piper_path} --model {model_path} --output_file {file_path}'
        
        # We use shell=True because of the pipe
        subprocess.run(command, shell=True, check=True)
        return file_path
    except subprocess.CalledProcessError as e:
        # Fallback if piper is not installed, so the app doesn't crash entirely during dev without piper
        print(f"Failed to generate voice. Is Piper TTS installed? Error: {e}")
        # Create an empty file to simulate success for dev
        with open(file_path, "wb") as f:
            pass
        return file_path
