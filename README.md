# 🚀 Attendly (Gradence) - Premium Academic Ecosystem

**Attendly** is a state-of-the-art, 360-degree campus management platform designed for modern educational institutions. It bridges the gap between faculty, students, and parents with a high-performance, real-time interface.

![Attendly Dashboard Mockup](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200)

---

## ✨ The Triple-Portal Ecosystem

### 👨‍🏫 1. Faculty Command Center
*   **Rapid Marking**: Dense grid-mode for attendance marking in under 30 seconds.
*   **Double Period Support**: Single-click marking for multi-lecture sessions.
*   **Live SMS Queue**: Real-time tracking of parent notifications via simulated MSG91/WhatsApp API.
*   **Promotion Center**: Manage academic lifecycles with bulk batch transitions and graduation logic.

### 🎓 2. Student Growth Portal
*   **Internal Assessment Focus**: Real-time tracking of CIA, Test, and Assignment marks.
*   **Attendance Recovery Goal**: An intelligent calculator that tells students exactly how many next classes they must attend to hit eligibility.
*   **Digital Hall Ticket Eligibility**: Automated locking/unlocking of exam permits based on real-time data.
*   **Performance Stability**: Interactive Recharts visualizations showing weekly engagement trends.

### 🏠 3. Parent Family Hub
*   **Risk Mitigation**: Instant colored alerts (Red/Yellow/Green) for attendance shortages or performance drops.
*   **Smart Insights**: Human-readable academic advice generated from raw student data.
*   **Faculty Direct**: Quick-actions to contact department heads or school admin regarding leave.
*   **Presence Timeline**: A transparent view of their child's daily period-by-period location.

---

## 🛠️ Technical Excellence

*   **Core**: [Next.js 15+](https://nextjs.org/) (App Router & Turbopack)
*   **Database**: [Prisma](https://www.prisma.io/) with PostgreSQL
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
*   **Charts**: [Recharts](https://recharts.org/) for academic analytics
*   **PWA**: Fully installable on iOS/Android with offline caching and standalone mode.
*   **Components**: Radix UI + Shadcn/UI for a premium, accessible interface.

---

## 🚀 Getting Started

1. **Clone & Install**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Copy `.env.example` to `.env` and configure your Database URL and SMS API keys.

3. **Database Migration**:
   ```bash
   npx prisma migrate dev
   ```

4. **Run Development**:
   ```bash
   npm run dev
   ```

---

## 📱 PWA Features
Attendly is built as a **Progressive Web App**. Visit the site on your mobile browser and select **"Add to Home Screen"** to experience a zero-latency native feel.

---

## 🏷️ Brand Vision
Attendly (internally code-named **Gradence**) aims to reduce institutional friction by 40% through automated notifications and real-time academic transparency.

---

**Built with ❤️ for Modern Education.**
