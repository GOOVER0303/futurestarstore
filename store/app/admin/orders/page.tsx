"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

const STATUS_MAP: Record<string, string> = {
  new: "待处理", confirmed: "已确认", shipped: "已发货", completed: "已完成", cancelled: "已取消",
};
const STATUS_COLORS: Record<string, string> = {
  new: "bg-amber-100 text-amber-700", confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700", completed: "bg-green-100 text-green-700", cancelled: "bg-gray-100 text-gray-500",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/orders?limit=100").then(r => r.json()).then(d => { setOrders(d.items); setLoading(false); });
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderStatus: status }),
    });
    toast.success("状态已更新");
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">订单管理</h1>
      {loading ? <p className="text-gray-400">加载中...</p> : orders.length === 0 ? <p className="text-gray-400">暂无订单</p> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-3">订单号</th>
                <th className="text-left px-4 py-3">客户</th>
                <th className="text-left px-4 py-3">金额</th>
                <th className="text-left px-4 py-3">支付方式</th>
                <th className="text-left px-4 py-3">状态</th>
                <th className="text-right px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-mono text-xs">{o.orderNum}</td>
                  <td className="px-4 py-2">{o.customerName}<br /><span className="text-xs text-gray-400">{o.customerPhone}</span></td>
                  <td className="px-4 py-2 font-medium">¥{o.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-2">{o.paymentMethod === "online" ? "在线" : "线下"}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[o.orderStatus]}`}>
                      {STATUS_MAP[o.orderStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <select value={o.orderStatus} onChange={e => updateStatus(o.id, e.target.value)}
                      className="text-xs rounded border border-gray-200 px-2 py-1">
                      {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
