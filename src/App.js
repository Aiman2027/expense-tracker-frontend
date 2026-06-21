import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import "./App.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CATEGORIES = [
  { name: "Food", color: "#f97316", icon: "🍱" },
  { name: "Transport", color: "#3b82f6", icon: "🚌" },
  { name: "Shopping", color: "#a855f7", icon: "🛍️" },
  { name: "Health", color: "#22c55e", icon: "💊" },
  { name: "Bills", color: "#ef4444", icon: "📃" },
  { name: "Entertainment", color: "#eab308", icon: "🎬" },
  { name: "Education", color: "#06b6d4", icon: "📚" },
  { name: "Other", color: "#6b7280", icon: "💼" },
];

const getCatMeta = (name) =>
  CATEGORIES.find((c) => c.name === name) || { color: "#6b7280", icon: "💼" };

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Axios interceptor - attach token to every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // login | signup
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", category: "Food", date: new Date().toISOString().split("T")[0], note: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      fetchExpenses();
    }
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API}/api/expenses`);
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const endpoint = authMode === "login" ? "/api/user/login" : "/api/user/signup";
      const payload = authMode === "login"
        ? { email: authForm.email, password: authForm.password }
        : { name: authForm.name, email: authForm.email, password: authForm.password };

      const res = await axios.post(`${API}${endpoint}`, payload);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      fetchExpenses();
    } catch (err) {
      setAuthError(err.response?.data?.error || "Something went wrong");
    }
    setAuthLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setExpenses([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.date) return;
    setLoading(true);
    try {
      await axios.post(`${API}/api/expenses`, form);
      setForm({ title: "", amount: "", category: "Food", date: new Date().toISOString().split("T")[0], note: "" });
      setShowForm(false);
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const byCategory = CATEGORIES.map((c) => ({
    name: c.name,
    value: filtered.filter((e) => e.category === c.name).reduce((s, e) => s + e.amount, 0),
    color: c.color,
  })).filter((c) => c.value > 0);

  // AUTH SCREEN
  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-logo">💰 Expense Tracker</h1>
          <p className="auth-tagline">Track your monthly expenses smartly</p>

          <div className="auth-tabs">
            <button className={`auth-tab ${authMode === "login" ? "active" : ""}`} onClick={() => { setAuthMode("login"); setAuthError(""); }}>Login</button>
            <button className={`auth-tab ${authMode === "signup" ? "active" : ""}`} onClick={() => { setAuthMode("signup"); setAuthError(""); }}>Sign Up</button>
          </div>

          <form onSubmit={handleAuth} className="auth-form">
            {authMode === "signup" && (
              <input className="input" placeholder="Full Name" value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} required />
            )}
            <input className="input" type="email" placeholder="Email Address" value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
            <input className="input" type="password" placeholder="Password" value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required />
            {authError && <p className="auth-error">{authError}</p>}
            <button className="submit-btn" type="submit" disabled={authLoading}>
              {authLoading ? "Please wait..." : authMode === "login" ? "Login" : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            <p>Built by <strong>Aiman Nishat</strong> · aimannishat78692@gmail.com</p>
            <a className="dh-btn-small" href="https://digitalheroesco.com" target="_blank" rel="noreferrer">
              Built for Digital Heroes
            </a>
          </div>
        </div>
      </div>
    );
  }

  // MAIN APP
  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div>
            <h1 className="header-title">💰 Monthly Expense Tracker</h1>
            <p className="header-sub">Aiman Nishat &nbsp;·&nbsp; aimannishat78692@gmail.com</p>
          </div>
          <div className="header-right">
            <span className="welcome-text">👋 {user.name}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
            <a className="dh-btn" href="https://digitalheroesco.com" target="_blank" rel="noreferrer">
              Built for Digital Heroes
            </a>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="controls-row">
          <select className="month-select" value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))}>
            {months.map((m, i) => <option key={m} value={i}>{m} {filterYear}</option>)}
          </select>
          <button className="add-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancel" : "+ Add Expense"}
          </button>
        </div>

        {showForm && (
          <div className="form-card">
            <h2 className="form-title">New Expense</h2>
            <form onSubmit={handleSubmit} className="form-grid">
              <input className="input" placeholder="Title (e.g. Groceries)" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <input className="input" type="number" placeholder="Amount (₹)" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })} required min="0" />
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
              <input className="input" type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              <input className="input span-2" placeholder="Note (optional)" value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })} />
              <button className="submit-btn span-2" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Expense"}
              </button>
            </form>
          </div>
        )}

        <div className="summary-row">
          <div className="stat-card">
            <p className="stat-label">Total this month</p>
            <p className="stat-value">₹{total.toLocaleString("en-IN")}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Transactions</p>
            <p className="stat-value">{filtered.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Avg per transaction</p>
            <p className="stat-value">₹{filtered.length ? Math.round(total / filtered.length).toLocaleString("en-IN") : 0}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Top category</p>
            <p className="stat-value">{byCategory.length ? byCategory.sort((a, b) => b.value - a.value)[0].name : "—"}</p>
          </div>
        </div>

        <div className="content-grid">
          <div className="list-section">
            <h2 className="section-title">Expenses — {months[filterMonth]}</h2>
            {filtered.length === 0 ? (
              <div className="empty">No expenses added for this month yet.</div>
            ) : (
              <ul className="expense-list">
                {filtered.map((exp) => {
                  const meta = getCatMeta(exp.category);
                  return (
                    <li key={exp._id} className="expense-item">
                      <div className="exp-icon" style={{ background: meta.color + "22" }}>{meta.icon}</div>
                      <div className="exp-details">
                        <p className="exp-title">{exp.title}</p>
                        <p className="exp-sub">
                          <span className="cat-badge" style={{ background: meta.color + "22", color: meta.color }}>{exp.category}</span>
                          &nbsp;{exp.date}{exp.note ? " · " + exp.note : ""}
                        </p>
                      </div>
                      <div className="exp-right">
                        <p className="exp-amount">₹{exp.amount.toLocaleString("en-IN")}</p>
                        <button className="del-btn" onClick={() => handleDelete(exp._id)} title="Delete">✕</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="chart-section">
            <h2 className="section-title">Breakdown</h2>
            {byCategory.length === 0 ? (
              <div className="empty">Add expenses to see chart.</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={byCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    {byCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toLocaleString("en-IN")}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="cat-breakdown">
              {byCategory.sort((a, b) => b.value - a.value).map((c) => (
                <div key={c.name} className="cat-row">
                  <span className="cat-dot" style={{ background: c.color }} />
                  <span className="cat-name">{c.name}</span>
                  <span className="cat-amount">₹{c.value.toLocaleString("en-IN")}</span>
                  <span className="cat-pct">{Math.round((c.value / total) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>Built by <strong>Aiman Nishat</strong> · aimannishat78692@gmail.com</p>
      </footer>
    </div>
  );
}
