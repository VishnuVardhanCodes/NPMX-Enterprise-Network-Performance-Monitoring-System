import os
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from database import get_connection
from models.report_model import insert_report

def calculate_report_stats():
    connection = get_connection()
    stats = {
        "total_devices": 0, "active_devices": 0, "critical_alerts": 0,
        "avg_latency": 0.0, "max_bandwidth": 0.0, "packet_loss_events": 0
    }
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) as v FROM devices")
            res = cursor.fetchone()
            if res: stats["total_devices"] = res["v"]
            
            cursor.execute("SELECT COUNT(*) as v FROM devices WHERE status IN ('active', 'online')")
            res = cursor.fetchone()
            if res: stats["active_devices"] = res["v"]
            
            cursor.execute("SELECT COUNT(*) as v FROM alerts WHERE severity='CRITICAL'")
            res = cursor.fetchone()
            if res: stats["critical_alerts"] = res["v"]
            
            cursor.execute("SELECT AVG(latency) as v FROM metrics WHERE latency > 0")
            res = cursor.fetchone()
            if res and res["v"]: stats["avg_latency"] = round(res["v"], 2)
            
            cursor.execute("SELECT MAX(bandwidth) as v FROM snmp_metrics")
            res = cursor.fetchone()
            if res and res["v"]: stats["max_bandwidth"] = round(res["v"], 2)
            
            cursor.execute("SELECT COUNT(*) as v FROM metrics WHERE packet_loss > 0")
            res = cursor.fetchone()
            if res: stats["packet_loss_events"] = res["v"]
            
        return stats
    except Exception as e:
        print(f"Error compiling stats: {e}")
        return stats
    finally:
        connection.close()

