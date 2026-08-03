import os
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips, TextClip, CompositeVideoClip

def create_amivi_video(slides: list, output_filename: str) -> str:
    """
    Creates a slide-based video from a list of slides.
    Each slide in 'slides' should be a dict: {'image_path': str, 'audio_path': str, 'text': str}
    """
    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "videos")
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, output_filename)
    
    clips = []
    
    for slide in slides:
        image_path = slide.get('image_path')
        audio_path = slide.get('audio_path')
        text = slide.get('text', '')
        
        # Determine duration based on audio if available, else default to 3 seconds
        duration = 3
        audio_clip = None
        if audio_path and os.path.exists(audio_path) and os.path.getsize(audio_path) > 0:
            try:
                audio_clip = AudioFileClip(audio_path)
                duration = audio_clip.duration
            except Exception as e:
                print(f"Warning: Could not load audio {audio_path}: {e}")
        
        if image_path and os.path.exists(image_path):
            img_clip = ImageClip(image_path).set_duration(duration)
            
            # Optional: Add text overlay
            # Note: TextClip requires ImageMagick installed on the system
            try:
                txt_clip = TextClip(text, fontsize=70, color='white', bg_color='black', size=(img_clip.w, None), method='caption')
                txt_clip = txt_clip.set_pos('bottom').set_duration(duration)
                video_clip = CompositeVideoClip([img_clip, txt_clip])
            except Exception as e:
                print(f"Warning: Could not create TextClip (ImageMagick might be missing): {e}")
                video_clip = img_clip
                
            if audio_clip:
                video_clip = video_clip.set_audio(audio_clip)
                
            clips.append(video_clip)
            
    if not clips:
        raise Exception("No valid clips generated for the video.")
        
    final_video = concatenate_videoclips(clips, method="compose")
    
    # Write the result to a file
    final_video.write_videofile(output_path, fps=24, codec="libx264", audio_codec="aac")
    
    return output_path
