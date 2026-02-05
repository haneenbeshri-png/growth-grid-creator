import { MainLayout } from '@/components/layout/MainLayout';
import { plans, addOns, coupons } from '@/data/mockData';
import { 
  CreditCard, 
  Users, 
  TrendingUp, 
  Gift,
  Ticket,
  ArrowUpLeft
} from 'lucide-react';

const stats = [
  {
    title: 'إجمالي المشتركين',
    value: plans.reduce((acc, p) => acc + p.activeSubscribers, 0),
    icon: Users,
    change: '+12%',
    changeType: 'positive' as const,
  },
  {
    title: 'الباقات النشطة',
    value: plans.filter(p => p.status === 'active').length,
    icon: CreditCard,
    change: `من ${plans.length}`,
    changeType: 'neutral' as const,
  },
  {
    title: 'الإضافات المتاحة',
    value: addOns.filter(a => a.status === 'active').length,
    icon: Gift,
    change: 'متاح للبيع',
    changeType: 'neutral' as const,
  },
  {
    title: 'الكوبونات النشطة',
    value: coupons.filter(c => c.status === 'active').length,
    icon: Ticket,
    change: `${coupons.reduce((acc, c) => acc + c.usageCount, 0)} استخدام`,
    changeType: 'neutral' as const,
  },
];

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">مرحباً بك 👋</h1>
          <p className="text-muted-foreground">نظرة عامة على إدارة الاشتراكات</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.title}
              className="bg-card rounded-xl border border-border p-6 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-teal" />
                </div>
                {stat.changeType === 'positive' && (
                  <div className="flex items-center gap-1 text-success text-sm">
                    <ArrowUpLeft className="w-4 h-4" />
                    {stat.change}
                  </div>
                )}
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              {stat.changeType === 'neutral' && (
                <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
              )}
            </div>
          ))}
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-foreground mb-4">أحدث النشاطات</h2>
            <div className="space-y-4">
              {[
                { action: 'اشتراك جديد', plan: 'الباقة الاحترافية', time: 'منذ 5 دقائق' },
                { action: 'تجديد اشتراك', plan: 'الباقة الأساسية', time: 'منذ 15 دقيقة' },
                { action: 'ترقية باقة', plan: 'باقة الأعمال', time: 'منذ ساعة' },
                { action: 'استخدام كوبون', plan: 'SAUDI96', time: 'منذ ساعتين' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.plan}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-foreground mb-4">ملخص الإيرادات</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                <span className="text-muted-foreground">إيرادات الشهر الحالي</span>
                <span className="text-xl font-bold text-teal">45,320 ريال</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                <span className="text-muted-foreground">الخصومات المطبقة</span>
                <span className="text-xl font-bold text-destructive">-{coupons.reduce((acc, c) => acc + c.revenueImpact, 0).toLocaleString()} ريال</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-teal/10 rounded-lg">
                <span className="text-foreground font-medium">صافي الإيرادات</span>
                <span className="text-xl font-bold text-teal">
                  {(45320 - coupons.reduce((acc, c) => acc + c.revenueImpact, 0)).toLocaleString()} ريال
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
