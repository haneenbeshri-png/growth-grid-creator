import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CouponTable } from '@/components/coupons/CouponTable';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { coupons as initialCoupons } from '@/data/mockData';
import { Coupon } from '@/types/subscription';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Power, PowerOff } from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'highest_discount' | 'expiry';
type StatusFilter = 'all' | 'active' | 'disabled' | 'expired';

export default function CouponsPage() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [deleteCoupon, setDeleteCoupon] = useState<Coupon | null>(null);
  const [toggleCoupon, setToggleCoupon] = useState<Coupon | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const filteredCoupons = useMemo(() => {
    let result = [...coupons];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.code.toLowerCase().includes(q) ||
        c.internalName.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'highest_discount':
        result.sort((a, b) => b.discountValue - a.discountValue);
        break;
      case 'expiry':
        result.sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
        break;
    }

    return result;
  }, [coupons, searchQuery, statusFilter, sortBy]);

  const handleEdit = (coupon: Coupon) => {
    navigate(`/coupons/${coupon.id}/edit`);
  };

  const handleToggle = (coupon: Coupon) => {
    setToggleCoupon(coupon);
  };

  const confirmToggle = () => {
    if (toggleCoupon) {
      setCoupons(coupons.map(c => {
        if (c.id === toggleCoupon.id) {
          const newStatus = c.status === 'active' ? 'disabled' : 'active';
          return { ...c, status: newStatus as 'active' | 'disabled' };
        }
        return c;
      }));
      toast.success(
        toggleCoupon.status === 'active' 
          ? 'تم تعطيل الكوبون' 
          : 'تم تفعيل الكوبون'
      );
      setToggleCoupon(null);
    }
  };

  const handleDelete = (coupon: Coupon) => {
    setDeleteCoupon(coupon);
  };

  const confirmDelete = () => {
    if (deleteCoupon) {
      setCoupons(coupons.filter(c => c.id !== deleteCoupon.id));
      toast.success('تم حذف الكوبون بنجاح');
      setDeleteCoupon(null);
    }
  };

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">إدارة الكوبونات</h1>
            <p className="text-muted-foreground">إنشاء وتتبع أكواد الخصم</p>
          </div>
          <Button 
            onClick={() => navigate('/coupons/new')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            إنشاء كوبون جديد
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">الكوبونات النشطة</p>
            <p className="text-2xl font-bold text-success">
              {coupons.filter(c => c.status === 'active').length}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">إجمالي الاستخدامات</p>
            <p className="text-2xl font-bold text-foreground">
              {coupons.reduce((acc, c) => acc + c.usageCount, 0)}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">تأثير الإيرادات</p>
            <p className="text-2xl font-bold text-destructive">
              -{coupons.reduce((acc, c) => acc + c.revenueImpact, 0).toLocaleString()} ريال
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">المنتهية</p>
            <p className="text-2xl font-bold text-archive">
              {coupons.filter(c => c.status === 'expired').length}
            </p>
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="البحث بالكود أو الاسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(v: StatusFilter) => setStatusFilter(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="disabled">معطل</SelectItem>
                <SelectItem value="expired">منتهي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={sortBy} onValueChange={(v: SortOption) => setSortBy(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="ترتيب حسب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">الأحدث</SelectItem>
              <SelectItem value="oldest">الأقدم</SelectItem>
              <SelectItem value="highest_discount">أعلى خصم</SelectItem>
              <SelectItem value="expiry">تاريخ الانتهاء</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <CouponTable
          coupons={filteredCoupons}
          onEdit={handleEdit}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />

        {filteredCoupons.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            لا توجد كوبونات مطابقة للبحث
          </div>
        )}

        {/* Delete Dialog */}
        <DeleteConfirmDialog
          title="حذف الكوبون"
          description="هل أنت متأكد من حذف هذا الكوبون؟ هذا الإجراء لا يمكن التراجع عنه."
          open={!!deleteCoupon}
          onOpenChange={(open) => !open && setDeleteCoupon(null)}
          onConfirm={confirmDelete}
        />

        {/* Toggle Dialog */}
        <AlertDialog open={!!toggleCoupon} onOpenChange={(open) => !open && setToggleCoupon(null)}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                {toggleCoupon?.status === 'active' ? (
                  <PowerOff className="w-6 h-6 text-warning" />
                ) : (
                  <Power className="w-6 h-6 text-success" />
                )}
              </div>
              <AlertDialogTitle className="text-center">
                {toggleCoupon?.status === 'active' ? 'إيقاف الحملة؟' : 'تفعيل الحملة؟'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                {toggleCoupon?.status === 'active'
                  ? 'سيتم تعطيل هذا الكوبون ولن يتمكن المستخدمون من استخدامه.'
                  : 'سيتم تفعيل هذا الكوبون وسيتمكن المستخدمون من استخدامه مرة أخرى.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={confirmToggle}>
                تأكيد
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
