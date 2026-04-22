import threading
import socket
from ping3 import ping
from models.device_model import add_device

def scan_ip(ip, results):
    """Checks if a single IP is active and adds it to results."""
    try:
        # Ping with a short timeout for scanning
        resp = ping(ip, timeout=0.2)
        if resp is not None:
            # Try to get hostname
            try:
                hostname = socket.gethostbyaddr(ip)[0]
            except:
                hostname = f"Discovered_{ip.replace('.', '_')}"
            
            results.append({
                "device_name": hostname,
                "ip_address": ip,
                "status": "online"
            })
    except:
        pass

def run_network_scan(subnet="192.168.1"):
    """Scans a /24 subnet and auto-adds discovered devices."""
    active_devices = []
    threads = []
    
    # Scan .1 to .254
    for i in range(1, 255):
        ip = f"{subnet}.{i}"
        t = threading.Thread(target=scan_ip, args=(ip, active_devices))
        threads.append(t)
        t.start()
    
    for t in threads:
        t.join()
    
    # Auto-add to database
    for dev in active_devices:
        try:
            add_device(dev['device_name'], dev['ip_address'], 161, 'public', status='online')
        except:
            pass # Skip duplicates
            
    return active_devices
