# CineLedger 🎬 — Auditable Movie Ticketing & Box-Office Verification Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v20.x-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v19.x-cyan.svg)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-v7.0-emerald.svg)](https://www.mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com)

**CineLedger** is a full-stack, enterprise-grade movie ticketing and auditable box-office verification platform. It solves the critical entertainment industry challenge of **ticket scalping, unaccounted box-office revenue leaks, and double-booking discrepancies** through atomic seat locking, cryptographic QR code verification at gate scanners, and real-time ledger settlement aggregation.

---

## 🏛️ System Architecture

```
                                  +---------------------------------------+
                                  |      CineLedger React Frontend        |
                                  |  (Vite + Tailwind v4 + Recharts UI)   |
                                  +-------------------+-------------------+
                                                      |
                                                      | HTTP / REST API
                                                      v
                                  +---------------------------------------+
                                  |        Express.js Backend API         |
                                  |   (Auth, Auditing, Verification)      |
                                  +---------+-------------------+---------+
                                            |                   |
                     Cron Job (Aggregation) |                   | Mongoose ODM
                                            v                   v
                                  +-------------------+ +-----------------+
                                  | Aggregation Job   | | MongoDB 7.0     |
                                  | (Ledger Ledger)   | | Database      |
                                  +-------------------+ +-----------------+
```

---

## 🌟 Key Real-World Features

- **🔐 Cryptographic QR Gate Verification**:
  - Digital e-tickets with SHA-256 HMAC anti-tampering proofs.
  - Live gate entry station with camera scanning & sound feedback (AudioSynth chime).
  - Anti-reuse validation preventing double-entry with scanned status badges (`ISSUED` vs `USED`).

- **🎟️ Interactive Seat Selection & FOV Inspector**:
  - Atomic seat reservation preventing race conditions.
  - Interactive seat angle & field-of-view (FOV) preview (VIP Lounge vs Standard seats).

- **📊 Transparent Box-Office Revenue Aggregation**:
  - Automated cron aggregation engine (`node-cron`).
  - Net box office, 18% GST calculation, 55/45 Producer-Theatre revenue splits.
  - Automated **Discrepancy Audit Flags** whenever third-party aggregator figures diverge from verified gate scan logs.

- **📄 Printable Digital Cinema Pass**:
  - Professional print layout for digital ticket passes complete with theater details, showtime, barcode, seat grid, and terms.

- **⚡ Instant Demo Role Switcher**:
  - Built-in navbar switcher to immediately transition between **Super Admin**, **Producer**, **Theatre Admin**, and **Customer** for quick evaluation.

---

## 👥 Role-Based Access Control (RBAC) Matrix

| Role | Customer Portal | Seat Booking | POS Counter | Gate QR Scan | Box-Office Analytics | Super Admin Audit |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **CUSTOMER** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **THEATRE_ADMIN** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **PRODUCER** | ✅ | ❌ | ❌ | ❌ | ✅ (Owned Movies) | ❌ |
| **SUPER_ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ (All Movies) | ✅ |

---

## 🔑 Demo Login Presets

| Role | Email | Password | Scope / Primary Dashboard |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@cineledger.com` | `admin123` | Full System Governance & Audit Log Stream |
| **Producer (Dharma)** | `producer.karan@cineledger.com` | `producer123` | Box-Office Collections & Revenue Settlement |
| **Producer (YRF)** | `producer.aditya@cineledger.com` | `producer123` | Box-Office Collections & Revenue Settlement |
| **Theatre Admin (PVR)**| `admin.pvr@cineledger.com` | `theatre123` | POS Counter & Gate Scanner Station |
| **Customer** | `customer@gmail.com` | `customer123` | Movie Browsing & Online Seat Selection |

---

## 🚀 Quick Start Guide

### Option 1: Running with Docker Compose (Recommended)

Ensure Docker Desktop is running, then execute:

```bash
docker-compose up --build
```

The application will be available at:
- **Frontend App**: [http://localhost](http://localhost) (or `http://localhost:80`)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **MongoDB**: `localhost:27017`

### Option 2: Running Locally (Node.js + Local MongoDB)

1. **Start Local MongoDB Server**:
   Ensure MongoDB service is running locally on port `27017`.

2. **Backend Setup & Seed Data**:
   ```bash
   cd backend
   npm install
   npm run seed    # Populates MongoDB with multi-city demo data & credentials
   npm run dev     # Starts Express server on http://localhost:5000
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev     # Starts Vite dev server on http://localhost:5173
   ```

---

## 🌐 API Reference Overview

| Endpoint | Method | Role Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/health` | `GET` | Public | System status check |
| `/api/auth/login` | `POST` | Public | User authentication & JWT generation |
| `/api/movies` | `GET` | Public | Catalog listing of movies with search & filters |
| `/api/shows` | `GET` | Public | Showtimes filtered by movie, theatre, or city |
| `/api/bookings` | `POST` | Authenticated | Create atomic seat booking |
| `/api/tickets/verify-scan` | `POST` | Theatre/Admin | Validate QR ticket code at gate |
| `/api/collections/summary` | `GET` | Producer/Admin | Aggregated box-office collections |
| `/api/collections/settlement`| `GET` | Producer/Admin | Tax split (GST) & Producer vs Theatre share |
| `/api/admin/audit-logs` | `GET` | Super Admin | Audit log stream |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
