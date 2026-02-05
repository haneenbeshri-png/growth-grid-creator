import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addOns, plans, features } from '@/data/mockData';
import { AddOn, AddOnBillingType, AddOnEffect } from '@/types/subscription';
import { ArrowRight, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AddOnFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const [formData, setFormData] = useState<Partial<AddOn>>({
    name: '',
    icon: 'building',
    billingType: 'monthly',
    price: 0,
    effect: 'branch_count',
    quantity: 1,
    availableForAll: true,
    applicablePlans: [],
  });

  useEffect(() => {
    if (isEditing) {
      const addOn = addOns.find(a => a.id === id);
      if (addOn) {
        setFormData(addOn);
      }
    }
  }, [id, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    toast.success(isEditing ? 'تم تحديث الإضافة بنجاح' : 'تم إنشاء الإضافة بنجاح');
    navigate('/addons');
  };

  const togglePlan = (planId: string) => {
    const currentPlans = formData.applicablePlans || [];
    const newPlans = currentPlans.includes(planId)
      ? currentPlans.filter(p => p !== planId)
      : [...currentPlans, planId];
    setFormData({ ...formData, applicablePlans: newPlans });
  };

  return (
    <MainLayout>
      <div className="p-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/addons')}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? 'تعديل الإضافة' : 'إنشاء إضافة جديدة'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'تعديل تفاصيل الإضافة' : 'إضافة منتج إضافي جديد'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Identity & Pricing */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground mb-4">الهوية والسعر</h2>
            
            <div className="space-y-2">
              <Label>اسم الإضافة *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="فرع إضافي"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع الفوترة</Label>
                <Select
                  value={formData.billingType}
                  onValueChange={(value: AddOnBillingType) => setFormData({ ...formData, billingType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">اشتراك شهري</SelectItem>
                    <SelectItem value="annual">اشتراك سنوي</SelectItem>
                    <SelectItem value="one-time">شراء لمرة واحدة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>السعر (ريال) *</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Add-On Benefit */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground mb-4">تأثير الإضافة</h2>
            
            <div className="space-y-2">
              <Label>ما الذي يحصل عليه المستخدم؟</Label>
              <Select
                value={formData.effect}
                onValueChange={(value: AddOnEffect) => setFormData({ ...formData, effect: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="branch_count">زيادة عدد الفروع</SelectItem>
                  <SelectItem value="staff_count">زيادة عدد الموظفين</SelectItem>
                  <SelectItem value="sms_credits">إضافة رصيد SMS</SelectItem>
                  <SelectItem value="unlock_feature">فتح ميزة معينة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الكمية</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.effect === 'sms_credits' && 'عدد الرسائل'}
                  {formData.effect === 'branch_count' && 'عدد الفروع الإضافية'}
                  {formData.effect === 'staff_count' && 'عدد الموظفين الإضافيين'}
                </p>
              </div>
              {formData.effect === 'unlock_feature' && (
                <div className="space-y-2">
                  <Label>الميزة المراد فتحها</Label>
                  <Select
                    value={formData.featureToUnlock}
                    onValueChange={(value) => setFormData({ ...formData, featureToUnlock: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر ميزة" />
                    </SelectTrigger>
                    <SelectContent>
                      {features.map((feature) => (
                        <SelectItem key={feature.id} value={feature.id}>
                          {feature.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground mb-4">التوفر</h2>
            
            <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
              <Checkbox
                id="availableForAll"
                checked={formData.availableForAll}
                onCheckedChange={(checked) => setFormData({ ...formData, availableForAll: !!checked })}
              />
              <Label htmlFor="availableForAll" className="cursor-pointer">
                متاح لجميع الباقات
              </Label>
            </div>

            {!formData.availableForAll && (
              <div className="space-y-3">
                <Label>اختر الباقات المتاحة</Label>
                <div className="grid grid-cols-2 gap-3">
                  {plans.filter(p => p.status === 'active').map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        checked={formData.applicablePlans?.includes(plan.id)}
                        onCheckedChange={() => togglePlan(plan.id)}
                      />
                      <span className="text-sm">{plan.displayNameAr}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/addons')}>
              إلغاء
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="w-4 h-4" />
              {isEditing ? 'حفظ التغييرات' : 'حفظ الإضافة'}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
