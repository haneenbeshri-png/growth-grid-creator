import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PlanCard } from '@/components/plans/PlanCard';
import { ArchivePlanDialog } from '@/components/dialogs/ArchivePlanDialog';
import { BlockActionDialog } from '@/components/dialogs/BlockActionDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { plans as initialPlans } from '@/data/mockData';
import { Plan } from '@/types/subscription';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function PlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>(
    [...initialPlans].sort((a, b) => a.power - b.power)
  );
  const [archivePlan, setArchivePlan] = useState<Plan | null>(null);
  const [blockPlan, setBlockPlan] = useState<Plan | null>(null);
  const [deletePlan, setDeletePlan] = useState<Plan | null>(null);

  const handleEdit = (plan: Plan) => {
    navigate(`/plans/${plan.id}/edit`);
  };

  const handleDuplicate = (plan: Plan) => {
    const newPlan: Plan = {
      ...plan,
      id: `p${Date.now()}`,
      code: `${plan.code}_copy`,
      displayNameAr: `${plan.displayNameAr} (نسخة)`,
      displayNameEn: `${plan.displayNameEn} (Copy)`,
      status: 'draft',
      activeSubscribers: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPlans([...plans, newPlan].sort((a, b) => a.power - b.power));
    toast.success('تم نسخ الباقة بنجاح');
    navigate(`/plans/${newPlan.id}/edit`);
  };

  const handleDelete = (plan: Plan) => {
    setDeletePlan(plan);
  };

  const handleArchive = (plan: Plan) => {
    setArchivePlan(plan);
  };

  const handleToggleStatus = (plan: Plan) => {
    if (plan.activeSubscribers > 0 && plan.status === 'active') {
      setBlockPlan(plan);
      return;
    }

    setPlans(plans.map(p => {
      if (p.id === plan.id) {
        const newStatus = p.status === 'active' ? 'hidden' : 'active';
        toast.success(`تم ${newStatus === 'active' ? 'تفعيل' : 'إخفاء'} الباقة`);
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  const confirmArchive = () => {
    if (archivePlan) {
      setPlans(plans.map(p => 
        p.id === archivePlan.id ? { ...p, status: 'archived' as const } : p
      ));
      toast.success('تم أرشفة الباقة بنجاح');
      setArchivePlan(null);
    }
  };

  const confirmDelete = () => {
    if (deletePlan) {
      setPlans(plans.filter(p => p.id !== deletePlan.id));
      toast.success('تم حذف الباقة بنجاح');
      setDeletePlan(null);
    }
  };

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">إدارة الخطط</h1>
            <p className="text-muted-foreground">عرض وإدارة جميع خطط الاشتراك</p>
          </div>
          <Button 
            onClick={() => navigate('/plans/new')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            إنشاء باقة جديدة
          </Button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div key={plan.id} style={{ animationDelay: `${index * 100}ms` }}>
              <PlanCard
                plan={plan}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onToggleStatus={handleToggleStatus}
              />
            </div>
          ))}
        </div>

        {/* Dialogs */}
        <ArchivePlanDialog
          plan={archivePlan}
          open={!!archivePlan}
          onOpenChange={(open) => !open && setArchivePlan(null)}
          onConfirm={confirmArchive}
        />
        <BlockActionDialog
          plan={blockPlan}
          open={!!blockPlan}
          onOpenChange={(open) => !open && setBlockPlan(null)}
        />
        <DeleteConfirmDialog
          title="حذف الباقة"
          description="هل أنت متأكد من حذف هذه الباقة؟ هذا الإجراء لا يمكن التراجع عنه."
          open={!!deletePlan}
          onOpenChange={(open) => !open && setDeletePlan(null)}
          onConfirm={confirmDelete}
        />
      </div>
    </MainLayout>
  );
}
