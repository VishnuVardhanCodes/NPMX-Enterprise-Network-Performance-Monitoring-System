# NPMX Enterprise Network Performance Monitoring System

NPMX is an enterprise-grade, high-performance network monitoring platform designed for real-time telemetry analysis, topological mapping, and automated performance auditing.

## 🚀 Key Features

- **Universal Device Support**: Fully operational for any IP-based node via hybrid ICMP/SNMP telemetry.
- **Smart Discovery**: Automated subnet scanning (Multi-threaded) to identify and register active inventory.
- **Topological Mapping**: Interactive ReactFlow-based network diagram with persistent layout memory.
- **Enterprise Reporting**: Professional PDF audits featuring KPI dashboards and automated CSV data exports.
- **Self-Healing Loop**: Fault-tolerant monitoring engine with deterministic simulation fallback for non-SNMP nodes.
- **Security**: JWT-based authentication with role-based access control (RBAC).

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Recharts, ReactFlow.
- **Backend**: Python 3.12, Flask, MySQL, ReportLab (PDF Engine).
- **Core Monitoring**: Raw Python Socket SNMPv1/v2 implementation, Ping3.

## 📦 Installation & Setup

1. **Prerequisites**:
   - Python 3.12+
   - Node.js 18+
   - MySQL Server

2. **Database Initialization**:
   - Execute the SQL schema provided in `backend/database/schema.sql` (if applicable) or ensure the MySQL service is running with the credentials defined in `database.py`.

3. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

4. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## ⚡ Quick Start (Windows)
Simply run the included automation script:
```bash
./run_npmx.bat
```

## 📐 Architecture
NPMX utilizes a distributed polling architecture where the backend "Telemetery Engine" executes periodic diagnostics across the infrastructure. Data is persisted in MySQL and streamed to the React dashboard via a secure JSON API.

---
**Maintained by**: NPMX Core Development Team | *Advanced Agentic Coding Project*
