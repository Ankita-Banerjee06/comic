import os
import urllib.request
import zipfile
import tarfile
import tempfile
import platform

def download_file(url, dest):
    print(f"Downloading {os.path.basename(dest)}...")
    urllib.request.urlretrieve(url, dest)
    print(f"Saved to {dest}")

def install_piper():
    # Setup directories
    base_dir = os.path.dirname(__file__)
    piper_dir = os.path.join(base_dir, 'piper')
    os.makedirs(piper_dir, exist_ok=True)
    
    system = platform.system()
    machine = platform.machine().lower()
    
    if system == 'Windows':
        archive_name = "piper_windows_amd64.zip"
    elif system == 'Linux':
        if 'aarch64' in machine or 'arm64' in machine:
            archive_name = "piper_linux_aarch64.tar.gz"
        else:
            archive_name = "piper_linux_x86_64.tar.gz"
    elif system == 'Darwin':
        if 'arm64' in machine or 'aarch64' in machine:
            archive_name = "piper_macos_aarch64.tar.gz"
        else:
            archive_name = "piper_macos_x64.tar.gz"
    else:
        raise Exception(f"Unsupported platform: {system} {machine}")
        
    piper_url = f"https://github.com/rhasspy/piper/releases/download/2023.11.14-2/{archive_name}"
    model_onnx_url = "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx"
    model_json_url = "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json"
    
    # 1. Download and extract Piper executable
    temp_archive = os.path.join(tempfile.gettempdir(), archive_name)
    download_file(piper_url, temp_archive)
    
    print("Extracting Piper...")
    if archive_name.endswith('.zip'):
        with zipfile.ZipFile(temp_archive, 'r') as zip_ref:
            zip_ref.extractall(base_dir) # This extracts to backend/piper
    elif archive_name.endswith('.tar.gz'):
        with tarfile.open(temp_archive, 'r:gz') as tar_ref:
            tar_ref.extractall(base_dir) # This extracts to backend/piper
    print("Extraction complete.")
    
    # 2. Download the voice models directly into the piper directory
    onnx_dest = os.path.join(piper_dir, "en_US-lessac-medium.onnx")
    json_dest = os.path.join(piper_dir, "en_US-lessac-medium.onnx.json")
    
    download_file(model_onnx_url, onnx_dest)
    download_file(model_json_url, json_dest)
    
    # Make piper executable on Linux/Mac
    if system in ['Linux', 'Darwin']:
        piper_exe = os.path.join(piper_dir, 'piper')
        if os.path.exists(piper_exe):
            os.chmod(piper_exe, 0o755)
            
    print("\n✅ Piper TTS installed successfully!")
    print(f"Location: {piper_dir}")

if __name__ == "__main__":
    install_piper()
