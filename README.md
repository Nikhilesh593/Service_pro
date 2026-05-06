# ServicePro — Local Service Provider Platform

A full-stack MERN application connecting customers with local service technicians and organizations. Built as a college project.

## 🏗️ Project Structure

```
Service_pro/
├── frontend/          ← React + Vite (runs on port 5173)
├── backend/           ← Node.js + Express + MongoDB (runs on port 5000)
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start (New Team Member Setup)

### Prerequisites
- Node.js v18+ installed
- MongoDB running locally (`mongod`) OR a MongoDB Atlas connection string
- Git installed

### 1. Clone the repo
```bash
git clone https://github.com/Nikhilesh593/Service_pro.git
cd Service_pro
```

### 2. Set up the Backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/service_marketplace
JWT_SECRET=your_super_secret_jwt_key_here
AI_API_KEY=your_google_gemini_api_key_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:5173
PORT=5000
```

Start the backend:
```bash
node server.js
```
✅ You should see: `MongoDB Connected` and `Server running on port 5000`

### 3. Set up the Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
✅ Open http://localhost:5173 in your browser

---

## 👥 User Roles

| Role | Description |
|---|---|
| **Customer** | Books service requests, tracks status, downloads PDF reports |
| **Technician** | Accepts/rejects job requests, marks jobs complete |
| **Organization** | Manages multiple technicians, handles bulk jobs |
| **Admin** | Approves/rejects technician & org accounts, views platform stats |

### Creating an Admin account
Currently, set `role: 'admin'` directly in MongoDB for your admin user.

---

## 🔑 Key Features

- ✅ JWT Authentication with role-based access
- 🤖 AI service category suggestion (Google Gemini)
- 🤖 AI price estimation (Gemini)
- 📄 PDF job sheet download (pdfkit)
- 📱 QR code job check-in/check-out *(in progress)*
- 🔔 Email + in-app notifications *(in progress)*
- 💬 AI chatbot assistant *(in progress)*
- 📊 Admin dashboard with platform stats

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Lucide Icons |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs |
| AI | Google Gemini via `@google/genai` |
| PDF | pdfkit |
| File Upload | Multer |

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` — Register (customer/technician/organization)
- `POST /api/auth/login` — Login, returns JWT token

### Service Requests (requires token)
- `POST /api/request` — Create new request
- `GET /api/request/my` — Get my requests
- `GET /api/request/all` — Get all pending requests (technicians only)
- `PUT /api/request/accept/:id` — Accept a request
- `PUT /api/request/reject/:id` — Reject a request
- `PUT /api/request/complete/:id` — Mark as complete
- `GET /api/request/:id/pdf` — Download PDF report

### AI
- `POST /api/ai/suggest-service` — Suggest service category from problem text
- `POST /api/ai/estimate-price` — Estimate price range
- `POST /api/ai/chat` — Chatbot message

### Admin (requires admin token)
- `GET /api/admin/pending` — Get pending provider accounts
- `PUT /api/admin/approve/:id` — Approve a provider
- `PUT /api/admin/reject/:id` — Reject a provider

---

## 🌿 Git Workflow (Team)

```bash
# Before starting work each day
git pull origin main

# After making changes
git add .
git commit -m "feat: describe what you did"
git push origin main
```

Use clear commit messages:
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code cleanup
- `style:` for UI/CSS changes
