import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { coupons, plans } from '@/data/mockData';
import { Coupon, DiscountType, CouponDuration } from '@/types/subscription';
import { ArrowRight, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function CouponFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const existingCoupon = isEditing ? coupons.find(c => c.id === id) : null;
  const hasBeenUsed = existingCoupon && existingCoupon.usageCount > 0;

  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    internalName: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    duration: 'one-time',
    repeatCount: 3,
    applicablePlans: 'all',
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    maxRedemptions: 100,
    maxRedemptionsPerUser: 1,
  });

  const [specificPlans, setSpecificPlans] = useState<string[]>([]);
  const [allPlans, setAllPlans] = useState(true);

  useEffect(() => {
    if (existingCoupon) {
      setFormData(existingCoupon);
      if (Array.isArray(existingCoupon.applicablePlans)) {
        setAllPlans(false);
        setSpecificPlans(existingCoupon.applicablePlans);
      }
    }
  }, [existingCoupon]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.discountValue) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // Check for unique code
    const existingCode = coupons.find(c => c.code === formData.code && c.id !== id);
    if (existingCode) {
      toast.error('هذا الكود مستخدم بالفعل');
      return;
    }

    toast.success(isEditing ? 'تم تحديث الكوبون بنجاح' : 'تم إنشاء الكوبون بنجاح');
    navigate('/coupons');
  };

  const togglePlan = (planId: string) => {
    const newPlans = specificPlans.includes(planId)
      ? specificPlans.filter(p => p !== planId)
      : [...specificPlans, planId];
    setSpecificPlans(newPlans);
    setFormData({ ...formData, applicablePlans: newPlans });
  };

  return (
    <MainLayout>
      <div className="p-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/coupons')}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? 'تعديل الكوبون' : 'إنشاء كوبون جديد'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'تعديل تفاصيل الكوبون' : 'إضافة كود خصم جديد'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Identity */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground mb-4">الهوية</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>كود الكوبون *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
                  placeholder="SAUDI96"
                  dir="ltr"
                  className="font-mono uppercase"
                  disabled={hasBeenUsed}
                />
                {hasBeenUsed && (
                  <p className="text-xs text-muted-foreground">لا يمكن تغيير الكود بعد استخدامه</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>الاسم الداخلي</Label>
                <Input
                  value={formData.internalName}
                  onChange={(e) => setFormData({ ...formData, internalName: e.target.value })}
                  placeholder="اليوم الوطني السعودي"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>الوصف (يظهر للمستخدم)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="احصل على خصم 10% على اشتراكك"
                rows={2}
              />
            </div>
          </div>

          {/* Discount Logic */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground mb-4">منطق الخصم</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع الخصم</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: DiscountType) => setFormData({ ...formData, discountType: value })}
                  disabled={hasBeenUsed}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                    <SelectItem value="fixed">مبلغ ثابت (ريال)</SelectItem>
                  </SelectContent>
                </Select>
                {hasBeenUsed && (
                  <p className="text-xs text-muted-foreground">لا يمكن تغيير نوع الخصم بعد استخدامه</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>قيمة الخصم *</Label>
                <Input
                  type="number"
                  min={1}
                  max={formData.discountType === 'percentage' ? 100 : undefined}
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  disabled={hasBeenUsed}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>مدة الخصم</Label>
              <Select
                value={formData.duration}
                onValueChange={(value: CouponDuration) => setFormData({ ...formData, duration: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">مرة واحدة (الفاتورة الحالية فقط)</SelectItem>
                  <SelectItem value="repeating">متكرر (لعدد محدد من الفواتير)</SelectItem>
                  <SelectItem value="forever">دائم (جميع الفواتير)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.duration === 'repeating' && (
              <div className="space-y-2">
                <Label>عدد الفواتير</Label>
                <Input
                  type="number"
                  min={2}
                  value={formData.repeatCount}
                  onChange={(e) => setFormData({ ...formData, repeatCount: Number(e.target.value) })}
                />
              </div>
            )}
          </div>

          {/* Restrictions */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground mb-4">القيود</h2>
            
            <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
              <Checkbox
                id="allPlans"
                checked={allPlans}
                onCheckedChange={(checked) => {
                  setAllPlans(!!checked);
                  setFormData({ ...formData, applicablePlans: checked ? 'all' : specificPlans });
                }}
              />
              <Label htmlFor="allPlans" className="cursor-pointer">
                صالح لجميع الباقات
              </Label>
            </div>

            {!allPlans && (
              <div className="space-y-3">
                <Label>اختر الباقات الصالحة</Label>
                <div className="grid grid-cols-2 gap-3">
                  {plans.filter(p => p.status === 'active').map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        checked={specificPlans.includes(plan.id)}
                        onCheckedChange={() => togglePlan(plan.id)}
                      />
                      <span className="text-sm">{plan.displayNameAr}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاريخ الانتهاء</Label>
                <Input
                  type="date"
                  value={formData.expiryDate ? new Date(formData.expiryDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, expiryDate: new Date(e.target.value) })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>الحد الأقصى للاستخدام (الإجمالي)</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.maxRedemptions}
                  onChange={(e) => setFormData({ ...formData, maxRedemptions: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>الحد الأقصى لكل مستخدم</Label>
              <Input
                type="number"
                min={1}
                value={formData.maxRedemptionsPerUser}
                onChange={(e) => setFormData({ ...formData, maxRedemptionsPerUser: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/coupons')}>
              إلغاء
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="w-4 h-4" />
              {isEditing ? 'حفظ التغييرات' : 'حفظ الكوبون'}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
