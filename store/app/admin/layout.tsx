import Link from "next/link";
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut } from "lucide-react";

const nav = [
  { href: "/admin", label: "控制台", icon: LayoutDashboard },
  { href: "/admin/products", label: "商品管理", icon: Package },
  { href: "/admin/orders", label: "订单管理", icon: ShoppingBag },
  { href: "/admin/settings", label: "商店设置", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 shrink-0">
        <div className="px-5 py-4 border-b border-gray-100">
          <Link href="/admin" className="text-lg font-bold text-brand-500">未来星潮品汇</Link>
          <p className="text-xs text-gray-400 mt-0.5">管理后台</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <LogoutBtn />
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        {/* Mobile nav */}
        <div className="md:hidden border-b border-gray-200 bg-white px-4 py-2 flex items-center gap-3 overflow-x-auto">
          {nav.map(item => (
            <Link key={item.href} href={item.href} className="flex items-center gap-1.5 text-xs text-gray-600 whitespace-nowrap px-2 py-1 rounded hover:bg-gray-100">
              <item.icon size={14} />{item.label}
            </Link>
          ))}
        </div>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

function LogoutBtn() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button type="submit" className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
        <LogOut size={18} />退出登录
      </button>
    </form>
  );
}
