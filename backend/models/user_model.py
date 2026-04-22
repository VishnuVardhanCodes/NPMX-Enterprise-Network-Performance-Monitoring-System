from database import get_connection


def create_user(username, password_hash, role='user'):

    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            sql = """
            INSERT INTO users (username, password_hash, role)
            VALUES (%s, %s, %s)
            """

            cursor.execute(
                sql,
                (username, password_hash, role)
            )

        connection.commit()

        return True

    except Exception as e:

        print("Create user error:", e)

        return False

    finally:

        connection.close()



def get_user_by_username(username):

    connection = get_connection()

    try:

        # VERY IMPORTANT — dictionary cursor
        with connection.cursor() as cursor:

            sql = """
            SELECT id, username, password_hash, role
            FROM users
            WHERE username = %s
            """

            cursor.execute(sql, (username,))

            row = cursor.fetchone()

            if not row:
                return None

            # Convert tuple → dictionary
            return {
                "id": row[0],
                "username": row[1],
                "password_hash": row[2],
                "role": row[3]
            }

    except Exception as e:

        print("Fetch user error:", e)

        return None

    finally:

        connection.close()