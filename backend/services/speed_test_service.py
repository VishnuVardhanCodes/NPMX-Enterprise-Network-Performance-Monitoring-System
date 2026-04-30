import speedtest
import logging

def run_speed_test():
    """
    Run an internet speed test using speedtest-cli.
    Returns:
        dict: A dictionary containing ping (ms), download (Mbps), and upload (Mbps).
    """
    try:
        logging.info("Initializing speed test...")
        st = speedtest.Speedtest()
        
        logging.info("Finding best server...")
        st.get_best_server()
        
        logging.info("Measuring download speed...")
        download_speed = st.download()
        
        logging.info("Measuring upload speed...")
        upload_speed = st.upload()
        
        results = st.results.dict()
        
        # Convert to Mbps
        download_mbps = round(download_speed / 1_000_000, 2)
        upload_mbps = round(upload_speed / 1_000_000, 2)
        ping = results.get('ping')
        
        logging.info(f"Speed test completed: Ping: {ping}ms, Download: {download_mbps}Mbps, Upload: {upload_mbps}Mbps")
        
        return {
            "ping": ping,
            "download": download_mbps,
            "upload": upload_mbps
        }
    except Exception as e:
        logging.error(f"Error during speed test: {str(e)}")
        raise e
