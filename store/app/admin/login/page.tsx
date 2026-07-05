"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) { router.push("/admin"); }
      else { const d = await res.json(); setError(d.error); }
    } catch { setError("登录失败"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold text-brand-500 mb-2">未来星潮品汇</h1>
        <p className="text-center text-gray-500 text-sm mb-8">管理员登录</p>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">用户名</label>
            <input value={username} onChange={e => setUsername(e.target.value)} autoFocus
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "登录中..." : "登录"}</Button>
        </form>
      </div>
    </div>
  );
}
