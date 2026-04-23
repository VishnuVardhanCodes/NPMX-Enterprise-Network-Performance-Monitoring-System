import requests

BASE_URL = "http://127.0.0.1:5000/api"

def test_routes():
    # Test Home
    try:
        res = requests.get("http://127.0.0.1:5000/")
        print(f"Home: {res.status_code} - {res.json()}")
    except Exception as e:
        print(f"Home error: {e}")

    # Test Login (with fake data)
    try:
        res = requests.post(f"{BASE_URL}/login", json={"username": "admin", "password": "admin123"})
        print(f"Login: {res.status_code} - {res.json().get('message', 'No message')}")
        token = res.json().get('access_token')
        
        if token:
            headers = {"Authorization": f"Bearer {token}"}
            # Test Devices
            res = requests.get(f"{BASE_URL}/devices", headers=headers)
            print(f"Devices: {res.status_code} - Found {len(res.json()) if isinstance(res.json(), list) else 'error'}")
            
            # Test Alerts
            res = requests.get(f"{BASE_URL}/alerts", headers=headers)
            print(f"Alerts: {res.status_code} - Found {len(res.json()) if isinstance(res.json(), list) else 'error'}")
    except Exception as e:
        print(f"API error: {e}")

if __name__ == "__main__":
    test_routes()
