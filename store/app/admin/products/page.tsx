"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/products?admin=1&limit=100").then(r => r.json()).then(d => { setItems(d.items); setLoading(false); });
  }

  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm("确定删除该商品？")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    toast.success("已删除");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">商品管理</h1>
        <Link href="/admin/products/new"><Button><Plus size={16} className="mr-1" />添加商品</Button></Link>
      </div>
      {loading ? <p className="text-gray-400">加载中...</p> : items.length === 0 ? <p className="text-gray-400">暂无商品</p> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-3">图片</th>
                <th className="text-left px-4 py-3">名称</th>
                <th className="text-left px-4 py-3">价格</th>
                <th className="text-left px-4 py-3">状态</th>
                <th className="text-right px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                      {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">暂无</div>}
                    </div>
                  </td>
                  <td className="px-4 py-2 font-medium">{p.title}</td>
                  <td className="px-4 py-2">¥{p.price.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.isActive ? "上架" : "下架"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/admin/products/${p.id}/edit`} className="inline-flex p-1.5 text-gray-400 hover:text-brand-500"><Edit3 size={16} /></Link>
                    <button onClick={() => del(p.id)} className="inline-flex p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
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
