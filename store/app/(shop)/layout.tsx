"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingCart, Menu } from "lucide-react";
import { CartProvider, useCart } from "@/components/shop/CartContext";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <ShopInner>{children}</ShopInner>
    </CartProvider>
  );
}

function ShopInner({ children }: { children: React.ReactNode }) {
  const { itemCount } = useCart();
  const [cats, setCats] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCats);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-brand-500 tracking-tight">未来星潮品汇</Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-600 hover:text-brand-500">全部</Link>
            {cats.map(c => <Link key={c.id} href={`/?category=${c.slug}`} className="text-sm text-gray-600 hover:text-brand-500">{c.name}</Link>)}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/cart" className="relative p-1.5 text-gray-600 hover:text-brand-500">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
            <button className="md:hidden p-1.5" onClick={() => setMenuOpen(!menuOpen)}><Menu size={22} /></button>
          </div>
        </div>

        {/* Mobile category nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-2">
            <Link href="/" onClick={()=>setMenuOpen(false)} className="block py-2 text-sm text-gray-600">全部商品</Link>
            {cats.map(c => (
              <Link key={c.id} href={`/?category=${c.slug}`} onClick={()=>setMenuOpen(false)}
                className="block py-2 text-sm text-gray-600">{c.name}</Link>
            ))}
          </div>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} 未来星潮品汇 — 精选潮流服饰
      </footer>
    </div>
  );
}
