# 💰 Expense Tracker

A full-stack monthly expense tracking app with authentication, category-wise breakdown, and interactive charts.

**Live App:** https://expense-tracker-frontend-blue-six.vercel.app

---

## ✨ Features

- User signup & login with JWT authentication
- Add, view, and delete expenses
- Categorize expenses (Food, Transport, Shopping, Health, Bills, Entertainment, Education, Other)
- Monthly filtering
- Summary stats — total spend, transaction count, average per transaction, top category
- Interactive pie chart breakdown by category (Recharts)
- Responsive, modern UI

---

## 🛠️ Tech Stack

**Frontend**
- React
- Axios
- Recharts (data visualization)
- Deployed on Vercel

**Backend**
- Node.js + Express
- MongoDB (Atlas) with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Deployed on Vercel (serverless functions)

---

## 📁 Project Structure

```
expense-tracker/
├── expense-tracker-frontend/
│   ├── src/
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
└── expense-tracker-backend/
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── User.js
    │   └── Expense.js
    ├── routes/
    │   ├── user.js
    │   └── expenses.js
    ├── jwt.js
    ├── server.js
    └── package.json
```

---

## ⚙️ Environment Variables

### Backend (Vercel Project Settings → Environment Variables)

| Key | Description | Example |
|---|---|---|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/expensetracker?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key used to sign/verify JWT tokens | any long random string |

### Frontend (Vercel Project Settings → Environment Variables)

| Key | Description | Example |
|---|---|---|
| `REACT_APP_API_URL` | Base URL of the deployed backend (no trailing `/api`) | `https://expense-tracker-backend-seven-tau.vercel.app` |

> ⚠️ After changing any environment variable on Vercel, you must **redeploy** — env vars are baked in at build/runtime and won't apply to old deployments.

---

## 🚀 Local Setup

### Backend
```bash
cd expense-tracker-backend
npm install
# create a .env file with MONGO_URI and JWT_SECRET
npm start
```

### Frontend
```bash
cd expense-tracker-frontend
npm install
# create a .env file with REACT_APP_API_URL=http://localhost:5000
npm start
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/user/signup` | Register a new user | No |
| POST | `/api/user/login` | Login and receive JWT | No |
| GET | `/api/expenses` | Get all expenses for logged-in user | Yes |
| POST | `/api/expenses` | Add a new expense | Yes |
| DELETE | `/api/expenses/:id` | Delete an expense | Yes |

Authenticated requests must include:
```
Authorization: Bearer <token>
```

---

## 📌 Notes

- MongoDB Atlas Network Access must allow `0.0.0.0/0` for Vercel's serverless functions to connect.
- Passwords used in the MongoDB connection string should avoid special characters like `@`, `#`, `%` unless URL-encoded.
- On Vercel, each deployment gets a unique hash-based URL in addition to the stable project domain — always point the frontend to the **stable** backend domain, not a deployment-specific one.
