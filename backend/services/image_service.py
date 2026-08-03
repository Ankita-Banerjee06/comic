# Image Service using Pollinations.ai (Free, no API key required)
import requests
import urllib.parse
import os

def generate_image(prompt: str, filename: str) -> str:
    """
    Generates an image using Pollinations.ai and saves it locally.
    Returns the file path to the saved image.
    """
    # URL encode the prompt
    encoded_prompt = urllib.parse.quote(prompt)
    
    # Generate the pollinations URL (adds seed to ensure variability if needed, though pollinations does it automatically)
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true"
    
    # Make the request
    response = requests.get(url)
    
    if response.status_code == 200:
        # Create an output directory if it doesn't exist
        output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "images")
        os.makedirs(output_dir, exist_ok=True)
        
        file_path = os.path.join(output_dir, filename)
        
        with open(file_path, 'wb') as f:
            f.write(response.content)
            
        return file_path
    else:
        raise Exception(f"Failed to generate image. Status code: {response.status_code}")
