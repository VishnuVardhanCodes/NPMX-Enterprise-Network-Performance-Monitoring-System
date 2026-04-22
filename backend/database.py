import psycopg2
import os

def get_connection():
    connection = psycopg2.connect(
        os.environ.get("DATABASE_URL"),
        sslmode="require"
    )
    return connection