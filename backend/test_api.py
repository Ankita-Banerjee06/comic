import requests

def test_amivi():
    url = "http://localhost:8000/api/amivi/generate"
    data = {"text": "Photosynthesis is the process by which plants turn water, sunlight, and CO2 into oxygen."}
    
    try:
        response = requests.post(url, json=data)
        print("Status:", response.status_code)
        print("Response:", response.text)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_amivi()
