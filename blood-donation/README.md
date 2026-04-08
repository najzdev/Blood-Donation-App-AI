# 🩸 BloodBank AI — Full MERN + Gemini AI Application

A complete blood donation management system with AI-powered patient prioritization and donor matching using **Google Gemini AI**.

---

## 📁 Project Structure

```
blood-donation/
├── backend/                  # Node.js + Express + MongoDB API
│   ├── models/
│   │   ├── User.js           # Auth model
│   │   ├── Donor.js          # Donor profiles
│   │   ├── Patient.js        # Patient records
│   │   ├── BloodRequest.js   # Blood request tracking
│   │   └── Inventory.js      # Blood stock management
│   ├── routes/
│   │   ├── auth.js           # JWT authentication
│   │   ├── donors.js         # Donor CRUD + donation recording
│   │   ├── patients.js       # Patient CRUD
│   │   ├── requests.js       # Blood request management
│   │   ├── inventory.js      # Inventory management
│   │   └── ai.js             # 🤖 Gemini AI endpoints
│   ├── middleware/
│   │   └── auth.js           # JWT middleware
│   ├── server.js             # Express entry point
│   ├── .env.example          # Environment variables template
│   └── package.json
│
├── frontend/                 # React 18 SPA
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.js    # Auth state management
│   │   ├── utils/
│   │   │   └── api.js            # Axios API client
│   │   ├── components/
│   │   │   ├── Layout.js         # Sidebar + topbar layout
│   │   │   └── Layout.css
│   │   ├── pages/
│   │   │   ├── Login.js          # Auth page
│   │   │   ├── Dashboard.js      # Overview + charts
│   │   │   ├── Donors.js         # Donor management
│   │   │   ├── Patients.js       # Patient management
│   │   │   ├── Requests.js       # Blood requests
│   │   │   ├── Inventory.js      # Blood stock
│   │   │   ├── AIAnalysis.js     # 🤖 AI patient prioritization
│   │   │   └── AIChat.js         # 🤖 AI chatbot
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── README.md
└── docker-compose.yml        # Optional Docker setup
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Google Gemini API Key** (free at https://aistudio.google.com/app/apikey)

---

### 1. Clone & Setup Backend

```bash
cd blood-donation/backend
npm install

# Copy and configure environment variables
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blood_donation
JWT_SECRET=your_super_secret_key_change_this
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

Start the backend:
```bash
npm run dev        # Development with nodemon (backend)
# or
npm start          # Production
```

---

### 2. Setup Frontend

```bash
cd blood-donation/frontend
npm install

# Optional: create .env (proxy is already configured in package.json)
cp .env.example .env
```

Start the frontend:
```bash
npm start          # Opens http://localhost:3000
```

---

### 3. Create First Admin User

Register via the UI at http://localhost:3000/login
- Set role to **Admin** during registration
- Or seed via API:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@bloodbank.com","password":"admin123","role":"admin"}'
```

---

## 🤖 AI Features (Gemini)

### 1. Patient Priority Analysis
**Endpoint:** `POST /api/ai/analyze-patients`

Gemini AI evaluates ALL waiting patients and scores them 0–100 based on:
- Urgency level (critical/urgent/moderate/low)
- Hemoglobin levels (< 7 g/dL = severe, critical)
- Oxygen saturation
- Diagnosis severity (surgery, cancer, thalassemia)
- Time waiting
- Available blood inventory

**UI:** Dashboard → "Run AI Analysis" or the AI Analysis page

### 2. Donor-Patient Matching
**Endpoint:** `POST /api/ai/match-donor/:patientId`

For a specific patient, Gemini finds and ranks the top 5 best donor matches considering:
- Blood group compatibility (compatibility matrix)
- Donor health metrics
- Time since last donation
- Donation history reliability
- Age and weight suitability

**UI:** Patients page → click the 🤖 button on any patient row

### 3. AI Medical Chatbot
**Endpoint:** `POST /api/ai/chat`

Conversational assistant for blood bank staff. Answers questions about:
- Blood type compatibility
- Donor eligibility rules
- Medical protocols
- Inventory recommendations

**UI:** AI Assistant page

### 4. Dashboard Insights
**Endpoint:** `GET /api/ai/insights`

AI-generated operational insights about:
- Critical inventory warnings
- Patient backlog analysis
- Donor recruitment recommendations

---

## 🩸 Blood Compatibility Matrix

| Recipient | Can Receive From |
|-----------|-----------------|
| A+  | A+, A-, O+, O- |
| A-  | A-, O- |
| B+  | B+, B-, O+, O- |
| B-  | B-, O- |
| AB+ | All blood types ✓ |
| AB- | A-, B-, AB-, O- |
| O+  | O+, O- |
| O-  | O- only |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Get current user |

### Donors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/donors` | List donors (filterable) |
| POST   | `/api/donors` | Register donor |
| PUT    | `/api/donors/:id` | Update donor |
| DELETE | `/api/donors/:id` | Delete donor |
| POST   | `/api/donors/:id/donate` | Record donation |
| GET    | `/api/donors/eligible/:bloodGroup` | Get eligible donors |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/patients` | List patients |
| POST   | `/api/patients` | Register patient |
| PUT    | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |
| GET    | `/api/patients/filter/critical` | Get critical patients |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/inventory` | Get all inventory |
| PUT    | `/api/inventory/:bloodGroup` | Update stock |
| GET    | `/api/inventory/stats/summary` | Summary stats |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/ai/analyze-patients` | 🤖 AI priority analysis |
| POST   | `/api/ai/match-donor/:id` | 🤖 AI donor matching |
| POST   | `/api/ai/chat` | 🤖 Medical chatbot |
| GET    | `/api/ai/insights` | 🤖 Dashboard insights |

---

## 🐳 Docker (Optional)

```yaml
# docker-compose.yml included
docker-compose up -d
```

Services:
- **MongoDB** on port 27017
- **Backend API** on port 5000
- **Frontend** on port 3000

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Chart.js, React Hot Toast |
| Backend | Node.js, Express 4, Mongoose |
| Database | MongoDB |
| AI | Google Gemini 1.5 Flash |
| Auth | JWT + bcryptjs |
| Styling | Custom CSS with CSS Variables |

---

## 📝 Notes

- The Gemini API has a generous **free tier** (60 requests/min)
- If `GEMINI_API_KEY` is not set, the system falls back to algorithmic scoring
- Blood expires after **42 days** — tracked in inventory donations
- Donors must wait **56 days** between donations (WHO standard)

---

## 📄 License

MIT — Free to use and modify.

---

## ⚡ Vite Frontend

The frontend uses **Vite** for ultra-fast development:

```bash
cd frontend
npm install
npm run dev      # → http://localhost:3000 (HMR enabled)
npm run build    # → production build in /dist
npm run preview  # → preview production build
```

### Key Vite files
| File | Purpose |
|------|---------|
| `vite.config.js` | Vite config + `/api` dev proxy to backend |
| `index.html` | Root HTML entry (at project root, not `/public`) |
| `src/main.jsx` | JS entry point (`<script type="module">`) |
| `.env.example` | Use `VITE_` prefix for env vars (`import.meta.env.VITE_*`) |

> **Note:** Vite's dev proxy forwards all `/api/*` requests to `http://localhost:5000` automatically — no CORS issues during development.
