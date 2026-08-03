import os
import json
from groq import Groq

# Initialize Groq client
# The GROQ_API_KEY environment variable must be set.
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_amivi_content(text_input: str) -> dict:
    """
    Transforms long text into visual chunks for AMIVI.
    Returns a JSON string containing an array of slides.
    Each slide has 'text' (short phrase), 'image_prompt' (for image gen), and 'voice_script' (for TTS).
    """
    system_prompt = (
        "You are an educational AI assistant for AMIVI. Break down the provided educational text into "
        "5 to 7 bite-sized visual chunks (slides). Respond ONLY in valid JSON format as a list of objects. "
        "Each object should have: 'slide_number', 'text' (a concise bullet point, max 10 words), "
        "'image_prompt' (a detailed prompt to generate an image for this slide), and "
        "'voice_script' (what the narrator should say for this slide, max 2 sentences)."
    )
    
    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text_input}
        ],
        model="llama3-8b-8192",
        response_format={"type": "json_object"},
        temperature=0.5,
    )
    
    return json.loads(response.choices[0].message.content)

def generate_amico_comic(homework_prompt: str) -> dict:
    """
    Transforms a homework topic into a comic script for AMICO.
    Returns a JSON string containing panels.
    Each panel has 'panel_number', 'image_prompt' (for scene generation), and 'dialogue' (character bubbles).
    """
    system_prompt = (
        "You are a creative storyteller for AMICO. Transform the user's homework topic into a "
        "fun, educational 4-panel comic strip script. Respond ONLY in valid JSON format containing a key 'panels' "
        "which is a list of 4 objects. Each object should have: 'panel_number', 'image_prompt' "
        "(detailed visual description of the comic panel), and 'dialogue' (what characters are saying)."
    )
    
    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": homework_prompt}
        ],
        model="llama3-8b-8192",
        response_format={"type": "json_object"},
        temperature=0.7,
    )
    
    return json.loads(response.choices[0].message.content)
