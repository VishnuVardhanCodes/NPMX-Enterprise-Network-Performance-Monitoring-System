from models.alert_model import insert_alert
from models.threshold_model import get_threshold, create_default_threshold

def fetch_dynamic_limits(device_id):
    thresh = get_threshold(device_id)
    if not thresh:
        create_default_threshold(device_id)
        return {'latency_threshold': 100.0, 'packet_loss_threshold': 5.0, 'bandwidth_threshold': 80.0}
    return thresh

def check_latency_alert(device_id, latency):
    if latency is None:
        return None
    limits = fetch_dynamic_limits(device_id)
    threshold = float(limits['latency_threshold'])
    if latency > threshold:
        msg = f"High latency detected: {latency}ms (Limit: {threshold}ms)"
        insert_alert(device_id, 'latency', latency, threshold, 'WARNING', msg)
        return msg
    return None

def check_packet_loss_alert(device_id, packet_loss):
    if packet_loss is None:
        return None
    limits = fetch_dynamic_limits(device_id)
    threshold = float(limits['packet_loss_threshold'])
    if packet_loss > threshold:
        msg = f"Severe packet loss measured: {packet_loss}% (Limit: {threshold}%)"
        insert_alert(device_id, 'packet_loss', packet_loss, threshold, 'CRITICAL', msg)
        return msg
    return None

def check_bandwidth_alert(device_id, bandwidth):
    if bandwidth is None:
        return None
    limits = fetch_dynamic_limits(device_id)
    threshold = float(limits['bandwidth_threshold'])
    if bandwidth > threshold:
        msg = f"Peak bandwidth utilized: {bandwidth} Mbps (Limit: {threshold} Mbps)"
        insert_alert(device_id, 'bandwidth', bandwidth, threshold, 'WARNING', msg)
        return msg
    return None
