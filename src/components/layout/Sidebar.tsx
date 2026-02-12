import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  CreditCard, 
  Gift, 
  Ticket, 
  LayoutDashboard,
  Users,
  Settings,
  ChevronLeft
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'لوحة التحكم', href: '/', icon: LayoutDashboard },
  { name: 'إدارة الخطط', href: '/plans', icon: CreditCard },
  { name: 'الإضافات', href: '/addons', icon: Gift },
  { name: 'الكوبونات', href: '/coupons', icon: Ticket },
  { name: 'المستخدمين', href: '/users', icon: Users },
  { name: 'الإعدادات', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "fixed right-0 top-0 h-screen bg-card border-l border-border transition-all duration-300 z-40",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <h1 className="text-xl font-bold text-teal">مدير الاشتراكات</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <ChevronLeft className={cn(
            "w-5 h-5 text-muted-foreground transition-transform",
            collapsed && "rotate-180"
          )} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-card" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      {!collapsed && (
        <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
            <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center">
              <span className="text-teal-foreground font-semibold text-sm">م</span>
            </div>
            <div>
              <p className="font-medium text-sm text-foreground">مدير النظام</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
