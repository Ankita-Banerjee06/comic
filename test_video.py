import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from services.video_service import create_amivi_video

# Create a fake image to test
from PIL import Image
img_path = 'test_img.png'
img = Image.new('RGB', (1024, 1024), color = 'red')
img.save(img_path)

slides = [{'image_path': img_path, 'audio_path': None, 'text': 'Test slide'}]

try:
    print("Testing MoviePy...")
    create_amivi_video(slides, 'test_output.mp4')
    print("Success!")
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    if os.path.exists(img_path):
        os.remove(img_path)
