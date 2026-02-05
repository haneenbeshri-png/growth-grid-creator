import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AddOnCard } from '@/components/addons/AddOnCard';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { addOns as initialAddOns } from '@/data/mockData';
import { AddOn } from '@/types/subscription';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function AddOnsPage() {
  const navigate = useNavigate();
  const [addOns, setAddOns] = useState<AddOn[]>(initialAddOns);
  const [deleteAddOn, setDeleteAddOn] = useState<AddOn | null>(null);

  const handleEdit = (addOn: AddOn) => {
    navigate(`/addons/${addOn.id}/edit`);
  };

  const handleDuplicate = (addOn: AddOn) => {
    const newAddOn: AddOn = {
      ...addOn,
      id: `a${Date.now()}`,
      name: `${addOn.name} (نسخة)`,
      createdAt: new Date(),
    };
    setAddOns([...addOns, newAddOn]);
    toast.success('تم نسخ الإضافة بنجاح');
    navigate(`/addons/${newAddOn.id}/edit`);
  };

  const handleDelete = (addOn: AddOn) => {
    setDeleteAddOn(addOn);
  };

  const confirmDelete = () => {
    if (deleteAddOn) {
      setAddOns(addOns.filter(a => a.id !== deleteAddOn.id));
      toast.success('تم حذف الإضافة بنجاح');
      setDeleteAddOn(null);
    }
  };

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">إدارة الإضافات</h1>
            <p className="text-muted-foreground">إنشاء وإدارة الإضافات المتاحة للمشتركين</p>
          </div>
          <Button 
            onClick={() => navigate('/addons/new')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            إنشاء إضافة جديدة
          </Button>
        </div>

        {/* Add-ons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addOns.map((addOn, index) => (
            <div key={addOn.id} style={{ animationDelay: `${index * 100}ms` }}>
              <AddOnCard
                addOn={addOn}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>

        {/* Delete Dialog */}
        <DeleteConfirmDialog
          title="حذف الإضافة"
          description="هل أنت متأكد من حذف هذه الإضافة؟ هذا الإجراء لا يمكن التراجع عنه."
          open={!!deleteAddOn}
          onOpenChange={(open) => !open && setDeleteAddOn(null)}
          onConfirm={confirmDelete}
        />
      </div>
    </MainLayout>
  );
}
