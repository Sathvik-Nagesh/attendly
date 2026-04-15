# 🎓 Attendly (Gradence): Institutional Command Center

[![Next.js](https://img.shields.io/badge/Next.js-16+-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3ECF8E?logo=supabase)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Native_Experience-blue)](https://web.dev/progressive-web-apps/)
[![Security](https://img.shields.io/badge/Security-Audit_Passed-emerald)](./SECURITY.md)

**Attendly (Gradence)** is a premium, institutional-grade command center designed for modern colleges. It transitions standard academic tracking into a high-fidelity, data-driven ecosystem where faculty, administration, and parents are synchronized via a resilient PWA architecture.

---

## 🏛️ Institutional Sovereignty Features

### 📡 Relational Offline Persistence (ROPE)
Designed for the "Real World" of large campuses.
- **Elevator-Sync**: Faculty can mark attendance in cellular dead zones or basement labs.
- **Fail-Safe Buffering**: If cloud synchronization fails, sessions are securely buffered in a local relational vault and pushed the moment signal is restored.

### 🔐 Biometric Identity Binding
- **Passkey Sovereignty**: Faculty can bind their institutional profile to their device hardware (FaceID/TouchID).
- **Hardened Security**: Multi-factor identity verification without the friction of passwords.

### 🎭 Native "High-Fidelity" UX
- **Institutional Haptic Engine**: Tactile vibrations for successful marks, syncs, and errors, matching premium mobile app standards.
- **iOS Active Onboarding**: Custom adaptive installation guidance for Safari users to ensure 100% PWA adoption.
- **Universal Shortcuts**: Long-press app shortcuts for "Mark Attendance," "Campus Pulse," and "Subject Registry."

---

## 🛡️ Core Institutional Pillars

### 1. Subject Data Sovereignty (The Lock-In)
- **Ownership**: Hard relational lock on `(subject_id, class_id)` prevents teacher collisions.
- **Blockchain-Style Verification**: Sessions are locked to the claiming faculty member once verified.

### 2. Live Intelligence
- **Pattern Audit**: Heuristic fuzzy search for instant student discovery.
- **Campus Pulse**: Real-time heartbeat of institutional attendance trends.
- **Guardian Visibility**: High-fidelity subject-wise ledgers for parents.

---

## 🛠️ Security & Scaling Architecture

- **Identity**: Supabase Auth with Role-Based Access Control (RBAC).
- **Network Sovereignty**: Built-in Security Proxy with Rate Limiting and standard header-based protection.
- **Type Safety**: 100% TypeScript coverage with institutional-grade schemas and services.

---

## ⌨️ Developer Operations

```powershell
# 1. Clone & Enter
git clone https://github.com/Brandex/Attendly.git
cd Attendly

# 2. Sync Dependencies
npm install

# 3. Launch Command Center
npm run dev
```

---

## 📋 Production Roadmap (Trial Phase)

- [x] **Relational Lock-In**: Subject ownership and collision prevention.
- [x] **Institutional Offline**: ROPE service for session buffering.
- [x] **Biometric Entry**: Passkey enrollment for faculty.
- [x] **Haptic Feedback**: Tactile interaction engine.
- [ ] **Push Notifications**: Transitioning from SMS to native browser push.
- [ ] **AI Forecasting**: Predictive analytics for attendance shortages.

---

## 📄 Corporate Registry
© 2026 Attendex Systems Private Limited (Brandex). 
Designed for institutional scaling and high-concurrency environments.
