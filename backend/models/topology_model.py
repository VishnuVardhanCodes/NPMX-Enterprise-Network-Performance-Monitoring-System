from database import get_connection

def get_all_nodes():
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT t.id, t.device_id, t.position_x, t.position_y, d.device_name, d.status 
                FROM topology_nodes t
                LEFT JOIN devices d ON t.device_id = d.id
            """
            cursor.execute(sql)
            return cursor.fetchall()
    except Exception as e:
        print(f"Topology Error: {e}")
        return []
    finally:
        connection.close()

def get_all_links():
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = "SELECT id, source_node, target_node FROM topology_links"
            cursor.execute(sql)
            return cursor.fetchall()
    except: return []
    finally: connection.close()

def add_node(device_id, pos_x, pos_y):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = "INSERT INTO topology_nodes (device_id, position_x, position_y) VALUES (%s, %s, %s)"
            cursor.execute(sql, (device_id, pos_x, pos_y))
        connection.commit()
        return True
    except: return False
    finally: connection.close()

def add_link(source_id, target_id):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = "INSERT INTO topology_links (source_node, target_node) VALUES (%s, %s)"
            cursor.execute(sql, (source_id, target_id))
        connection.commit()
        return True
    except: return False
    finally: connection.close()

def save_node_position(device_id, pos_x, pos_y):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            # Upsert mechanic 
            sql = """
                INSERT INTO topology_nodes (device_id, position_x, position_y) 
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE position_x=VALUES(position_x), position_y=VALUES(position_y)
            """
            cursor.execute(sql, (device_id, pos_x, pos_y))
        connection.commit()
        return True
    except: return False
    finally: connection.close()
