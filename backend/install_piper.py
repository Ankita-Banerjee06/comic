import os
import urllib.request
import zipfile
import tempfile

def download_file(url, dest):
    print(f"Downloading {os.path.basename(dest)}...")
    urllib.request.urlretrieve(url, dest)
    print(f"Saved to {dest}")

def install_piper():
    # Setup directories
    base_dir = os.path.dirname(__file__)
    piper_dir = os.path.join(base_dir, 'piper')
    os.makedirs(piper_dir, exist_ok=True)
    
    # URLs for Piper 2023.11.14 release and the Lessac medium voice model
    piper_zip_url = "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_windows_amd64.zip"
    model_onnx_url = "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx"
    model_json_url = "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json"
    
    # 1. Download and extract Piper executable
    temp_zip = os.path.join(tempfile.gettempdir(), 'piper.zip')
    download_file(piper_zip_url, temp_zip)
    
    print("Extracting Piper...")
    with zipfile.ZipFile(temp_zip, 'r') as zip_ref:
        # The zip contains a folder 'piper', extract its contents directly if possible
        zip_ref.extractall(base_dir) # This extracts to backend/piper
    print("Extraction complete.")
    
    # 2. Download the voice models directly into the piper directory
    onnx_dest = os.path.join(piper_dir, "en_US-lessac-medium.onnx")
    json_dest = os.path.join(piper_dir, "en_US-lessac-medium.onnx.json")
    
    download_file(model_onnx_url, onnx_dest)
    download_file(model_json_url, json_dest)
    
    print("\n✅ Piper TTS installed successfully!")
    print(f"Location: {piper_dir}")

if __name__ == "__main__":
    install_piper()
