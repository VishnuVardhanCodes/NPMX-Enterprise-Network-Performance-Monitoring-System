import time
from flask import Blueprint, jsonify
from models.snmp_model import insert_snmp_metrics, get_snmp_metrics, get_latest_snmp_metric
from services.snmp_service import get_snmp_bandwidth
from services.alert_service import check_bandwidth_alert
from database import get_connection

snmp_routes = Blueprint('snmp_routes', __name__)

@snmp_routes.route('/snmp/<int:device_id>', methods=['POST'])
def trigger_snmp(device_id):
    try:
        connection = get_connection()
        device = None
        with connection.cursor() as cursor:
            cursor.execute("SELECT ip_address, port, snmp_community FROM devices WHERE id=%s", (device_id,))
            device = cursor.fetchone()
        connection.close()
        
        if not device:
            return jsonify({"error": "Device not found"}), 404
            
        ip_addr = device['ip_address']
        port = device['port'] or 161
        community = device['snmp_community'] or 'public'

        # Execute remote SNMP read
        snmp_data = get_snmp_bandwidth(ip_addr, community, port)
        if not snmp_data:
            return jsonify({"error": "Failed to retrieve SNMP data"}), 500
            
        in_octets = snmp_data['in_octets']
        out_octets = snmp_data['out_octets']
        current_total = in_octets + out_octets
        
        latest_metric = get_latest_snmp_metric(device_id)
        bandwidth = 0.0
        
        if latest_metric:
            prev_total = int(latest_metric['in_octets'] or 0) + int(latest_metric['out_octets'] or 0)
            
            prev_time = latest_metric['timestamp'].timestamp()
            curr_time = time.time()
            time_diff = curr_time - prev_time # Seconds elapsed between polling
            
            # Calculate Bandwidth: ((bytes_change) / time_delta) 
            if time_diff > 0 and current_total >= prev_total:
                byte_diff = current_total - prev_total
                # Calculate bandwidth in Mbps (Megabits per second)
                bandwidth = round(((byte_diff * 8) / time_diff) / 1000000, 2)
            else:
                bandwidth = 0.0
                
        insert_snmp_metrics(device_id, in_octets, out_octets, bandwidth)
        check_bandwidth_alert(device_id, bandwidth)
        
        return jsonify({
            "message": "SNMP fetch successful",
            "in_octets": in_octets,
            "out_octets": out_octets,
            "bandwidth_mbps": bandwidth
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@snmp_routes.route('/snmp/<int:device_id>', methods=['GET'])
def fetch_snmp_metrics(device_id):
    try:
        data = get_snmp_metrics(device_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
