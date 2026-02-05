import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { plans, features } from '@/data/mockData';
import { Plan, PlanStatus, BillingInterval } from '@/types/subscription';
import { ArrowRight, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function PlanFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const [formData, setFormData] = useState<Partial<Plan>>({
    displayNameAr: '',
    displayNameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    code: '',
    power: 1,
    status: 'draft',
    price: 0,
    billingInterval: 'monthly',
    trialDays: 14,
    isTaxable: true,
    features: [],
    maxBranches: 1,
    maxServiceProviders: 5,
    freeSmsCredits: 100,
  });

  const [customBranches, setCustomBranches] = useState(false);
  const [customProviders, setCustomProviders] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const plan = plans.find(p => p.id === id);
      if (plan) {
        setFormData(plan);
        setCustomBranches(plan.maxBranches === 'custom');
        setCustomProviders(plan.maxServiceProviders === 'custom');
      }
    }
  }, [id, isEditing]);

  const generateCode = () => {
    const name = formData.displayNameEn?.replace(/\s+/g, '_').toUpperCase() || 'PLAN';
    const branches = customBranches ? 'custom' : `${formData.maxBranches}branches`;
    return `${name}_${branches}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.displayNameAr || !formData.price) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    toast.success(isEditing ? 'تم تحديث الباقة بنجاح' : 'تم إنشاء الباقة بنجاح');
    navigate('/plans');
  };

  const toggleFeature = (featureId: string) => {
    const currentFeatures = formData.features || [];
    const newFeatures = currentFeatures.includes(featureId)
      ? currentFeatures.filter(f => f !== featureId)
      : [...currentFeatures, featureId];
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <MainLayout>
      <div className="p-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/plans')}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? 'تعديل الباقة' : 'إنشاء باقة جديدة'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'تعديل تفاصيل الباقة' : 'إضافة باقة اشتراك جديدة'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Accordion type="multiple" defaultValue={['general', 'pricing', 'features', 'limits']} className="space-y-4">
            {/* General Details */}
            <AccordionItem value="general" className="bg-card rounded-xl border border-border px-6">
              <AccordionTrigger className="text-lg font-bold">
                التفاصيل العامة
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الاسم بالعربية *</Label>
                    <Input
                      value={formData.displayNameAr}
                      onChange={(e) => setFormData({ ...formData, displayNameAr: e.target.value })}
                      placeholder="الباقة الاحترافية"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الاسم بالإنجليزية</Label>
                    <Input
                      value={formData.displayNameEn}
                      onChange={(e) => setFormData({ ...formData, displayNameEn: e.target.value })}
                      placeholder="Pro Plan"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>الوصف بالعربية</Label>
                  <Textarea
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder="وصف مختصر للباقة يظهر في صفحة الأسعار"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>كود الباقة</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="PRO_3branches"
                        dir="ltr"
                        className="font-mono"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData({ ...formData, code: generateCode() })}
                      >
                        توليد
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>قوة الباقة (Power)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.power}
                      onChange={(e) => setFormData({ ...formData, power: Number(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">يستخدم لترتيب الباقات وتحديد الترقية/التخفيض</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>الحالة</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: PlanStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="active">نشط (عام)</SelectItem>
                      <SelectItem value="hidden">مخفي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Pricing & Billing */}
            <AccordionItem value="pricing" className="bg-card rounded-xl border border-border px-6">
              <AccordionTrigger className="text-lg font-bold">
                السعر والفوترة
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>السعر (ريال) *</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>دورة الفوترة</Label>
                    <Select
                      value={formData.billingInterval}
                      onValueChange={(value: BillingInterval) => setFormData({ ...formData, billingInterval: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">شهرياً</SelectItem>
                        <SelectItem value="quarterly">ربع سنوي</SelectItem>
                        <SelectItem value="annually">سنوياً</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>فترة التجربة (أيام)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.trialDays}
                      onChange={(e) => setFormData({ ...formData, trialDays: Number(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">0 = لا توجد فترة تجربة</p>
                  </div>
                  <div className="flex items-center gap-3 pt-8">
                    <Checkbox
                      id="taxable"
                      checked={formData.isTaxable}
                      onCheckedChange={(checked) => setFormData({ ...formData, isTaxable: !!checked })}
                    />
                    <Label htmlFor="taxable" className="cursor-pointer">
                      تطبيق ضريبة القيمة المضافة تلقائياً
                    </Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Feature Matrix */}
            <AccordionItem value="features" className="bg-card rounded-xl border border-border px-6">
              <AccordionTrigger className="text-lg font-bold">
                المميزات
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <p className="text-sm text-muted-foreground mb-4">
                  اختر المميزات المتاحة في هذه الباقة. المميزات غير المحددة ستظهر كـ "ترقية مطلوبة"
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <Switch
                        checked={formData.features?.includes(feature.id)}
                        onCheckedChange={() => toggleFeature(feature.id)}
                      />
                      <div>
                        <p className="font-medium text-sm">{feature.nameAr}</p>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Usage Limits */}
            <AccordionItem value="limits" className="bg-card rounded-xl border border-border px-6">
              <AccordionTrigger className="text-lg font-bold">
                حدود الاستخدام
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الحد الأقصى للفروع</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={1}
                        value={customBranches ? '' : (formData.maxBranches as number)}
                        onChange={(e) => setFormData({ ...formData, maxBranches: Number(e.target.value) })}
                        disabled={customBranches}
                      />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="customBranches"
                          checked={customBranches}
                          onCheckedChange={(checked) => {
                            setCustomBranches(!!checked);
                            if (checked) setFormData({ ...formData, maxBranches: 'custom' });
                          }}
                        />
                        <Label htmlFor="customBranches" className="text-sm cursor-pointer">مخصص</Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>الحد الأقصى للموظفين</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={1}
                        value={customProviders ? '' : (formData.maxServiceProviders as number)}
                        onChange={(e) => setFormData({ ...formData, maxServiceProviders: Number(e.target.value) })}
                        disabled={customProviders}
                      />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="customProviders"
                          checked={customProviders}
                          onCheckedChange={(checked) => {
                            setCustomProviders(!!checked);
                            if (checked) setFormData({ ...formData, maxServiceProviders: 'custom' });
                          }}
                        />
                        <Label htmlFor="customProviders" className="text-sm cursor-pointer">مخصص</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>رصيد SMS المجاني</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.freeSmsCredits}
                    onChange={(e) => setFormData({ ...formData, freeSmsCredits: Number(e.target.value) })}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/plans')}>
              إلغاء
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="w-4 h-4" />
              {isEditing ? 'حفظ التغييرات' : 'إنشاء الباقة'}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
