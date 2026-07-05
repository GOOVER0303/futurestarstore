"use client";
import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

function ShopHomeInner() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState("");

  const catSlug = searchParams.get("category");
  const limit = 12;

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => {
      setCats(d);
      if (catSlug) {
        const found = d.find((c: any) => c.slug === catSlug);
        if (found) setActiveCat(found.id);
      } else {
        setActiveCat("");
      }
    });
  }, [catSlug]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (activeCat) params.set("category", activeCat);
    fetch(`/api/products?${params}`).then(r => r.json()).then(d => {
      setItems(d.items); setTotal(d.total); setLoading(false);
    });
  }, [page, activeCat]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">未来星潮品汇</h1>
        <p className="mt-2 text-gray-500">精选潮流服饰，为你的衣橱注入新灵感</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        <button onClick={() => { setActiveCat(""); setPage(1); }}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm ${!activeCat ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-600"}`}>
          全部
        </button>
        {cats.map(c => (
          <button key={c.id} onClick={() => { setActiveCat(c.id); setPage(1); }}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm ${activeCat === c.id ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-600"}`}>
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({length:8}).map((_,i) => <div key={i} className="animate-pulse bg-gray-100 rounded-xl aspect-[3/4]" />)}
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-400 text-center py-20">暂无商品</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(p => (
              <Link key={p.id} href={`/products/${p.id}`} className="group">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">暂无图片</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2">{p.title}</h3>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-brand-500 font-bold">¥{p.price.toFixed(2)}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(p.sizes as string[]).map(s => (
                        <span key={s} className={`text-xs px-1.5 py-0.5 rounded ${(p.stock as Record<string,number>)[s] > 0 ? "bg-gray-100 text-gray-600" : "bg-gray-50 text-gray-300 line-through"}`}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={18} /></button>
              <span className="text-sm text-gray-500">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={18} /></button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ShopHomePage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-gray-400">加载中...</div>
    }>
      <ShopHomeInner />
    </Suspense>
  );
}
