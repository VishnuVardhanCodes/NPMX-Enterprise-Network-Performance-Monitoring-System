import os
from flask import Blueprint, jsonify, send_file
from services.report_service import generate_daily_report
from models.report_model import get_all_reports, get_report_by_date
from services.csv_service import generate_csv_report

report_routes = Blueprint('report_routes', __name__)

@report_routes.route('/reports/export/csv', methods=['GET'])
def export_csv():
    try:
        path = generate_csv_report()
        if path and os.path.exists(path):
            return send_file(path, as_attachment=True, download_name=os.path.basename(path))
        return jsonify({"error": "Failed to generate CSV"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@report_routes.route('/reports/generate', methods=['POST'])
def create_report():
    try:
        result = generate_daily_report()
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@report_routes.route('/reports', methods=['GET'])
def fetch_reports():
    try:
        data = get_all_reports()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@report_routes.route('/reports/download/<date_str>', methods=['GET'])
def download_specific_report(date_str):
    try:
        from datetime import datetime
        formatted_date = date_str
        
        # Phase 1: Handle RFC 2822 / GMT strings (e.g. Wed, 22 Apr 2026 00:00:00 GMT)
        if "," in date_str and "GMT" in date_str:
            try:
                # Flask/Werkzeug often sends timestamp strings in this format via certain browsers or JS methods
                # format: Wed, 22 Apr 2026 10:30:15 GMT
                # We strip potential trailing info if needed, but strptime is specific
                parsed_dt = datetime.strptime(date_str, "%a, %d %b %Y %H:%M:%S GMT")
                formatted_date = parsed_dt.strftime("%Y-%m-%d")
            except Exception as parse_err:
                print(f"Date Parse Warning: {parse_err}")

        report = get_report_by_date(formatted_date)
        if report and report['pdf_path'] and os.path.exists(report['pdf_path']):
            return send_file(report['pdf_path'], as_attachment=True, download_name=f"NPMX_Report_{formatted_date}.pdf")
        
        # Fallback: check if the date_str is actually a filename or raw date match
        reports_dir = os.path.join(os.getcwd(), 'reports')
        filename = date_str if date_str.endswith('.pdf') else f"daily_report_{formatted_date}.pdf"
        file_path = os.path.join(reports_dir, filename)
        
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
            
        return jsonify({"error": f"Report PDF file for {formatted_date} missing from disk"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
