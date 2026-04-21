import os
from flask import Blueprint, jsonify, send_file
from services.report_service import generate_daily_report
from models.report_model import get_all_reports, get_report_by_date

report_routes = Blueprint('report_routes', __name__)

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
        report = get_report_by_date(date_str)
        if report and report['pdf_path'] and os.path.exists(report['pdf_path']):
            # Serve the binary PDF natively back to the React window
            return send_file(report['pdf_path'], as_attachment=True, download_name=f"NPMX_Report_{date_str}.pdf")
        return jsonify({"error": "Report PDF file missing from disk"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
