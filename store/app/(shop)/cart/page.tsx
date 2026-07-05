"use client";
import React from "react";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/shop/CartContext";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-lg font-medium text-gray-600 mb-2">购物车是空的</h2>
        <p className="text-sm text-gray-400 mb-6">快去挑选心仪的商品吧</p>
        <Link href="/"><Button>开始选购</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">购物车 ({items.length})</h1>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={`${item.productId}-${item.size}-${i}`} className="flex gap-4 bg-white rounded-xl p-3 shadow-sm">
            <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
              {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">暂无</div>}
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/products/${item.productId}`} className="font-medium text-sm hover:text-brand-500 line-clamp-1">{item.title}</Link>
              <p className="text-xs text-gray-400 mt-0.5">尺码: {item.size}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-brand-500 font-bold">¥{item.price.toFixed(2)}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center"><Minus size={12} /></button>
                  <span className="text-sm w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center"><Plus size={12} /></button>
                </div>
                <button onClick={() => removeItem(item.productId, item.size)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-500">合计</span>
          <span className="text-2xl font-bold text-brand-500">¥{total.toFixed(2)}</span>
        </div>
        <Link href="/checkout"><Button size="lg" className="w-full">去结算</Button></Link>
      </div>
    </div>
  );
}
