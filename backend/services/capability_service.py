from services.snmp_service import get_snmp_bandwidth

def detect_device_capabilities(ip, community, port):
    """
    Probes a device to determine its performance monitoring capabilities.
    """
    snmp_data = get_snmp_bandwidth(ip, community, port)
    
    return {
        "snmp_capable": not snmp_data.get('is_simulated', False) if snmp_data else False,
        "ping_capable": True, # Assumed if we can reach it
        "mode": "SIMULATED" if snmp_data and snmp_data.get('is_simulated') else "NATIVE"
    }
