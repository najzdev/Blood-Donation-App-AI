# 🩸 Dem AI — Blood Donation Platform

AI-powered blood donation platform built with MERN stack and Google Gemini. Matches donors to patients in real-time based on urgency, blood compatibility, and proximity.

---

## 📁 Project Structure

```
dem-ai/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── layout/    # Navbar, DashboardLayout
│       │   ├── dashboard/ # AIChat, BloodRequestForm, NotificationsPanel
│       │   └── ui/        # Shared UI components
│       ├── context/       # AuthContext, ThemeContext
│       ├── pages/         # Home, About, Login, Register
│       │   ├── admin/     # Admin dashboard
│       │   ├── doctor/    # Doctor dashboard
│       │   ├── donor/     # Donor dashboard
│       │   └── patient/   # Patient dashboard
│       ├── locales/       # en.json, fr.json, ar.json
│       └── utils/         # Axios API config
└── server/          # Node.js + Express backend
    ├── controllers/ # authController, userController, etc.
    ├── middleware/  # auth.js (JWT protect + authorize)
    ├── models/      # User, BloodRequest, Donation, Notification
    ├── routes/      # auth, users, requests, donations, ai
    └── seed.js      # Database seeder
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key

---

### 1. Clone / Extract the project

```bash
cd dem-ai
```

---

### 2. Setup the Server

```bash
cd server
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dem-ai
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
```

Seed the database with demo data:
```bash
node seed.js
```

Start the server:
```bash
npm run dev      # development (nodemon)
npm start        # production
```

Server runs on: `http://localhost:5000`

---

### 3. Setup the Client

```bash
cd ../client
npm install
npm run dev
```

Client runs on: `http://localhost:5173`

---

## 🔑 Demo Accounts

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@demai.com        | admin123    |
| Doctor  | doctor@demai.com       | doctor123   |
| Donor   | donor@demai.com        | donor123    |
| Patient | patient@demai.com      | patient123  |

---

## 🚀 Features

### Authentication & Roles
- JWT-based auth with role guards
- 4 roles: Admin, Doctor, Donor, Patient
- Protected routes per role

### AI Matching (Google Gemini)
- Matches donors to patients by blood compatibility + urgency + location
- Prioritizes critical cases
- AI chat assistant (multilingual)

### Dashboards
- **Admin**: Full user/request/donation management + stats
- **Doctor**: Manage requests, trigger AI matching, view donors
- **Donor**: Browse available requests, schedule donations
- **Patient**: Submit requests, track status, view AI matches

### Other Features
- Blood request CRUD with urgency levels
- Real-time notifications
- Light/Dark mode
- Multilingual: English, French, Arabic (RTL support)
- Mobile-responsive design

---

## 🔌 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile

GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id        (admin)
DELETE /api/users/:id        (admin)

GET    /api/requests
POST   /api/requests
PUT    /api/requests/:id
DELETE /api/requests/:id

GET    /api/donations
POST   /api/donations
PUT    /api/donations/:id

GET    /api/notifications
PUT    /api/notifications/read-all
PUT    /api/notifications/:id/read

GET    /api/ai/match/:requestId    (doctor/admin)
GET    /api/ai/prioritize          (doctor/admin)
POST   /api/ai/chat
```

---

## 🌐 Multilingual Support

Languages: `en` (English), `fr` (French), `ar` (Arabic with RTL)

Switch languages from the top navigation bar or the dashboard topbar.

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, React Router v6     |
| Styling   | Custom CSS (design system)          |
| i18n      | i18next + react-i18next             |
| Backend   | Node.js, Express                    |
| Database  | MongoDB + Mongoose                  |
| Auth      | JWT (jsonwebtoken + bcryptjs)       |
| AI        | Google Gemini API                   |
| Icons     | Lucide React                        |

---

## 👥 Team

| Name              | Role                                |
|-------------------|-------------------------------------|
| Hamza Labbaalli | Full-Stack Developer & Project Lead |
| Fatima Tildi     | UI/UX Designer & Frontend Dev       |
| Lamya Jarrari    | AI Integration & Data Analyst       |
| Dr. Ouadii | Medical Advisor & Domain Expert     |

---

## 📄 License

MIT © 2026 Dem AI Team
