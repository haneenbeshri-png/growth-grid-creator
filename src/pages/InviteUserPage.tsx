import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { plans } from '@/data/mockData';
import { toast } from 'sonner';
import { UserPlus, Building2, CreditCard, Send, ArrowRight, Mail, Phone, User, MapPin } from 'lucide-react';

const cities = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام',
  'الخبر', 'الظهران', 'تبوك', 'أبها', 'الطائف', 'بريدة', 'نجران',
  'جازان', 'ينبع', 'حائل', 'الجبيل', 'خميس مشيط',
];

type BillingCycle = 'monthly' | 'quarterly' | 'annually';

const billingLabels: Record<BillingCycle, string> = {
  monthly: 'شهري',
  quarterly: 'ربع سنوي',
  annually: 'سنوي',
};

export default function InviteUserPage() {
  const navigate = useNavigate();

  // Owner details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Business details
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');

  // Plan selection
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [priceOverride, setPriceOverride] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annually');

  // Get available plans (active + hidden, not draft/archived)
  const availablePlans = plans.filter(p => p.status === 'active' || p.status === 'hidden');

  const selectedPlan = availablePlans.find(p => p.id === selectedPlanId);

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = availablePlans.find(p => p.id === planId);
    if (plan) {
      setPriceOverride(plan.price.toString());
    }
  };

  const handleSubmit = () => {
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      toast.error('يرجى تعبئة جميع بيانات المالك');
      return;
    }
    if (!businessName.trim() || !city) {
      toast.error('يرجى تعبئة جميع بيانات النشاط التجاري');
      return;
    }
    if (!selectedPlanId) {
      toast.error('يرجى اختيار الباقة');
      return;
    }
    if (!priceOverride || Number(priceOverride) < 0) {
      toast.error('يرجى إدخال سعر صحيح');
      return;
    }

    const finalPrice = Number(priceOverride);
    const isCustomPrice = selectedPlan && finalPrice !== selectedPlan.price;

    toast.success(
      <div className="space-y-1">
        <p className="font-semibold">تم إنشاء الحساب وإرسال الدعوة بنجاح</p>
        <p className="text-sm opacity-80">تم إرسال رابط تعيين كلمة المرور إلى {email}</p>
      </div>,
      { duration: 5000 }
    );

    navigate('/users');
  };

  return (
    <MainLayout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/users')}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">دعوة مستخدم جديد</h1>
            <p className="text-muted-foreground mt-1">إنشاء حساب جديد وتعيين باقة مخصصة للعميل</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Owner Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">بيانات المالك</CardTitle>
                  <CardDescription>المعلومات الشخصية لصاحب الحساب</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل *</Label>
                <Input
                  id="fullName"
                  placeholder="أدخل الاسم الكامل"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="pr-10"
                      dir="ltr"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">سيكون هذا البريد هو اسم المستخدم للدخول</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="05XXXXXXXX"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="pr-10"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">بيانات النشاط التجاري</CardTitle>
                  <CardDescription>معلومات المنشأة</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">اسم النشاط التجاري *</Label>
                <Input
                  id="businessName"
                  placeholder="أدخل اسم المنشأة"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">المدينة / الموقع *</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Plan Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">الصفقة المتفق عليها</CardTitle>
                  <CardDescription>اختر الباقة وحدد السعر المخصص للعميل</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>اختر الباقة *</Label>
                <Select value={selectedPlanId} onValueChange={handlePlanChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الباقة المناسبة" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        <div className="flex items-center gap-2">
                          <span>{plan.displayNameAr}</span>
                          <span className="text-muted-foreground text-xs">
                            ({plan.status === 'hidden' ? 'مخفية' : 'عامة'})
                          </span>
                          <span className="text-muted-foreground text-xs">— {plan.price} ريال</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPlan && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priceOverride">السعر المخصص (ريال) *</Label>
                      <Input
                        id="priceOverride"
                        type="number"
                        min="0"
                        value={priceOverride}
                        onChange={e => setPriceOverride(e.target.value)}
                        dir="ltr"
                      />
                      {Number(priceOverride) !== selectedPlan.price && priceOverride !== '' && (
                        <p className="text-xs text-warning font-medium">
                          السعر الأصلي: {selectedPlan.price} ريال — تم تعديل السعر يدوياً
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>دورة الفوترة *</Label>
                      <Select value={billingCycle} onValueChange={(v: BillingCycle) => setBillingCycle(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="annually">سنوي</SelectItem>
                          <SelectItem value="monthly">شهري</SelectItem>
                          <SelectItem value="quarterly">ربع سنوي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-border">
                    <h4 className="font-semibold text-sm text-foreground">ملخص الصفقة</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">الباقة:</span>
                      <span className="font-medium">{selectedPlan.displayNameAr}</span>
                      <span className="text-muted-foreground">السعر:</span>
                      <span className="font-medium">{priceOverride} ريال / {billingLabels[billingCycle]}</span>
                      <span className="text-muted-foreground">الفروع:</span>
                      <span className="font-medium">{selectedPlan.maxBranches === 'custom' ? 'غير محدود' : selectedPlan.maxBranches}</span>
                      <span className="text-muted-foreground">مقدمو الخدمة:</span>
                      <span className="font-medium">{selectedPlan.maxServiceProviders === 'custom' ? 'غير محدود' : selectedPlan.maxServiceProviders}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Email Preview */}
          {fullName && businessName && email && (
            <Card className="border-dashed">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Send className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">معاينة البريد الإلكتروني</CardTitle>
                    <CardDescription>الرسالة التي سيتم إرسالها للعميل</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-background rounded-lg border border-border p-6 space-y-3 text-sm">
                  <p className="text-muted-foreground">إلى: <span className="text-foreground" dir="ltr">{email}</span></p>
                  <Separator />
                  <p className="font-semibold text-base">مرحباً {fullName}!</p>
                  <p className="text-muted-foreground">
                    حسابك المؤسسي لـ <strong className="text-foreground">{businessName}</strong> جاهز الآن.
                  </p>
                  <p className="text-muted-foreground">
                    اضغط على الرابط أدناه لتعيين كلمة المرور الخاصة بك والوصول إلى لوحة التحكم.
                  </p>
                  <div className="bg-primary/10 text-primary rounded-md px-4 py-2.5 text-center font-medium">
                    🔗 رابط تعيين كلمة المرور
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => navigate('/users')}>
              إلغاء
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <UserPlus className="w-4 h-4" />
              إنشاء وإرسال الدعوة
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
