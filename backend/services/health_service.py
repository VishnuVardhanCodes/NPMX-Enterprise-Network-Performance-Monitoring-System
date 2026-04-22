def calculate_device_health(packet_loss):
    """
    Computes a device health score based on packet loss.
    100% health = 0% loss.
    0% health = 100% loss.
    """
    try:
        loss = float(packet_loss)
        health = 100.0 - loss
        return max(0.0, min(100.0, health))
    except:
        return 0.0
