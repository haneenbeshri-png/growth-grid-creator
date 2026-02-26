import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, MoreHorizontal, UserCog, Pencil, Ban, Archive, CreditCard, SlidersHorizontal, ShieldCheck, Clock, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export type UserStatus = 'active' | 'trial' | 'grace' | 'expired' | 'suspended' | 'paused' | 'cancelled' | 'pending' | 'invited';

interface AppUser {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  currentPlan: string;
  planIcon: string;
  status: UserStatus;
  expiryDate: Date;
  lastLogin: Date;
  hasDebt: boolean;
  debtAmount: number;
  graceExtendedAt?: Date;
  graceExtendedDays?: number;
  previousStatus?: UserStatus;
}

const userStatusConfig: Record<UserStatus, { label: string; className: string }> = {
  active: { label: 'نشط', className: 'bg-success/10 text-success border-success/20' },
  trial: { label: 'تجريبي', className: 'bg-info/10 text-info border-info/20' },
  grace: { label: 'مهلة', className: 'bg-warning/10 text-warning border-warning/20' },
  expired: { label: 'منتهي', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  suspended: { label: 'موقوف', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  paused: { label: 'متوقف', className: 'bg-muted text-muted-foreground border-muted' },
  cancelled: { label: 'ملغي', className: 'bg-archive/10 text-archive border-archive/20' },
  pending: { label: 'قيد الانتظار', className: 'bg-draft/10 text-draft border-draft/20' },
  invited: { label: 'مدعو - بانتظار التفعيل', className: 'bg-info/10 text-info border-info/20' },
};

const mockUsers: AppUser[] = [
  { id: 'USR-001', businessName: 'صالون الأناقة', ownerName: 'أحمد محمد', phone: '0501234567', email: 'ahmed@elegance.sa', currentPlan: 'الاحترافية سنوي', planIcon: '⭐', status: 'active', expiryDate: new Date('2026-06-15'), lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), hasDebt: false, debtAmount: 0 },
  { id: 'USR-002', businessName: 'مركز لمسة جمال', ownerName: 'سارة العلي', phone: '0559876543', email: 'sara@lamsa.sa', currentPlan: 'الأساسية شهري', planIcon: '📦', status: 'active', expiryDate: new Date('2026-03-01'), lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), hasDebt: true, debtAmount: 250 },
  { id: 'USR-003', businessName: 'باربر شوب', ownerName: 'خالد الحربي', phone: '0541112233', email: 'khalid@barber.sa', currentPlan: 'الأعمال شهري', planIcon: '🏢', status: 'trial', expiryDate: new Date('2026-02-28'), lastLogin: new Date(Date.now() - 30 * 60 * 1000), hasDebt: false, debtAmount: 0 },
  { id: 'USR-004', businessName: 'سبا الهدوء', ownerName: 'نورة السالم', phone: '0567778899', email: 'noura@spa.sa', currentPlan: 'الاحترافية شهري', planIcon: '⭐', status: 'grace', expiryDate: new Date('2026-02-10'), lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), hasDebt: true, debtAmount: 500, graceExtendedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), graceExtendedDays: 7 },
  { id: 'USR-005', businessName: 'صالون الورد', ownerName: 'فاطمة العمري', phone: '0533334444', email: 'fatma@ward.sa', currentPlan: 'الأساسية شهري', planIcon: '📦', status: 'expired', expiryDate: new Date('2026-01-15'), lastLogin: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), hasDebt: true, debtAmount: 99 },
  { id: 'USR-006', businessName: 'ستايل بلس', ownerName: 'عمر الشهري', phone: '0522225555', email: 'omar@style.sa', currentPlan: 'الاحترافية سنوي', planIcon: '⭐', status: 'suspended', expiryDate: new Date('2026-08-20'), lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), hasDebt: true, debtAmount: 1500 },
  { id: 'USR-007', businessName: 'صالون الأمل', ownerName: 'ريم الدوسري', phone: '0588889999', email: 'reem@amal.sa', currentPlan: 'الأعمال سنوي', planIcon: '🏢', status: 'active', expiryDate: new Date('2027-01-10'), lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000), hasDebt: false, debtAmount: 0 },
  { id: 'USR-008', businessName: 'مركز التألق', ownerName: 'منصور القحطاني', phone: '0511116666', email: 'mansour@glow.sa', currentPlan: 'الأساسية شهري', planIcon: '📦', status: 'paused', expiryDate: new Date('2026-04-05'), lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), hasDebt: false, debtAmount: 0 },
  { id: 'USR-009', businessName: 'بيوتي لاين', ownerName: 'هند المطيري', phone: '0544447777', email: 'hind@beauty.sa', currentPlan: 'الاحترافية شهري', planIcon: '⭐', status: 'cancelled', expiryDate: new Date('2025-12-31'), lastLogin: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), hasDebt: false, debtAmount: 0 },
  { id: 'USR-010', businessName: 'كلاسيك سبا', ownerName: 'يوسف الغامدي', phone: '0577778888', email: 'yousef@classic.sa', currentPlan: 'الأعمال شهري', planIcon: '🏢', status: 'pending', expiryDate: new Date('2026-02-20'), lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000), hasDebt: false, debtAmount: 0 },
];

function getTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `منذ ${days} يوم`;
  return `منذ ${Math.floor(days / 30)} شهر`;
}

function getDaysLeft(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

type StatusFilterType = 'all' | UserStatus;
type DebtFilter = 'all' | 'with_debt' | 'no_debt';
type PlanFilter = 'all' | 'basic' | 'pro' | 'business';

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AppUser[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [debtFilter, setDebtFilter] = useState<DebtFilter>('all');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [suspendUser, setSuspendUser] = useState<AppUser | null>(null);
  const [archiveUser, setArchiveUser] = useState<AppUser | null>(null);
  const [editUser, setEditUser] = useState<AppUser | null>(null);
  const [editForm, setEditForm] = useState({ businessName: '', ownerName: '', phone: '', email: '' });

  const filteredUsers = useMemo(() => {
    let result = [...users];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u =>
        u.businessName.includes(q) || u.ownerName.includes(q) ||
        u.phone.includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter(u => u.status === statusFilter);
    if (debtFilter === 'with_debt') result = result.filter(u => u.hasDebt);
    if (debtFilter === 'no_debt') result = result.filter(u => !u.hasDebt);
    if (planFilter !== 'all') {
      result = result.filter(u => {
        if (planFilter === 'basic') return u.currentPlan.includes('الأساسية');
        if (planFilter === 'pro') return u.currentPlan.includes('الاحترافية');
        if (planFilter === 'business') return u.currentPlan.includes('الأعمال');
        return true;
      });
    }
    return result;
  }, [users, searchQuery, statusFilter, debtFilter, planFilter]);

  const confirmSuspend = () => {
    if (suspendUser) {
      setUsers(users.map(u => u.id === suspendUser.id ? { ...u, status: 'suspended' as UserStatus, previousStatus: u.status } : u));
      toast.success(`تم إيقاف حساب ${suspendUser.businessName}`);
      setSuspendUser(null);
    }
  };

  const handleUnsuspend = (user: AppUser) => {
    const restoreStatus = user.previousStatus || 'active';
    setUsers(users.map(u => u.id === user.id ? { ...u, status: restoreStatus as UserStatus, previousStatus: undefined } : u));
    toast.success(`تم إعادة تفعيل حساب ${user.businessName}`);
  };

  const confirmArchive = () => {
    if (archiveUser) {
      setUsers(users.filter(u => u.id !== archiveUser.id));
      toast.success(`تم أرشفة حساب ${archiveUser.businessName}`);
      setArchiveUser(null);
    }
  };

  const openEditUser = (user: AppUser) => {
    setEditForm({ businessName: user.businessName, ownerName: user.ownerName, phone: user.phone, email: user.email });
    setEditUser(user);
  };

  const saveEditUser = () => {
    if (!editForm.businessName.trim() || !editForm.ownerName.trim() || !editForm.phone.trim() || !editForm.email.trim()) {
      toast.error('يرجى تعبئة جميع الحقول');
      return;
    }
    if (editUser) {
      setUsers(users.map(u => u.id === editUser.id ? { ...u, ...editForm } : u));
      toast.success(`تم تحديث بيانات ${editForm.businessName}`);
      setEditUser(null);
    }
  };

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">إدارة المستخدمين</h1>
            <p className="text-muted-foreground">عرض وإدارة جميع حسابات العملاء</p>
          </div>
          <Button className="gap-2" onClick={() => navigate('/users/invite')}>
            <UserPlus className="w-4 h-4" />
            دعوة مستخدم جديد
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="البحث بالاسم التجاري، المالك، الهاتف، البريد أو الرقم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(v: StatusFilterType) => setStatusFilter(v)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="trial">تجريبي</SelectItem>
                <SelectItem value="grace">مهلة</SelectItem>
                <SelectItem value="expired">منتهي</SelectItem>
                <SelectItem value="suspended">موقوف</SelectItem>
                <SelectItem value="paused">متوقف</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="invited">مدعو</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={debtFilter} onValueChange={(v: DebtFilter) => setDebtFilter(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="المديونية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="with_debt">عليه مبالغ</SelectItem>
              <SelectItem value="no_debt">بدون مبالغ</SelectItem>
            </SelectContent>
          </Select>
          <Select value={planFilter} onValueChange={(v: PlanFilter) => setPlanFilter(v)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="نوع الباقة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الباقات</SelectItem>
              <SelectItem value="basic">الأساسية</SelectItem>
              <SelectItem value="pro">الاحترافية</SelectItem>
              <SelectItem value="business">الأعمال</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right font-semibold">الرقم</TableHead>
                <TableHead className="text-right font-semibold">النشاط التجاري</TableHead>
                <TableHead className="text-right font-semibold">المالك</TableHead>
                <TableHead className="text-right font-semibold">الباقة الحالية</TableHead>
                <TableHead className="text-right font-semibold">الحالة</TableHead>
                <TableHead className="text-right font-semibold">تاريخ الانتهاء</TableHead>
                <TableHead className="text-right font-semibold">آخر دخول</TableHead>
                <TableHead className="text-right font-semibold">المديونية</TableHead>
                <TableHead className="text-right font-semibold">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const daysLeft = getDaysLeft(user.expiryDate);
                return (
                  <TableRow key={user.id} className="hover:bg-accent/30 transition-colors">
                    <TableCell>
                      <span className="font-mono text-sm text-muted-foreground">{user.id}</span>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-foreground">{user.businessName}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{user.ownerName}</p>
                        <p className="text-xs text-muted-foreground" dir="ltr">{user.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{user.planIcon}</span>
                        <span className="text-sm font-medium">{user.currentPlan}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${userStatusConfig[user.status].className}`}>
                          {userStatusConfig[user.status].label}
                        </span>
                        {user.status === 'grace' && user.graceExtendedAt && user.graceExtendedDays && (
                          <div className="mt-1.5 text-xs text-warning space-y-0.5">
                            <p className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              مهلة {user.graceExtendedDays} يوم
                            </p>
                            <p className="text-muted-foreground">
                              أُضيفت {format(user.graceExtendedAt, 'dd/MM/yyyy')}
                            </p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {format(user.expiryDate, 'dd/MM/yyyy')}
                        </p>
                        {daysLeft > 0 && daysLeft <= 30 && (
                          <p className="text-xs text-warning font-medium">متبقي {daysLeft} يوم</p>
                        )}
                        {daysLeft <= 0 && (
                          <p className="text-xs text-destructive font-medium">منتهي</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{getTimeAgo(user.lastLogin)}</span>
                    </TableCell>
                    <TableCell>
                      {user.hasDebt ? (
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
                          <span className="text-sm font-semibold text-destructive">{user.debtAmount} ريال</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border border-border shadow-lg z-50">
                          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate(`/users/${user.id}`)}>
                            <UserCog className="w-4 h-4" />
                            عرض الملف الشخصي
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEditUser(user)}>
                            <Pencil className="w-4 h-4" />
                            تعديل البيانات
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status !== 'suspended' && (
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-warning"
                              onClick={() => setSuspendUser(user)}
                            >
                              <Ban className="w-4 h-4" />
                              إيقاف الحساب
                            </DropdownMenuItem>
                          )}
                          {user.status === 'suspended' && (
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-success"
                              onClick={() => handleUnsuspend(user)}
                            >
                              <ShieldCheck className="w-4 h-4" />
                              التراجع عن الإيقاف
                            </DropdownMenuItem>
                          )}
                          {(user.status === 'expired' || user.status === 'cancelled') && (
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-destructive"
                              onClick={() => setArchiveUser(user)}
                            >
                              <Archive className="w-4 h-4" />
                              أرشفة الحساب
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              لا يوجد مستخدمون مطابقون للبحث
            </div>
          )}
        </div>

        {/* Suspend Dialog */}
        <AlertDialog open={!!suspendUser} onOpenChange={(open) => !open && setSuspendUser(null)}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                <Ban className="w-6 h-6 text-warning" />
              </div>
              <AlertDialogTitle className="text-center">إيقاف الحساب؟</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                سيتم إيقاف حساب "{suspendUser?.businessName}" فوراً ولن يتمكن المالك من الوصول للنظام.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSuspend} className="bg-warning text-warning-foreground hover:bg-warning/90">
                تأكيد الإيقاف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Archive Dialog */}
        <AlertDialog open={!!archiveUser} onOpenChange={(open) => !open && setArchiveUser(null)}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Archive className="w-6 h-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-center">أرشفة الحساب؟</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                سيتم حذف حساب "{archiveUser?.businessName}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={confirmArchive} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                تأكيد الأرشفة
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit User Dialog */}
        <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Pencil className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-center">تعديل بيانات المستخدم</DialogTitle>
              <DialogDescription className="text-center">
                تعديل البيانات الأساسية لحساب <strong className="text-foreground">{editUser?.businessName}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-business">الاسم التجاري</Label>
                <Input id="edit-business" value={editForm.businessName} onChange={e => setEditForm(f => ({ ...f, businessName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-owner">اسم المالك</Label>
                <Input id="edit-owner" value={editForm.ownerName} onChange={e => setEditForm(f => ({ ...f, ownerName: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                  <Input id="edit-email" type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">رقم الهاتف</Label>
                  <Input id="edit-phone" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} dir="ltr" />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setEditUser(null)}>إلغاء</Button>
              <Button onClick={saveEditUser}>حفظ التعديلات</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
