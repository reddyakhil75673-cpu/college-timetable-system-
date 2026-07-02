import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.tsx";
import API from "../api/api.ts";
import { BookOpen, LogIn, Lock, Mail, Users } from "lucide-react";

export const Login: React.FC = () => {
  const { login, addAlert } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const quickAccounts = [
    { label: "Admin", email: "admin@gmail.com", password: "admin123" },
    { label: "Principal", email: "principal@gmail.com", password: "principal123" },
    { label: "Incharge", email: "incharge@gmail.com", password: "incharge123" },
    { label: "Faculty", email: "faculty@gmail.com", password: "faculty123" },
    { label: "Student", email: "student@gmail.com", password: "student123" },
  ];

  const handleQuickLogin = (acc: typeof quickAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addAlert("error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      const { token, user } = res.data;

      // Save to context/localstorage
      login(token, user);

      // Redirect based on role
      const lowerRole = user.role.toLowerCase();
      navigate(`/${lowerRole}/dashboard`);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Invalid credentials. Please try again.";
      addAlert("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
            <BookOpen className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">Sign In</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            College Timetable & Academic Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all"
                  placeholder="name@college.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 px-4 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-600/10"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </div>
        </form>

        {/* Demo Quick Accounts */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">
            <Users className="h-4 w-4 text-indigo-500" />
            <span>Quick Test Accounts</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {quickAccounts.map((acc) => (
              <button
                key={acc.label}
                onClick={() => handleQuickLogin(acc)}
                className="rounded-xl border border-slate-200 bg-white py-2 px-2.5 text-center text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
