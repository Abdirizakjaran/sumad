# SUMAD TRAFFIC MGT

**Smart Traffic Management System** — Enterprise-grade platform for vehicle registration, traffic fines (tariko), payments, smart camera plate recognition, and real-time monitoring.

![Stack](https://img.shields.io/badge/React-Vite-blue) ![Stack](https://img.shields.io/badge/Node-Express-green) ![DB](https://img.shields.io/badge/PostgreSQL-Neon-blue)

## Features

- JWT authentication with role-based access (5 roles)
- Vehicle registration with QR codes and image uploads
- Traffic fines with evidence photos
- Finance payment processing (EVC Plus, WaafiPay, Sahal, Cash)
- Smart camera detection with Tesseract OCR
- Real-time updates via Socket.io
- Dashboard analytics with Recharts
- PDF/Excel revenue reports
- Somali + English language support
- Dark/light mode

## Project Structure

```
sumad-traffic-mgt/
├── client/          # React + Vite frontend
└── server/          # Node.js + Express API
```

## Prerequisites

- Node.js 18+
- PostgreSQL (Neon account)

## Quick Start

### 1. Backend Setup

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and set your `DATABASE_URL` and `JWT_SECRET`.

```bash
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

API runs at **http://localhost:5000**

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

App runs at **http://localhost:5173**

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@sumad.gov | Password123! |
| Traffic Admin | traffic.admin@sumad.gov | Password123! |
| Traffic Officer | officer@sumad.gov | Password123! |
| Finance Officer | finance@sumad.gov | Password123! |
| Camera Operator | camera@sumad.gov | Password123! |

## Demo Plates

| Plate | Status |
|-------|--------|
| MOG1234 | APPROVED (cleared) |
| MOG5678 | UNPAID (pending fine) |
| MOG9012 | UNPAID (pending fine) |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET/POST | /api/vehicles | Vehicle CRUD |
| GET/POST | /api/fines | Traffic fines |
| POST | /api/payments | Approve payment |
| POST | /api/camera/detect | Plate detection |
| GET | /api/dashboard/stats | Dashboard data |

## Camera Workflow

1. Open **Camera Detection** page
2. Start webcam or enter plate manually
3. System checks database instantly
4. **GREEN** = Approved / **RED** = Unpaid warning
5. Success/alert sounds play automatically

## Security

- Helmet, CORS, rate limiting
- bcrypt password hashing
- JWT protected routes
- Prisma ORM (SQL injection safe)
- Activity audit logs

## License

MIT — SUMAD TRAFFIC MGT © 2026
"# sumad" 
"# sumad" 
