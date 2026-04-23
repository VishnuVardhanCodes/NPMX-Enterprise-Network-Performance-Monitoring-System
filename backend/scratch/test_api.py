import requests

BASE_URL = "http://127.0.0.1:5000/api"

def test_routes():
    # Test Home
    try:
        res = requests.get("http://127.0.0.1:5000/")
        print(f"Home: {res.status_code} - {res.json()}")
    except Exception as e:
        print(f"Home error: {e}")

    # Test Dashboard Stats
    try:
        res = requests.get(f"{BASE_URL}/dashboard/stats")
        print(f"Stats: {res.status_code}")
        data = res.json()
        print(f"Traffic Data: {data.get('traffic_data')}")
        print(f"Avg Latency: {data.get('avg_latency')}")
    except Exception as e:
        print(f"Stats error: {e}")

        
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
