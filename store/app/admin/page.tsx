"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingBag, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, newOrders: 0, totalOrders: 0 });
  const [newOrders, setNewOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products?admin=1&limit=1").then(r => r.json()).then(d => setStats(prev => ({ ...prev, products: d.total })));
    fetch("/api/orders?limit=50").then(r => r.json()).then(d => {
      const items = d.items || [];
      setStats(prev => ({ ...prev, totalOrders: d.total, newOrders: items.filter((o: any) => o.orderStatus === "new").length }));
      setNewOrders(items.filter((o: any) => o.orderStatus === "new").slice(0, 5));
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">控制台</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<Package size={24} />} label="商品总数" value={stats.products} color="text-blue-600" />
        <StatCard icon={<ShoppingBag size={24} />} label="待处理订单" value={stats.newOrders} color="text-orange-600" />
        <StatCard icon={<TrendingUp size={24} />} label="历史订单" value={stats.totalOrders} color="text-green-600" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">最新待处理订单</h2>
          <Link href="/admin/orders" className="text-sm text-brand-500">查看全部 →</Link>
        </div>
        {newOrders.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">暂无待处理订单</p>
        ) : (
          <div className="space-y-2">
            {newOrders.map(o => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <span className="font-mono text-sm text-gray-600">{o.orderNum}</span>
                  <span className="ml-3 text-sm">{o.customerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">¥{o.totalAmount.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
      <div className={color}>{icon}</div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
}
