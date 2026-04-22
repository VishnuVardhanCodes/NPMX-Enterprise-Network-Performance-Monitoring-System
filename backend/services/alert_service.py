from models.alert_model import insert_alert
from models.threshold_model import get_threshold, create_default_threshold
from datetime import datetime, timedelta

# Prevent repeated alert spam
LAST_ALERT_CACHE = {}

ALERT_COOLDOWN_SECONDS = 60


def fetch_dynamic_limits(device_id):
    """
    Fetch thresholds.
    If not found → create default thresholds.
    """

    thresh = get_threshold(device_id)

    if not thresh:
        create_default_threshold(device_id)

        return {
            'latency_threshold': 100.0,
            'packet_loss_threshold': 5.0,
            'bandwidth_threshold': 80.0
        }

    return thresh


def is_on_cooldown(device_id, metric_type):
    """
    Prevent duplicate alerts within cooldown period.
    """

    key = f"{device_id}_{metric_type}"

    if key in LAST_ALERT_CACHE:
        last_time = LAST_ALERT_CACHE[key]

        if datetime.now() - last_time < timedelta(seconds=ALERT_COOLDOWN_SECONDS):
            return True

    LAST_ALERT_CACHE[key] = datetime.now()

    return False


def check_latency_alert(device_id, latency):

    if latency is None:
        return None

    limits = fetch_dynamic_limits(device_id)

    threshold = float(limits['latency_threshold'])

    # Ignore unrealistic values
    if latency <= 0:
        return None

    if latency > threshold:

        if is_on_cooldown(device_id, "latency"):
            return None

        msg = (
            f"High latency detected: "
            f"{latency} ms (Limit: {threshold} ms)"
        )

        insert_alert(
            device_id,
            'latency',
            latency,
            threshold,
            'WARNING',
            msg
        )

        return msg

    return None


def check_packet_loss_alert(device_id, packet_loss):

    if packet_loss is None:
        return None

    limits = fetch_dynamic_limits(device_id)

    threshold = float(limits['packet_loss_threshold'])

    # Ignore simulation spikes
    if packet_loss < 0:
        return None

    # Ignore unreachable-device noise
    if packet_loss == 100:
        return None

    if packet_loss > threshold:

        if is_on_cooldown(device_id, "packet_loss"):
            return None

        msg = (
            f"Severe packet loss measured: "
            f"{packet_loss}% (Limit: {threshold}%)"
        )

        insert_alert(
            device_id,
            'packet_loss',
            packet_loss,
            threshold,
            'CRITICAL',
            msg
        )

        return msg

    return None


def check_bandwidth_alert(device_id, bandwidth):

    if bandwidth is None:
        return None

    limits = fetch_dynamic_limits(device_id)

    threshold = float(limits['bandwidth_threshold'])

    # Ignore invalid values
    if bandwidth <= 0:
        return None

    if bandwidth > threshold:

        if is_on_cooldown(device_id, "bandwidth"):
            return None

        msg = (
            f"Peak bandwidth utilized: "
            f"{bandwidth} Mbps (Limit: {threshold} Mbps)"
        )

        insert_alert(
            device_id,
            'bandwidth',
            bandwidth,
            threshold,
            'WARNING',
            msg
        )

        return msg

    return None