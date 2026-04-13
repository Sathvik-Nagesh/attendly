# 🎯 Attendly: Production-Grade Attendance Ecosystem

[![Next.js](https://img.shields.io/badge/Next.js-16+-black?logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org/)
[![Security](https://img.shields.io/badge/Security-Audit_Passed-emerald)](./SECURITY.md)

Attendly is a premium, multi-tenant attendance and academic management system designed for modern colleges. It bridges the gap between faculty, administration, students, and parents with a high-fidelity, professional interface and automated notification systems.

---

## 🚀 Key Features

### 🏛️ Multi-Portal Ecosystem
*   **Teacher/Admin Portal**: Real-time attendance marking, mass student management, and department-level analytics.
*   **Student Portal**: Performance tracking, automated CIA (Internal Marks) calculation, and achievement logs.
*   **Parent Portal**: Real-time risk alerts for attendance shortage and academic standing insights.

### ⚡ Intelligence & Automation
*   **Fast Entry Mode**: Record absentees in seconds with intelligent roll-number handling.
*   **Smart SMS Bridge**: Instant automated alerts to parents via MSG91/WhatsApp integration.
*   **Academic Intelligence**: Centralized engine for calculating weighted internal marks (CIA) from attendance and tests.
*   **One-Click Reporting**: Generate Defaulter Lists (PDF) and Monthly Attendance Sheets (XLS) instantly.

---

## 🛡️ Security Architecture

Attendly follows a "Security-First" philosophy with multiple hardened layers:

| Layer | Implementation |
|-------|----------------|
| **Data At Rest** | All passwords hashed using **Bcrypt** (12 rounds) with unique salt. |
| **XSS Prevention** | Full input sanitization via **DOMPurify** + React auto-escaping. |
| **Network Security** | Custom **Content Security Policy (CSP)** headers and CSRF protection. |
| **Authorization** | Strict **Role-Based Access Control (RBAC)** enforced via Next.js middleware. |
| **Multi-Tenancy** | Mandatory `organizationId` scoping on every database query for strict isolation. |

---

## 🛠️ Technology Stack

*   **Frontend**: Next.js 16 (App Router), Tailwind CSS, Framer Motion, Lucide Icons.
*   **Backend**: Next.js Server Actions & API Routes (in-progress).
*   **Database**: Prisma ORM with PostgreSQL.
*   **Monitoring**: Centralized Error Logging & Performance Metrics.
*   **Environment**: Fully containerized and PWA-ready.

---

## ⌨️ Getting Started

### 1. Prerequisites
- Node.js 20+
- PostgreSQL Instance

### 2. Installation
```powershell
# Clone the repository
git clone https://github.com/attendly/system.git
cd attendly

# Install dependencies
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env` and fill in your credentials.
```env
DATABASE_URL="postgresql://user:password@localhost:5432/attendly"
NEXTAUTH_SECRET="your-secret-key"
MSG91_AUTH_KEY="your-api-key"
```

### 4. Database Initialization
```powershell
npx prisma generate
npx prisma migrate dev
```

### 5. Start Development
```powershell
npm run dev
```

---

## 📋 Roadmap

- [x] Multi-Portal UI Architecture
- [x] Security Hardening (Hashing, Sanitization, CSP)
- [x] Multi-Tenant Schema Design
- [ ] NextAuth.js Integration (Social & Credential)
- [ ] Real-time WebSocket Notifications
- [ ] Mobile App (React Native bridge)

---

## 📄 License
© 2026 Attendly Systems Private Limited. All rights reserved. 
Internal use only for registered partner institutions.
