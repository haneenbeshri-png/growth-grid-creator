import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ArrowRight, Mail, Phone, KeyRound, Calendar, DollarSign, Clock,
  Building2, Users, MessageSquare, Pencil, Copy, Check, ChevronDown,
  Pause, Play, Zap, Gift, MapPin, ShieldCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { type UserStatus } from './UsersPage';
import { addOns as availableAddOns } from '@/data/mockData';

// --- Types & Config ---

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

interface Branch {
  name: string;
  city: string;
  phone: string;
  staffCount: number;
  status: 'active' | 'inactive';
}

interface UserAddon {
  name: string;
  quantity: number;
  dateAdded: Date;
  status: 'active' | 'expired';
}

interface UserProfile {
  id: string;
  businessName: string;
  businessLogo: string;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  status: UserStatus;
  customerSince: Date;
  lastActive: Date;
  totalRevenue: number;
  currentPlan: string;
  basePrice: string;
  renewalDate: Date;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  addons: UserAddon[];
  branches: Branch[];
  usage: {
    branches: { used: number; total: number };
    staff: { used: number; total: number };
    smsCredits: number;
  };
  pausedAt?: Date;
  graceExtendedAt?: Date;
  graceExtendedDays?: number;
  graceExtendedNote?: string;
}

const mockProfiles: Record<string, UserProfile> = {
  'USR-001': {
    id: 'USR-001', businessName: 'صالون الأناقة', businessLogo: '💈', ownerName: 'أحمد محمد',
    phone: '0501234567', email: 'ahmed@elegance.sa', city: 'الرياض', status: 'active',
    customerSince: new Date('2023-06-01'), lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    totalRevenue: 24000, currentPlan: 'الاحترافية - 5 فروع', basePrice: '10,000 ريال / سنة',
    renewalDate: new Date('2026-06-15'), paymentStatus: 'paid',
    addons: [
      { name: 'فرع إضافي', quantity: 2, dateAdded: new Date('2024-03-10'), status: 'active' },
      { name: 'رصيد SMS إضافي (500)', quantity: 1, dateAdded: new Date('2025-01-05'), status: 'active' },
      { name: 'تقارير متقدمة', quantity: 1, dateAdded: new Date('2024-08-20'), status: 'active' },
    ],
    branches: [
      { name: 'الفرع الرئيسي', city: 'الرياض', phone: '0111234567', staffCount: 5, status: 'active' },
      { name: 'فرع الملز', city: 'الرياض', phone: '0111234568', staffCount: 4, status: 'active' },
      { name: 'فرع جدة', city: 'جدة', phone: '0121234567', staffCount: 3, status: 'inactive' },
    ],
    usage: { branches: { used: 3, total: 7 }, staff: { used: 12, total: 15 }, smsCredits: 320 },
  },
  'USR-002': {
    id: 'USR-002', businessName: 'مركز لمسة جمال', businessLogo: '💅', ownerName: 'سارة العلي',
    phone: '0559876543', email: 'sara@lamsa.sa', city: 'جدة', status: 'active',
    customerSince: new Date('2024-01-15'), lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
    totalRevenue: 3600, currentPlan: 'الأساسية - 2 فرع', basePrice: '250 ريال / شهر',
    renewalDate: new Date('2026-03-01'), paymentStatus: 'pending',
    addons: [
      { name: 'موظف إضافي', quantity: 3, dateAdded: new Date('2024-06-01'), status: 'active' },
    ],
    branches: [
      { name: 'الفرع الرئيسي', city: 'جدة', phone: '0121112233', staffCount: 5, status: 'active' },
      { name: 'فرع المدينة', city: 'المدينة', phone: '0141112233', staffCount: 3, status: 'active' },
    ],
    usage: { branches: { used: 2, total: 2 }, staff: { used: 8, total: 10 }, smsCredits: 45 },
  },
  'USR-003': {
    id: 'USR-003', businessName: 'باربر شوب', businessLogo: '✂️', ownerName: 'خالد الحربي',
    phone: '0541112233', email: 'khalid@barber.sa', city: 'الدمام', status: 'trial',
    customerSince: new Date('2026-02-01'), lastActive: new Date(Date.now() - 30 * 60 * 1000),
    totalRevenue: 0, currentPlan: 'الأعمال - 10 فروع', basePrice: '20,000 ريال / سنة',
    renewalDate: new Date('2026-02-28'), paymentStatus: 'pending',
    addons: [],
    branches: [
      { name: 'الفرع الرئيسي', city: 'الدمام', phone: '0131112233', staffCount: 3, status: 'active' },
    ],
    usage: { branches: { used: 1, total: 10 }, staff: { used: 3, total: 25 }, smsCredits: 500 },
  },
};

