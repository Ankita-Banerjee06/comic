import requests

url = "http://localhost:8000/api/amivi/generate_quiz"
data = {"text": "The solar system consists of our star, the Sun, and everything bound to it by gravity. This includes the eight planets, dozens of moons, and millions of asteroids, comets, and meteoroids."}

try:
    response = requests.post(url, json=data)
    print("Status:", response.status_code)
    print("Response:", response.text)
except Exception as e:
    print("Error:", e)
