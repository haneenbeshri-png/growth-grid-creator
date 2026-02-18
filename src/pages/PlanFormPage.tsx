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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { plans, features as initialFeatures } from '@/data/mockData';
import { Plan, PlanStatus, BillingInterval } from '@/types/subscription';
import { ArrowRight, Save, CalendarIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [discountFrom, setDiscountFrom] = useState<Date | undefined>();
  const [discountTo, setDiscountTo] = useState<Date | undefined>();
  const [featuresList, setFeaturesList] = useState(initialFeatures);
  const [newFeatureAr, setNewFeatureAr] = useState('');
  const [newFeatureEn, setNewFeatureEn] = useState('');
  const [showAddFeature, setShowAddFeature] = useState(false);

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
          <Accordion type="multiple" defaultValue={['general', 'pricing', 'discount', 'features', 'limits']} className="space-y-4">
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

                <div className="space-y-2">
                  <Label>الوصف بالإنجليزية</Label>
                  <Textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    placeholder="Brief description shown on the pricing page"
                    rows={3}
                    dir="ltr"
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

            {/* Discount Configuration */}
            <AccordionItem value="discount" className="bg-card rounded-xl border border-border px-6">
              <AccordionTrigger className="text-lg font-bold">
                إعدادات الخصم
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  أضف خصماً خاصاً بهذه الباقة يُطبّق تلقائياً خلال فترة الصلاحية
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نوع الخصم</Label>
                    <Select
                      value={discountType}
                      onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                        <SelectItem value="fixed">مبلغ ثابت (ريال)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>قيمة الخصم {discountType === 'percentage' ? '(%)' : '(ريال)'}</Label>
                    <Input
                      type="number"
                      min={0}
                      max={discountType === 'percentage' ? 100 : undefined}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      placeholder={discountType === 'percentage' ? 'مثال: 15' : 'مثال: 50'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>تاريخ البداية</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-right font-normal",
                            !discountFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {discountFrom ? format(discountFrom, 'dd MMM yyyy', { locale: ar }) : 'اختر تاريخ البداية'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={discountFrom}
                          onSelect={setDiscountFrom}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ الانتهاء</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-right font-normal",
                            !discountTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {discountTo ? format(discountTo, 'dd MMM yyyy', { locale: ar }) : 'اختر تاريخ الانتهاء'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={discountTo}
                          onSelect={setDiscountTo}
                          disabled={(date) => discountFrom ? date < discountFrom : false}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {discountValue > 0 && (
                  <div className="bg-accent/30 rounded-lg p-4 border border-accent">
                    <p className="text-sm font-medium text-foreground">
                      ملخص الخصم: {discountType === 'percentage' ? `${discountValue}%` : `${discountValue} ريال`}
                      {discountFrom && discountTo && (
                        <span className="text-muted-foreground">
                          {' '}• من {format(discountFrom, 'dd/MM/yyyy')} إلى {format(discountTo, 'dd/MM/yyyy')}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Feature Matrix */}
            <AccordionItem value="features" className="bg-card rounded-xl border border-border px-6">
              <AccordionTrigger className="text-lg font-bold">
                المميزات
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    اختر المميزات المتاحة في هذه الباقة
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowAddFeature(!showAddFeature)}
                  >
                    <Plus className="w-4 h-4" />
                    إضافة ميزة جديدة
                  </Button>
                </div>

                {showAddFeature && (
                  <div className="bg-accent/30 rounded-lg p-4 border border-border mb-4 space-y-3">
                    <p className="text-sm font-medium">إضافة ميزة جديدة</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={newFeatureAr}
                        onChange={(e) => setNewFeatureAr(e.target.value)}
                        placeholder="اسم الميزة بالعربية"
                      />
                      <Input
                        value={newFeatureEn}
                        onChange={(e) => setNewFeatureEn(e.target.value)}
                        placeholder="Feature name in English"
                        dir="ltr"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => { setShowAddFeature(false); setNewFeatureAr(''); setNewFeatureEn(''); }}
                      >
                        إلغاء
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (!newFeatureAr.trim()) {
                            toast.error('يرجى إدخال اسم الميزة بالعربية');
                            return;
                          }
                          const newId = `f_${Date.now()}`;
                          setFeaturesList([...featuresList, {
                            id: newId,
                            nameAr: newFeatureAr.trim(),
                            nameEn: newFeatureEn.trim() || newFeatureAr.trim(),
                            description: '',
                          }]);
                          setFormData({ ...formData, features: [...(formData.features || []), newId] });
                          setNewFeatureAr('');
                          setNewFeatureEn('');
                          setShowAddFeature(false);
                          toast.success('تمت إضافة الميزة بنجاح');
                        }}
                      >
                        إضافة
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {featuresList.map((feature) => (
                    <label
                      key={feature.id}
                      htmlFor={`feature-${feature.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <Checkbox
                        id={`feature-${feature.id}`}
                        checked={formData.features?.includes(feature.id)}
                        onCheckedChange={() => toggleFeature(feature.id)}
                      />
                      <div>
                        <p className="font-medium text-sm">{feature.nameAr}</p>
                        {feature.nameEn && (
                          <p className="text-xs text-muted-foreground" dir="ltr">{feature.nameEn}</p>
                        )}
                      </div>
                    </label>
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