const paymentStatusMap = {
  paid: { label: 'مدفوع', className: 'bg-success/10 text-success border-success/20' },
  pending: { label: 'قيد الانتظار', className: 'bg-warning/10 text-warning border-warning/20' },
  overdue: { label: 'متأخر', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const cities = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'تبوك', 'أبها', 'القصيم', 'حائل'];

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

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let pass = '';
  for (let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(() => mockProfiles[id || ''] || mockProfiles['USR-001']);

  // Dialog states
  const [resetOpen, setResetOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ businessName: '', ownerName: '', phone: '', email: '', city: '' });

  // Manage Subscription dialogs
  const [extendOpen, setExtendOpen] = useState(false);
  const [extendDays, setExtendDays] = useState('');
  const [extendNote, setExtendNote] = useState('');

  const [pauseOpen, setPauseOpen] = useState(false);
  const [unpauseOpen, setUnpauseOpen] = useState(false);

  const [forceActivateOpen, setForceActivateOpen] = useState(false);
  const [forcePaymentMethod, setForcePaymentMethod] = useState('');
  const [forceNote, setForceNote] = useState('');

  const [grantAddonOpen, setGrantAddonOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState('');
  const [grantQuantity, setGrantQuantity] = useState('1');

  const branchPercent = (profile.usage.branches.used / profile.usage.branches.total) * 100;
  const staffPercent = (profile.usage.staff.used / profile.usage.staff.total) * 100;

  // --- Handlers ---

  const handleResetPassword = () => {
    setTempPassword(generateTempPassword());
    setPasswordCopied(false);
    setResetOpen(true);
  };

  const confirmResetPassword = () => {
    toast.success(`تم إعادة تعيين كلمة المرور لـ ${profile.businessName}`);
    setResetOpen(false);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setPasswordCopied(true);
    toast.success('تم نسخ كلمة المرور');
  };

  const openEdit = () => {
    setEditForm({ businessName: profile.businessName, ownerName: profile.ownerName, phone: profile.phone, email: profile.email, city: profile.city });
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editForm.businessName.trim() || !editForm.ownerName.trim() || !editForm.phone.trim() || !editForm.email.trim()) {
      toast.error('يرجى تعبئة جميع الحقول');
      return;
    }
    setProfile(prev => ({ ...prev, ...editForm }));
    toast.success('تم تحديث بيانات المستخدم بنجاح');
    setEditOpen(false);
  };

  const handleExtendGrace = () => {
    const days = parseInt(extendDays);
    if (!days || days <= 0) { toast.error('يرجى إدخال عدد أيام صحيح'); return; }
    if (!extendNote.trim()) { toast.error('يرجى إدخال سبب التمديد'); return; }
    const newDate = new Date(Date.now() + days * 86400000);
    setProfile(prev => ({
      ...prev,
      status: 'grace' as UserStatus,
      renewalDate: newDate,
      graceExtendedAt: new Date(),
      graceExtendedDays: days,
      graceExtendedNote: extendNote.trim(),
    }));
    toast.success(`تم تمديد المهلة ${days} يوم حتى ${format(newDate, 'dd/MM/yyyy')}`);
    setExtendOpen(false);
    setExtendDays('');
    setExtendNote('');
  };

  const handlePause = () => {
    setProfile(prev => ({ ...prev, status: 'paused' as UserStatus, pausedAt: new Date() }));
    toast.success('تم إيقاف الاشتراك مؤقتاً');
    setPauseOpen(false);
  };

  const handleUnpause = () => {
    if (profile.pausedAt) {
      const pausedDays = Math.ceil((Date.now() - profile.pausedAt.getTime()) / 86400000);
      const newRenewal = new Date(profile.renewalDate.getTime() + pausedDays * 86400000);
      setProfile(prev => ({ ...prev, status: 'active' as UserStatus, renewalDate: newRenewal, pausedAt: undefined }));
      toast.success(`تم استئناف الاشتراك. تم تمديد التجديد ${pausedDays} يوم`);
    } else {
      setProfile(prev => ({ ...prev, status: 'active' as UserStatus, pausedAt: undefined }));
      toast.success('تم استئناف الاشتراك');
    }
    setUnpauseOpen(false);
  };

  const handleForceActivate = () => {
    if (!forcePaymentMethod) { toast.error('يرجى اختيار طريقة الدفع'); return; }
    if (!forceNote.trim()) { toast.error('يرجى إدخال ملاحظة مرجعية'); return; }
    setProfile(prev => ({ ...prev, status: 'active' as UserStatus, paymentStatus: 'paid' }));
    toast.success('تم تفعيل الحساب وتسجيل الدفع يدوياً');
    setForceActivateOpen(false);
    setForcePaymentMethod('');
    setForceNote('');
  };

  const handleGrantAddon = () => {
    if (!selectedAddon) { toast.error('يرجى اختيار إضافة'); return; }
    const addon = availableAddOns.find(a => a.id === selectedAddon);
    if (!addon) return;
    const qty = parseInt(grantQuantity) || 1;
    setProfile(prev => ({
      ...prev,
      addons: [...prev.addons, { name: addon.name, quantity: qty, dateAdded: new Date(), status: 'active' }],
    }));
    toast.success(`تم منح "${addon.name}" (مجاناً) × ${qty}`);
    setGrantAddonOpen(false);
    setSelectedAddon('');
    setGrantQuantity('1');
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
            <div className="w-16 h-16 rounded-xl bg-accent/30 flex items-center justify-center text-3xl shrink-0">
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

        {/* Tabs */}
        <Tabs defaultValue="subscription" className="space-y-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="subscription" className="gap-1.5"><DollarSign className="w-4 h-4" /> الاشتراك</TabsTrigger>
            <TabsTrigger value="branches" className="gap-1.5"><MapPin className="w-4 h-4" /> الفروع</TabsTrigger>
            <TabsTrigger value="usage" className="gap-1.5"><Building2 className="w-4 h-4" /> الاستخدام</TabsTrigger>
          </TabsList>

          {/* === Subscription Tab === */}
          <TabsContent value="subscription" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Core Plan */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">تفاصيل الباقة الحالية</h3>
                  {/* Manage Subscription Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                        إدارة الاشتراك
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => { setExtendDays(''); setExtendNote(''); setExtendOpen(true); }}>
                        <Clock className="w-4 h-4" /> تمديد المهلة
                      </DropdownMenuItem>
                      {profile.status === 'paused' ? (
                        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setUnpauseOpen(true)}>
                          <Play className="w-4 h-4" /> استئناف الاشتراك
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setPauseOpen(true)}>
                          <Pause className="w-4 h-4" /> إيقاف الاشتراك مؤقتاً
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => { setForcePaymentMethod(''); setForceNote(''); setForceActivateOpen(true); }}>
                        <Zap className="w-4 h-4" /> تفعيل إجباري
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { label: 'الباقة الحالية', value: profile.currentPlan },
                    { label: 'السعر الأساسي', value: profile.basePrice },
                    { label: 'تاريخ التجديد', value: format(profile.renewalDate, 'dd/MM/yyyy') },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="font-semibold text-foreground text-sm">{item.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">حالة الدفع</span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${paymentStatusMap[profile.paymentStatus].className}`}>
                      {paymentStatusMap[profile.paymentStatus].label}
                    </span>
                  </div>
                  {profile.status === 'paused' && profile.pausedAt && (
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                      ⏸️ متوقف منذ {format(profile.pausedAt, 'dd/MM/yyyy')} ({Math.ceil((Date.now() - profile.pausedAt.getTime()) / 86400000)} يوم)
                    </div>
                  )}
                  {profile.status === 'grace' && profile.graceExtendedAt && profile.graceExtendedDays && (
                    <div className="mt-2 p-3 bg-warning/5 border border-warning/20 rounded-lg text-sm space-y-1">
                      <p className="font-semibold text-warning flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        مهلة {profile.graceExtendedDays} يوم
                      </p>
                      <p className="text-muted-foreground">
                        أُضيفت بتاريخ {format(profile.graceExtendedAt, 'dd/MM/yyyy')}
                      </p>
                      {profile.graceExtendedNote && (
                        <p className="text-muted-foreground text-xs">
                          السبب: {profile.graceExtendedNote}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Active Add-ons */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">الإضافات النشطة</h3>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => { setSelectedAddon(''); setGrantQuantity('1'); setGrantAddonOpen(true); }}>
                    <Gift className="w-3.5 h-3.5" /> منح إضافة
                  </Button>
                </div>
                <div className="p-0">
                  {profile.addons.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
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
                  ) : (
                    <div className="p-6 text-center text-sm text-muted-foreground">لا توجد إضافات نشطة</div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* === Branches Tab === */}
          <TabsContent value="branches">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-base font-bold text-foreground">الفروع ({profile.branches.length})</h3>
              </div>
              {profile.branches.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-right text-xs font-semibold">اسم الفرع</TableHead>
                      <TableHead className="text-right text-xs font-semibold">المدينة / المنطقة</TableHead>
                      <TableHead className="text-right text-xs font-semibold">رقم الهاتف</TableHead>
                      <TableHead className="text-right text-xs font-semibold">عدد الموظفين</TableHead>
                      <TableHead className="text-right text-xs font-semibold">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profile.branches.map((branch, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm font-medium">{branch.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{branch.city}</TableCell>
                        <TableCell className="text-sm text-muted-foreground" dir="ltr">{branch.phone}</TableCell>
                        <TableCell className="text-sm">{branch.staffCount} موظف</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${branch.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-muted'}`}>
                            {branch.status === 'active' ? 'نشط' : 'غير نشط'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">لا توجد فروع مسجلة</div>
              )}
            </div>
          </TabsContent>

          {/* === Usage Tab === */}
          <TabsContent value="usage">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-base font-bold text-foreground">نظرة عامة على الاستخدام</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-secondary" />
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
                    <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-warning" />
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
          </TabsContent>
        </Tabs>
      </div>

      {/* ===== DIALOGS ===== */}

      {/* Reset Password */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
              <KeyRound className="w-6 h-6 text-warning" />
            </div>
            <DialogTitle className="text-center">إعادة تعيين كلمة المرور</DialogTitle>
            <DialogDescription className="text-center">
              سيتم إنشاء كلمة مرور مؤقتة لحساب <strong className="text-foreground">{profile.businessName}</strong>
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
            <Button onClick={confirmResetPassword} className="bg-warning text-warning-foreground hover:bg-warning/90">تأكيد إعادة التعيين</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile */}
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
              <Input id="edit-business" value={editForm.businessName} onChange={e => setEditForm(f => ({ ...f, businessName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-owner">اسم المالك</Label>
              <Input id="edit-owner" value={editForm.ownerName} onChange={e => setEditForm(f => ({ ...f, ownerName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">البريد الإلكتروني <span className="text-xs text-muted-foreground">(معرف الدخول)</span></Label>
                <Input id="edit-email" type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">رقم الهاتف</Label>
                <Input id="edit-phone" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} dir="ltr" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>المدينة</Label>
              <Select value={editForm.city} onValueChange={v => setEditForm(f => ({ ...f, city: v }))}>
                <SelectTrigger><SelectValue placeholder="اختر المدينة" /></SelectTrigger>
                <SelectContent>
                  {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditOpen(false)}>إلغاء</Button>
            <Button onClick={handleEditSave}>حفظ التعديلات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Grace Period */}
      <Dialog open={extendOpen} onOpenChange={setExtendOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <DialogTitle className="text-center">تمديد المهلة</DialogTitle>
            <DialogDescription className="text-center">
              كم يوم إضافي تريد منحه لـ <strong className="text-foreground">{profile.businessName}</strong>؟
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>عدد الأيام الإضافية</Label>
              <Input type="number" min={1} value={extendDays} onChange={e => setExtendDays(e.target.value)} placeholder="مثال: 7" />
            </div>
            <div className="space-y-2">
              <Label>السبب / الملاحظة <span className="text-destructive">*</span></Label>
              <Textarea value={extendNote} onChange={e => setExtendNote(e.target.value)} placeholder="مثال: العميل وعد بتحويل بنكي يوم الخميس" rows={3} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setExtendOpen(false)}>إلغاء</Button>
            <Button onClick={handleExtendGrace} className="bg-warning text-warning-foreground hover:bg-warning/90">تأكيد التمديد</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pause Subscription */}
      <Dialog open={pauseOpen} onOpenChange={setPauseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
              <Pause className="w-6 h-6 text-muted-foreground" />
            </div>
            <DialogTitle className="text-center">إيقاف الاشتراك مؤقتاً</DialogTitle>
            <DialogDescription className="text-center">
              سيتم إيقاف العد التنازلي لانتهاء الاشتراك. لن يتمكن المستخدم من الدخول أثناء الإيقاف. عند الاستئناف، سيتم تمديد تاريخ التجديد بعدد أيام الإيقاف.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPauseOpen(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={handlePause}>تأكيد الإيقاف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unpause Subscription */}
      <Dialog open={unpauseOpen} onOpenChange={setUnpauseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
              <Play className="w-6 h-6 text-success" />
            </div>
            <DialogTitle className="text-center">استئناف الاشتراك</DialogTitle>
            <DialogDescription className="text-center">
              {profile.pausedAt ? (
                <>الحساب متوقف منذ {Math.ceil((Date.now() - profile.pausedAt.getTime()) / 86400000)} يوم. سيتم تمديد تاريخ التجديد تلقائياً بنفس المدة.</>
              ) : (
                <>سيتم إعادة تفعيل الحساب فوراً.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setUnpauseOpen(false)}>إلغاء</Button>
            <Button onClick={handleUnpause} className="bg-success text-success-foreground hover:bg-success/90">تأكيد الاستئناف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Force Activate */}
      <Dialog open={forceActivateOpen} onOpenChange={setForceActivateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-center">تفعيل إجباري</DialogTitle>
            <DialogDescription className="text-center">
              سيتم تفعيل الحساب فوراً وتسجيل الدفع يدوياً
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>طريقة الدفع <span className="text-destructive">*</span></Label>
              <Select value={forcePaymentMethod} onValueChange={setForcePaymentMethod}>
                <SelectTrigger><SelectValue placeholder="اختر طريقة الدفع" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقداً</SelectItem>
                  <SelectItem value="cheque">شيك</SelectItem>
                  <SelectItem value="transfer">تحويل خارجي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ملاحظة مرجعية <span className="text-destructive">*</span></Label>
              <Textarea value={forceNote} onChange={e => setForceNote(e.target.value)} placeholder="مثال: تم استلام المبلغ نقداً من مندوب المبيعات" rows={3} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setForceActivateOpen(false)}>إلغاء</Button>
            <Button onClick={handleForceActivate}>تأكيد التفعيل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant Add-on */}
      <Dialog open={grantAddonOpen} onOpenChange={setGrantAddonOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
              <Gift className="w-6 h-6 text-success" />
            </div>
            <DialogTitle className="text-center">منح إضافة مجانية</DialogTitle>
            <DialogDescription className="text-center">
              اختر الإضافة التي تريد منحها مجاناً لـ <strong className="text-foreground">{profile.businessName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>الإضافة</Label>
              <Select value={selectedAddon} onValueChange={setSelectedAddon}>
                <SelectTrigger><SelectValue placeholder="اختر الإضافة" /></SelectTrigger>
                <SelectContent>
                  {availableAddOns.filter(a => a.status === 'active').map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name} (السعر: 0 ريال)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الكمية</Label>
              <Input type="number" min={1} value={grantQuantity} onChange={e => setGrantQuantity(e.target.value)} />
            </div>
            <div className="p-3 bg-success/5 rounded-lg border border-success/20 text-sm text-success">
              <ShieldCheck className="w-4 h-4 inline ml-1" />
              سيتم زيادة حدود الموارد فوراً بدون دفع
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setGrantAddonOpen(false)}>إلغاء</Button>
            <Button onClick={handleGrantAddon} className="bg-success text-success-foreground hover:bg-success/90">تأكيد المنح</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
