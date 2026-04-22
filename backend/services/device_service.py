from ping3 import ping
from models.device_model import add_device

def validate_and_add_device(name, ip, port, community):
    """
    Validates a device by pinging it and then adds it to the database with appropriate status.
    """
    latency = ping(ip, unit='ms', timeout=1)
    status = 'online' if latency is not None else 'offline'
    
    success = add_device(name, ip, port, community, status)
    
    return {
        "success": success,
        "status": status,
        "latency": latency if latency is not None else 0,
        "message": f"Device validated as {status.upper()} and added."
    }
