import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowRight, Mail, Phone, KeyRound, Calendar, DollarSign, Clock,
  Building2, Users, MessageSquare, Pencil, Copy, Check,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { type UserStatus } from './UsersPage';

const userStatusConfig: Record<UserStatus, { label: string; className: string }> = {
  active: { label: 'نشط', className: 'bg-success/10 text-success border-success/20' },
  trial: { label: 'تجريبي', className: 'bg-info/10 text-info border-info/20' },
  grace: { label: 'مهلة', className: 'bg-warning/10 text-warning border-warning/20' },
  expired: { label: 'منتهي', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  suspended: { label: 'موقوف', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  paused: { label: 'متوقف', className: 'bg-muted text-muted-foreground border-muted' },
  cancelled: { label: 'ملغي', className: 'bg-archive/10 text-archive border-archive/20' },
  pending: { label: 'قيد الانتظار', className: 'bg-draft/10 text-draft border-draft/20' },
};

interface UserProfile {
  id: string;
  businessName: string;
  businessLogo: string;
  ownerName: string;
  phone: string;
  email: string;
  status: UserStatus;
  customerSince: Date;
  lastActive: Date;
  totalRevenue: number;
  currentPlan: string;
  basePrice: string;
  renewalDate: Date;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  addons: { name: string; quantity: number; dateAdded: Date; status: 'active' | 'expired' }[];
  usage: {
    branches: { used: number; total: number };
    staff: { used: number; total: number };
    smsCredits: number;
  };
}

const mockProfiles: Record<string, UserProfile> = {
  'USR-001': {
    id: 'USR-001', businessName: 'صالون الأناقة', businessLogo: '💈', ownerName: 'أحمد محمد',
    phone: '0501234567', email: 'ahmed@elegance.sa', status: 'active',
    customerSince: new Date('2023-06-01'), lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    totalRevenue: 24000, currentPlan: 'الاحترافية - 5 فروع', basePrice: '10,000 ريال / سنة',
    renewalDate: new Date('2026-06-15'), paymentStatus: 'paid',
    addons: [
      { name: 'فرع إضافي', quantity: 2, dateAdded: new Date('2024-03-10'), status: 'active' },
      { name: 'رصيد SMS إضافي (500)', quantity: 1, dateAdded: new Date('2025-01-05'), status: 'active' },
      { name: 'تقارير متقدمة', quantity: 1, dateAdded: new Date('2024-08-20'), status: 'active' },
    ],
    usage: { branches: { used: 3, total: 7 }, staff: { used: 12, total: 15 }, smsCredits: 320 },
  },
  'USR-002': {
    id: 'USR-002', businessName: 'مركز لمسة جمال', businessLogo: '💅', ownerName: 'سارة العلي',
    phone: '0559876543', email: 'sara@lamsa.sa', status: 'active',
    customerSince: new Date('2024-01-15'), lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
    totalRevenue: 3600, currentPlan: 'الأساسية - 2 فرع', basePrice: '250 ريال / شهر',
    renewalDate: new Date('2026-03-01'), paymentStatus: 'pending',
    addons: [
      { name: 'موظف إضافي', quantity: 3, dateAdded: new Date('2024-06-01'), status: 'active' },
    ],
    usage: { branches: { used: 2, total: 2 }, staff: { used: 8, total: 10 }, smsCredits: 45 },
  },
  'USR-003': {
    id: 'USR-003', businessName: 'باربر شوب', businessLogo: '✂️', ownerName: 'خالد الحربي',
    phone: '0541112233', email: 'khalid@barber.sa', status: 'trial',
    customerSince: new Date('2026-02-01'), lastActive: new Date(Date.now() - 30 * 60 * 1000),
    totalRevenue: 0, currentPlan: 'الأعمال - 10 فروع', basePrice: '20,000 ريال / سنة',
    renewalDate: new Date('2026-02-28'), paymentStatus: 'pending',
    addons: [],
    usage: { branches: { used: 1, total: 10 }, staff: { used: 3, total: 25 }, smsCredits: 500 },
  },
};

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

const paymentStatusMap = {
  paid: { label: 'مدفوع', className: 'bg-success/10 text-success border-success/20' },
  pending: { label: 'قيد الانتظار', className: 'bg-warning/10 text-warning border-warning/20' },
  overdue: { label: 'متأخر', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let pass = '';
  for (let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => mockProfiles[id || ''] || mockProfiles['USR-001']);

  // Reset password dialog
  const [resetOpen, setResetOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [passwordCopied, setPasswordCopied] = useState(false);

  // Edit profile dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    businessName: profile.businessName,
    ownerName: profile.ownerName,
    phone: profile.phone,
    email: profile.email,
  });

  const branchPercent = (profile.usage.branches.used / profile.usage.branches.total) * 100;
  const staffPercent = (profile.usage.staff.used / profile.usage.staff.total) * 100;

  const handleResetPassword = () => {
    const newPass = generateTempPassword();
    setTempPassword(newPass);
    setPasswordCopied(false);
    setResetOpen(true);
  };

  const confirmResetPassword = () => {
    toast.success(`تم إعادة تعيين كلمة المرور لـ ${profile.businessName}`);
    setResetOpen(false);
    setTempPassword('');
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setPasswordCopied(true);
    toast.success('تم نسخ كلمة المرور');
  };

  const handleEditSave = () => {
    if (!editForm.businessName.trim() || !editForm.ownerName.trim() || !editForm.phone.trim() || !editForm.email.trim()) {
      toast.error('يرجى تعبئة جميع الحقول');
      return;
    }
    setProfile(prev => ({
      ...prev,
      businessName: editForm.businessName,
      ownerName: editForm.ownerName,
      phone: editForm.phone,
      email: editForm.email,
    }));
    toast.success('تم تحديث بيانات المستخدم بنجاح');
    setEditOpen(false);
  };

  const openEdit = () => {
    setEditForm({
      businessName: profile.businessName,
      ownerName: profile.ownerName,
      phone: profile.phone,
      email: profile.email,
    });
    setEditOpen(true);
  };

  return (
    <MainLayout>
      <div className="p-6 md:p-8 space-y-6">
        {/* Back */}
        <Button variant="ghost" onClick={() => navigate('/users')} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowRight className="w-4 h-4" />
          العودة لقائمة المستخدمين
        </Button>

        {/* Header Card */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-16 h-16 rounded-xl bg-accent-teal/10 flex items-center justify-center text-3xl shrink-0">
              {profile.businessLogo}
            </div>
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{profile.businessName}</h1>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${userStatusConfig[profile.status].className}`}>
                  {userStatusConfig[profile.status].label}
                </span>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7 mr-auto" onClick={openEdit}>
                  <Pencil className="w-3.5 h-3.5" />
                  تعديل البيانات
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  عميل منذ {format(profile.customerSince, 'dd MMM yyyy', { locale: ar })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  آخر نشاط: {getTimeAgo(profile.lastActive)}
                </span>
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  إجمالي الإيرادات: <strong className="text-foreground">{profile.totalRevenue.toLocaleString()} ريال</strong>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="w-4 h-4" /> {profile.email}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground" dir="ltr">
                  <Phone className="w-4 h-4" /> {profile.phone}
                </span>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7" onClick={handleResetPassword}>
                  <KeyRound className="w-3.5 h-3.5" />
                  إعادة تعيين كلمة المرور
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">الاشتراك</h2>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">تفاصيل الباقة الحالية</h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">الباقة الحالية</span>
                  <span className="font-semibold text-foreground">{profile.currentPlan}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">السعر الأساسي</span>
                  <span className="font-semibold text-foreground">{profile.basePrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">تاريخ التجديد</span>
                  <span className="font-semibold text-foreground">{format(profile.renewalDate, 'dd/MM/yyyy')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">حالة الدفع</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${paymentStatusMap[profile.paymentStatus].className}`}>
                    {paymentStatusMap[profile.paymentStatus].label}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">الإضافات النشطة</h3>
              {profile.addons.length > 0 ? (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-right text-xs font-semibold">الإضافة</TableHead>
                        <TableHead className="text-right text-xs font-semibold">الكمية</TableHead>
                        <TableHead className="text-right text-xs font-semibold">تاريخ الإضافة</TableHead>
                        <TableHead className="text-right text-xs font-semibold">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profile.addons.map((addon, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-sm font-medium">{addon.name}</TableCell>
                          <TableCell className="text-sm">{addon.quantity}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{format(addon.dateAdded, 'dd/MM/yyyy')}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${addon.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-muted'}`}>
                              {addon.status === 'active' ? 'نشط' : 'منتهي'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-6 text-center text-sm text-muted-foreground">
                  لا توجد إضافات نشطة
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Usage Overview */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">نظرة عامة على الاستخدام</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3 bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent-teal/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-accent-teal" />
                </div>
                <span className="text-sm font-semibold text-foreground">الفروع</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-foreground">{profile.usage.branches.used}</span>
                <span className="text-sm text-muted-foreground">من {profile.usage.branches.total}</span>
              </div>
              <Progress value={branchPercent} className="h-2.5" />
              <p className="text-xs text-muted-foreground">
                {branchPercent >= 90 ? '⚠️ قريب من الحد الأقصى' : `${profile.usage.branches.total - profile.usage.branches.used} فروع متاحة`}
              </p>
            </div>

            <div className="space-y-3 bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">مقدمي الخدمة</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-foreground">{profile.usage.staff.used}</span>
                <span className="text-sm text-muted-foreground">من {profile.usage.staff.total}</span>
              </div>
              <Progress value={staffPercent} className="h-2.5" />
              <p className="text-xs text-muted-foreground">
                {staffPercent >= 90 ? '⚠️ قريب من الحد الأقصى' : `${profile.usage.staff.total - profile.usage.staff.used} مقاعد متاحة`}
              </p>
            </div>

            <div className="space-y-3 bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent-warm/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-accent-warm" />
                </div>
                <span className="text-sm font-semibold text-foreground">رصيد SMS</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-foreground">{profile.usage.smsCredits}</span>
                <span className="text-sm text-muted-foreground">رسالة متبقية</span>
              </div>
              <Progress value={Math.min((profile.usage.smsCredits / 500) * 100, 100)} className="h-2.5" />
              <p className="text-xs text-muted-foreground">
                {profile.usage.smsCredits < 50 ? '⚠️ الرصيد منخفض' : 'الرصيد كافٍ'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
              <KeyRound className="w-6 h-6 text-warning" />
            </div>
            <DialogTitle className="text-center">إعادة تعيين كلمة المرور</DialogTitle>
            <DialogDescription className="text-center">
              سيتم إنشاء كلمة مرور مؤقتة لحساب <strong className="text-foreground">{profile.businessName}</strong>. يجب مشاركتها مع المالك ليتمكن من تسجيل الدخول وتغييرها.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">المالك</Label>
              <p className="text-sm font-medium text-foreground">{profile.ownerName} — {profile.email}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">كلمة المرور المؤقتة</Label>
              <div className="flex items-center gap-2">
                <Input value={tempPassword} readOnly className="font-mono text-base tracking-wider" dir="ltr" />
                <Button variant="outline" size="icon" className="shrink-0" onClick={copyPassword}>
                  {passwordCopied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">سيُطلب من المستخدم تغيير كلمة المرور عند تسجيل الدخول القادم.</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setResetOpen(false)}>إلغاء</Button>
            <Button onClick={confirmResetPassword} className="bg-warning text-warning-foreground hover:bg-warning/90">
              تأكيد إعادة التعيين
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Pencil className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-center">تعديل بيانات المستخدم</DialogTitle>
            <DialogDescription className="text-center">
              تعديل البيانات الأساسية لحساب <strong className="text-foreground">{profile.businessName}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-business">الاسم التجاري</Label>
              <Input
                id="edit-business"
                value={editForm.businessName}
                onChange={e => setEditForm(f => ({ ...f, businessName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-owner">اسم المالك</Label>
              <Input
                id="edit-owner"
                value={editForm.ownerName}
                onChange={e => setEditForm(f => ({ ...f, ownerName: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">رقم الهاتف</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditOpen(false)}>إلغاء</Button>
            <Button onClick={handleEditSave}>حفظ التعديلات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