def generate_daily_report():
    date_str = datetime.now().strftime("%Y-%m-%d")
    reports_dir = os.path.join(os.getcwd(), 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    
    pdf_path = os.path.join(reports_dir, f"daily_report_{date_str}.pdf")
    stats = calculate_report_stats()
    
    # PDF Configuration
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    story = []
    styles = getSampleStyleSheet()

    # CUSTOM STYLES
    title_style = ParagraphStyle(
        'MainTitle', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor("#1e3a8a"),
        alignment=1, spaceAfter=10, fontName="Helvetica-Bold"
    )
    subtitle_style = ParagraphStyle(
        'SubTitle', parent=styles['Heading2'], fontSize=16, textColor=colors.HexColor("#4b5563"),
        alignment=1, spaceAfter=20, fontName="Helvetica"
    )
    divider_label_style = ParagraphStyle(
        'DividerLabel', parent=styles['Heading3'], fontSize=12, textColor=colors.HexColor("#1e40af"),
        spaceBefore=15, spaceAfter=10, fontName="Helvetica-Bold", textTransform='uppercase'
    )
    kpi_val_style = ParagraphStyle('KPIVal', fontSize=18, fontName="Helvetica-Bold", alignment=1, textColor=colors.whitesmoke)
    kpi_lab_style = ParagraphStyle('KPILab', fontSize=8, fontName="Helvetica", alignment=1, textColor=colors.whitesmoke)

    # 1. HEADER
    story.append(Paragraph("NPMX Enterprise Monitoring System", title_style))
    story.append(Paragraph("Daily Network Performance Report", subtitle_style))
    story.append(Paragraph(f"Analysis Date: {datetime.now().strftime('%d-%b-%Y')}", styles['Normal']))
    story.append(Spacer(1, 0.2*inch))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e5e7eb"), spaceAfter=20))

    # 2. STATUS LABEL
    status_color = colors.HexColor("#10b981") if stats['critical_alerts'] < 50 else colors.HexColor("#ef4444")
    status_text = "System Operating Normally" if stats['critical_alerts'] < 50 else "⚠ High Alert Activity Detected"
    status_style = ParagraphStyle('Status', fontSize=10, fontName="Helvetica-Bold", alignment=1, textColor=colors.white, backColor=status_color, borderPadding=5, borderRadius=5)
    story.append(Paragraph(status_text, status_style))
    story.append(Spacer(1, 0.3*inch))

    # 3. KPI GRID (using Table as Grid)
    def make_kpi_card(val, label, bg):
        data = [[Paragraph(str(val), kpi_val_style)], [Paragraph(label, kpi_lab_style)]]
        return Table(data, colWidths=[1.1*inch], style=[('BACKGROUND', (0,0), (-1,-1), bg), ('ROUNDEDCORNERS', [8,8,8,8]), ('VALIGN', (0,0), (-1,-1), 'MIDDLE')])

    kpi_cards = [
        [make_kpi_card(stats['total_devices'], "TOTAL DEVICES", colors.HexColor("#3b82f6")),
         make_kpi_card(stats['active_devices'], "ACTIVE NODES", colors.HexColor("#10b981")),
         make_kpi_card(stats['critical_alerts'], "CRITICAL ALERTS", colors.HexColor("#ef4444"))],
        [make_kpi_card(f"{stats['avg_latency']}ms", "AVG LATENCY", colors.HexColor("#f59e0b")),
         make_kpi_card(f"{stats['max_bandwidth']}M", "MAX BANDWIDTH", colors.HexColor("#8b5cf6")),
         make_kpi_card(stats['packet_loss_events'], "LOSS EVENTS", colors.HexColor("#6b7280"))]
    ]
    kpi_grid = Table(kpi_cards, colWidths=[1.5*inch]*3, rowHeights=[0.8*inch]*2)
    kpi_grid.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER'), ('VALIGN', (0,0), (-1,-1), 'MIDDLE'), ('TOPPADDING', (0,0), (-1,-1), 10), ('BOTTOMPADDING', (0,0), (-1,-1), 10)]))
    story.append(kpi_grid)
    story.append(Spacer(1, 0.4*inch))

    # 4. DATA SECTIONS
    story.append(Paragraph("System Overview", divider_label_style))
    data_summary = [
        ["Metric Category", "Measured Value"],
        ["Internal Infrastructure Managed", f"{stats['total_devices']} Hardware Nodes"],
        ["Real-time Reachability Status", f"{stats['active_devices']} Nodes Online"],
        ["System Health Score", f"{round((stats['active_devices']/stats['total_devices']*100) if stats['total_devices']>0 else 0, 1)}% Optimal"]
    ]
    summary_table = Table(data_summary, colWidths=[3*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f3f4f6")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor("#1e3a8a")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e5e7eb")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f9fafb")]),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('ALIGN', (0,0), (0,-1), 'LEFT'),
        ('ALIGN', (1,0), (1,-1), 'CENTER'),
    ]))
    story.append(summary_table)

    # 5. FOOTER FRAME Logic (Using doc.build canvas template)
    def add_page_decor(canvas, doc):
        canvas.saveState()
        # Rounded Border
        canvas.setStrokeColor(colors.HexColor("#1e3a8a"))
        canvas.roundRect(0.5*inch, 0.5*inch, 7.5*inch, 10*inch, 20)
        
        # Footer
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.gray)
        footer_text = f"NPMX Enterprise Telemetry Engine | Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Page {doc.page}"
        canvas.drawCentredString(letter[0]/2, 0.7*inch, footer_text)
        canvas.restoreState()

    # BUILD PDF
    doc.build(story, onFirstPage=add_page_decor, onLaterPages=add_page_decor)
    
    # PERSIST TO DB
    insert_report(date_str, stats["total_devices"], stats["active_devices"], stats["critical_alerts"], 
                  stats["avg_latency"], stats["max_bandwidth"], stats["packet_loss_events"], pdf_path)
    
    return {
        "date": date_str,
        "stats": stats,
        "pdf_path": pdf_path,
        "download_url": f"/api/reports/download/{date_str}" # Use standard date string
    }
