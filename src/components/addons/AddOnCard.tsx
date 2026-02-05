import { AddOn } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Trash2, 
  Pencil,
  Building,
  MessageSquare,
  UserPlus,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddOnCardProps {
  addOn: AddOn;
  onEdit: (addOn: AddOn) => void;
  onDuplicate: (addOn: AddOn) => void;
  onDelete: (addOn: AddOn) => void;
}

const iconMap = {
  building: Building,
  'message-square': MessageSquare,
  'user-plus': UserPlus,
  'bar-chart-3': BarChart3,
};

const billingLabels = {
  monthly: 'شهرياً',
  annual: 'سنوياً',
  'one-time': 'مرة واحدة',
};

export function AddOnCard({ addOn, onEdit, onDuplicate, onDelete }: AddOnCardProps) {
  const Icon = iconMap[addOn.icon as keyof typeof iconMap] || Building;
  const isArchived = addOn.status === 'archived';

  return (
    <div
      className={cn(
        "group relative bg-card rounded-xl border border-border p-6 transition-all duration-300 hover:shadow-elevated animate-fade-in",
        isArchived && "opacity-75 bg-muted/30"
      )}
    >
      {/* Icon & Name */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-teal" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground mb-1">{addOn.name}</h3>
          <span className="text-xs bg-secondary/30 text-secondary-foreground px-2 py-0.5 rounded">
            {billingLabels[addOn.billingType]}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <span className="text-2xl font-bold text-teal">{addOn.price}</span>
        <span className="text-sm text-muted-foreground mr-1">ريال</span>
      </div>

      {/* Availability */}
      <div className="mb-6 p-3 bg-accent/50 rounded-lg">
        <span className="text-sm text-foreground">
          {addOn.availableForAll ? 'متاح لجميع الباقات' : `متاح لـ ${addOn.applicablePlans.length} باقات محددة`}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(addOn)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Pencil className="w-4 h-4 ml-1" />
          تعديل
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDuplicate(addOn)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Copy className="w-4 h-4 ml-1" />
          نسخ
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(addOn)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
