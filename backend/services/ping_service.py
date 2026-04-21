import ping3

def ping_device(ip_address):
    try:
        # ping3.ping returns latency in seconds. Timeout is in seconds.
        latency_sec = ping3.ping(ip_address, timeout=2)
        if latency_sec is not None and latency_sec is not False:
            return round(latency_sec * 1000, 2)  # Convert to ms
        return None
    except Exception as e:
        print(f"Ping Error: {str(e)}")
        return None
