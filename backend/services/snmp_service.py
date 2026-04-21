"""
SNMP GET Service — Pure Python socket implementation.

Avoids pysnmp entirely due to Python 3.12 incompatibility (asyncore removed).
Implements SNMPv1 GET for ifInOctets and ifOutOctets OIDs.
"""
import socket
import struct

# Pre-encoded SNMPv1 GET PDU for OIDs:
#   1.3.6.1.2.1.2.2.1.10.1 (ifInOctets interface 1)
#   1.3.6.1.2.1.2.2.1.16.1 (ifOutOctets interface 1)
# These are the raw bytes of a standard SNMPv1 GET request packet.

def _encode_oid(oid_str):
    parts = [int(p) for p in oid_str.strip('.').split('.')]
    # First two arcs encoded as 40*x + y
    encoded = [40 * parts[0] + parts[1]]
    for part in parts[2:]:
        if part == 0:
            encoded.append(0)
        else:
            base128 = []
            while part > 0:
                base128.insert(0, part & 0x7f)
                part >>= 7
            for i, b in enumerate(base128):
                encoded.append(b | (0x80 if i < len(base128) - 1 else 0))
    return bytes(encoded)

def _tlv(tag, value):
    if isinstance(value, str):
        value = value.encode()
    length = len(value)
    if length < 0x80:
        return bytes([tag, length]) + value
    elif length < 0x100:
        return bytes([tag, 0x81, length]) + value
    else:
        return bytes([tag, 0x82, (length >> 8) & 0xff, length & 0xff]) + value

def _build_snmp_get(community, oids):
    """Build a minimal SNMPv1 GET packet for the given OIDs."""
    # Encode each OID as a VarBind (NULL value)
    varbinds = b''
    for oid in oids:
        enc_oid = _encode_oid(oid)
        oid_tlv = _tlv(0x06, enc_oid)      # OID
        null_tlv = bytes([0x05, 0x00])      # NULL
        varbinds += _tlv(0x30, oid_tlv + null_tlv)  # SEQUENCE

    varbind_list = _tlv(0x30, varbinds)    # VarBindList
    pdu = (
        _tlv(0x02, b'\x01')                # request-id = 1
        + bytes([0x02, 0x01, 0x00])        # error-status = 0
        + bytes([0x02, 0x01, 0x00])        # error-index = 0
        + varbind_list
    )
    get_pdu = _tlv(0xa0, pdu)              # GetRequest-PDU tag

    message = (
        _tlv(0x02, b'\x00')               # version = 0 (v1)
        + _tlv(0x04, community)            # community string
        + get_pdu
    )
    return _tlv(0x30, message)             # SEQUENCE wrapper

def _decode_int_from_response(data):
    """Crude decoder: extract all INTEGER values from SNMP response."""
    values = []
    i = 0
    while i < len(data):
        tag = data[i]
        if tag in (0x02, 0x41, 0x42, 0x43):  # INTEGER / Counter32 / Gauge32 / TimeTicks
            i += 1
            length = data[i]
            if length & 0x80:
                n = length & 0x7f
                length = int.from_bytes(data[i+1:i+1+n], 'big')
                i += n
            i += 1
            val_bytes = data[i:i+length]
            val = int.from_bytes(val_bytes, 'big')
            values.append(val)
            i += length
        else:
            i += 1
    return values

def get_snmp_bandwidth(ip_address, community='public', port=161):
    """
    Polls SNMP ifInOctets (OID .10.1) and ifOutOctets (OID .16.1)
    using a hand-crafted SNMPv1 UDP packet — no third-party library needed.
    """
    in_oid  = '1.3.6.1.2.1.2.2.1.10.1'
    out_oid = '1.3.6.1.2.1.2.2.1.16.1'
    
    try:
        packet = _build_snmp_get(community, [in_oid, out_oid])
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.settimeout(3)
        sock.sendto(packet, (ip_address, int(port)))
        response, _ = sock.recvfrom(4096)
        sock.close()

        values = _decode_int_from_response(response)
        in_octets  = values[0] if len(values) > 0 else 0
        out_octets = values[1] if len(values) > 1 else 0

        return {"in_octets": in_octets, "out_octets": out_octets}

    except socket.timeout:
        print(f"SNMP timeout: {ip_address} did not respond")
        return None
    except Exception as e:
        print(f"SNMP socket error: {e}")
        return None
