"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function OrderConfirmPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`).then(r => r.json()).then(setOrder);
  }, [params.id]);

  if (!order) return (
    <div className="max-w-lg mx-auto px-4 py-20">
      <div className="animate-pulse space-y-3">
        <div className="h-6 bg-gray-100 rounded w-1/2" />
        <div className="h-20 bg-gray-100 rounded" />
      </div>
    </div>
  );

  const statusMap: Record<string,string> = { new: "待处理", confirmed: "已确认", shipped: "已发货", completed: "已完成", cancelled: "已取消" };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 text-center">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">下单成功！</h1>
        <p className="text-gray-500 text-sm mb-6">感谢你的购买，我们会尽快处理你的订单</p>

        <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">订单号</span><span className="font-mono font-medium">{order.orderNum}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">订单状态</span><span className="font-medium text-brand-500">{statusMap[order.orderStatus]}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">支付方式</span><span>{order.paymentMethod === "online" ? "在线支付" : "线下付款"}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">合计金额</span><span className="font-bold text-brand-500">¥{order.totalAmount.toFixed(2)}</span></div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-left">
          <p><span className="text-gray-400">收件人：</span>{order.customerName}</p>
          <p><span className="text-gray-400">电话：</span>{order.customerPhone}</p>
          <p><span className="text-gray-400">地址：</span>{order.customerAddress}</p>
          {order.customerNote && <p><span className="text-gray-400">备注：</span>{order.customerNote}</p>}
        </div>

        {order.items && (
          <div className="mt-4 text-left">
            <p className="text-sm text-gray-400 mb-2">商品明细</p>
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                <span>{item.productTitle} × {item.quantity}</span>
                <span className="text-gray-500">{item.size}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Link href="/" className="flex-1"><Button variant="secondary" className="w-full">继续选购</Button></Link>
        </div>
      </div>
    </div>
  );
}
