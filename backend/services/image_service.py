# Image Service using Pollinations.ai (Free, no API key required)
import requests
import urllib.parse
import os
import time
import random

def generate_image(prompt: str, filename: str) -> str:
    """
    Generates an image using Pollinations.ai and saves it locally.
    Returns the file path to the saved image.
    """
    # Truncate prompt to avoid extremely long URLs
    short_prompt = prompt[:200] if prompt else "educational illustration"
    encoded_prompt = urllib.parse.quote(short_prompt)
    
    # Add a random seed to bust cache and potentially bypass some strict rate limits
    seed = random.randint(1, 100000)
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true&seed={seed}"
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            # Pollinations can be aggressive with rate limits (429) if hit instantly
            if attempt > 0:
                print(f"Retry attempt {attempt} for image: {filename}")
                time.sleep(4) # Wait before retrying
                
            response = requests.get(url, timeout=15)
            
            if response.status_code == 200 and 'image' in response.headers.get('content-type', ''):
                output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "images")
                os.makedirs(output_dir, exist_ok=True)
                
                file_path = os.path.join(output_dir, filename)
                
                with open(file_path, 'wb') as f:
                    f.write(response.content)
                    
                return file_path
            elif response.status_code == 429:
                print("Pollinations API rate limited. Retrying...")
                continue
            else:
                print(f"Pollinations returned invalid data. Status: {response.status_code}")
                
        except Exception as e:
            print(f"Warning: Image generation failed or timed out: {e}")
            
    # If all retries fail, generate a fallback image using Pillow
    print("All image generation retries failed. Using fallback blank image.")
    try:
        from PIL import Image
        output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "images")
        os.makedirs(output_dir, exist_ok=True)
        file_path = os.path.join(output_dir, filename)
        
        # Create a visually obvious fallback (e.g., dark gray block with text if possible, but solid color is safest)
        img = Image.new('RGB', (1024, 1024), color=(40, 40, 40))
        img.save(file_path)
        return file_path
    except:
        raise Exception("Failed to generate image and fallback failed.")
