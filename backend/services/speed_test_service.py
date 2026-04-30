import speedtest

def run_speed_test():
    try:
        st = speedtest.Speedtest()
        st.get_best_server()

        download = st.download()
        upload = st.upload()
        ping = st.results.ping

        download_mbps = round(download / 1_000_000, 2)
        upload_mbps = round(upload / 1_000_000, 2)

        return {
            "ping": ping,
            "download": download_mbps,
            "upload": upload_mbps
        }

    except Exception as e:
        return {
            "ping": 0,
            "download": 0,
            "upload": 0,
            "error": str(e)
        }
