import psycopg2
import os


def get_connection():

    DATABASE_URL = os.getenv("DATABASE_URL")

    try:

        connection = psycopg2.connect(
            DATABASE_URL,
            sslmode="require"
        )

        return connection

    except Exception as e:

        print("Database connection error:", e)

        return None