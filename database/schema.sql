-- NPMX Enterprise — Complete Database Schema
-- Run this entire file in MySQL Workbench against your npmx_db database

USE npmx_db;

-- ─────────────────────────────────────────
-- 1. Devices
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_name VARCHAR(255) NOT NULL,
    ip_address VARCHAR(255) NOT NULL,
    port INT DEFAULT 161,
    snmp_community VARCHAR(255) DEFAULT 'public',
    status VARCHAR(50) DEFAULT 'active'
);

-- ─────────────────────────────────────────
-- 2. Metrics (ICMP / Ping)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT,
    latency FLOAT,
    packet_loss FLOAT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- 3. SNMP Metrics (Bandwidth)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS snmp_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT,
    in_octets BIGINT DEFAULT 0,
    out_octets BIGINT DEFAULT 0,
    bandwidth FLOAT DEFAULT 0.0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- 4. Alerts
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT,
    metric_type VARCHAR(50),
    metric_value FLOAT,
    threshold_value FLOAT,
    severity VARCHAR(50),
    alert_message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- 5. Thresholds (per device)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS thresholds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT UNIQUE,
    latency_threshold FLOAT DEFAULT 100.0,
    packet_loss_threshold FLOAT DEFAULT 5.0,
    bandwidth_threshold FLOAT DEFAULT 80.0
);

-- ─────────────────────────────────────────
-- 6. Reports
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_date DATE UNIQUE,
    total_devices INT,
    active_devices INT,
    critical_alerts INT,
    avg_latency FLOAT,
    max_bandwidth FLOAT,
    packet_loss_events INT,
    pdf_path VARCHAR(255)
);

-- ─────────────────────────────────────────
-- 7. Topology Nodes
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS topology_nodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT UNIQUE,
    position_x FLOAT DEFAULT 100,
    position_y FLOAT DEFAULT 100
);

-- ─────────────────────────────────────────
-- 8. Topology Links
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS topology_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_node INT,
    target_node INT
);

-- ─────────────────────────────────────────
-- 9. Users (Authentication)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- 10. System Audit Logs
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    action VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
