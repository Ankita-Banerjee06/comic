import requests
import urllib.parse
import time

for i in range(5):
    encoded = urllib.parse.quote(f"test prompt {i}")
    url = f"https://image.pollinations.ai/prompt/{encoded}?width=1024&height=1024&nologo=true"
    print(f"Fetching {i}...")
    start = time.time()
    try:
        r = requests.get(url, timeout=15)
        print(f"Status: {r.status_code}, Content-Type: {r.headers.get('content-type')}, Time: {time.time() - start:.2f}s")
    except Exception as e:
        print(f"Failed: {e}, Time: {time.time() - start:.2f}s")
    time.sleep(1)
