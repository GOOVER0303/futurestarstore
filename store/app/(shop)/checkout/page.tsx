"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/shop/CartContext";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"offline"|"online">("offline");
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-gray-400">购物车为空，无法结算</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !address) { toast.error("请填写完整收货信息"); return; }
    if (!/^1\d{10}$/.test(phone)) { toast.error("请输入正确的手机号"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name, customerPhone: phone, customerAddress: address,
          customerNote: note, paymentMethod: method,
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity, size: i.size })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        clearCart();
        toast.success("下单成功！");
        router.push(`/orders/${data.id}`);
      } else {
        const d = await res.json();
        toast.error(d.error || "下单失败");
      }
    } catch { toast.error("网络错误"); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">确认订单</h1>

      {/* Order summary */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <h2 className="font-medium mb-3">订单商品</h2>
        {items.map((item, i) => (
          <div key={`${item.productId}-${item.size}-${i}`} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
            <div className="flex-1 min-w-0">
              <span className="line-clamp-1">{item.title}</span>
              <span className="text-gray-400 ml-2">{item.size} &times; {item.quantity}</span>
            </div>
            <span className="ml-3 font-medium">¥{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 font-bold">
          <span>合计</span>
          <span className="text-brand-500 text-lg">¥{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Customer info */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">收件人 *</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="姓名" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">手机号 *</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} required type="tel" className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="11位手机号" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">收货地址 *</label>
          <textarea value={address} onChange={e => setAddress(e.target.value)} required rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="详细地址" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">备注（选填）</label>
          <input value={note} onChange={e => setNote(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="如颜色偏好、送货时间" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">支付方式</label>
          <div className="flex gap-3">
            <label className={`flex-1 flex items-center justify-center gap-2 rounded-lg border py-3 cursor-pointer text-sm ${method === "offline" ? "border-brand-500 bg-brand-50" : "border-gray-200"}`}>
              <input type="radio" name="method" checked={method === "offline"} onChange={() => setMethod("offline")} className="sr-only" />
              💵 线下付款
            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 rounded-lg border py-3 cursor-pointer text-sm ${method === "online" ? "border-brand-500 bg-brand-50" : "border-gray-200"}`}>
              <input type="radio" name="method" checked={method === "online"} onChange={() => setMethod("online")} className="sr-only" />
              💳 在线支付
            </label>
          </div>
          {method === "online" && (
            <p className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              在线支付功能需配置商户账号后开启。选择后将为您保留订单，后续可联系店主完成支付。
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "提交中..." : `确认下单 · ¥${total.toFixed(2)}`}
        </Button>
      </form>
    </div>
  );
}
