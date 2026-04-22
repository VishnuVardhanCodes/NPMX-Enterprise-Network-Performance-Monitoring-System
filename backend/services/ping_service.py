import ping3

def ping_device(ip_address):
    """
    Executes a ping test and returns a structured dictionary.
    Guarantees no crashes and predictable JSON output.
    """
    try:
        # ping3.ping returns latency in seconds. Timeout is in seconds.
        latency_sec = ping3.ping(ip_address, timeout=2)
        
        if latency_sec is not None and latency_sec is not False:
            return {
                "latency": round(latency_sec * 1000, 2),  # Convert to ms
                "packet_loss": 0.0
            }
        else:
            return {
                "latency": 0.0,
                "packet_loss": 100.0
            }
    except Exception as e:
        print(f"Ping Fatal Exception: {str(e)}")
        return {
            "latency": 0.0,
            "packet_loss": 100.0
        }
