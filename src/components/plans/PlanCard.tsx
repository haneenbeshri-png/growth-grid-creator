import { Plan } from '@/types/subscription';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Copy, 
  Trash2, 
  Archive, 
  Pencil, 
  Users,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onDuplicate: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  onArchive: (plan: Plan) => void;
  onToggleStatus: (plan: Plan) => void;
}

const billingLabels = {
  monthly: 'شهرياً',
  quarterly: 'ربع سنوي',
  annually: 'سنوياً',
};

export function PlanCard({
  plan,
  onEdit,
  onDuplicate,
  onDelete,
  onArchive,
  onToggleStatus,
}: PlanCardProps) {
  const isArchived = plan.status === 'archived';
  const hasSubscribers = plan.activeSubscribers > 0;
  const canToggle = plan.status !== 'archived' && plan.status !== 'draft';

  return (
    <div
      className={cn(
        "group relative bg-card rounded-xl border border-border p-6 transition-all duration-300 hover:shadow-elevated animate-fade-in",
        isArchived && "opacity-75 bg-muted/30"
      )}
    >
      {/* Power Badge */}
      <div className="absolute -top-3 right-4 flex items-center gap-1 bg-teal text-teal-foreground px-3 py-1 rounded-full text-sm font-medium shadow-card">
        <Zap className="w-3.5 h-3.5" />
        <span>{plan.power}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4 pt-2">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">{plan.displayNameAr}</h3>
          <p className="text-sm text-muted-foreground font-mono">{plan.code}</p>
        </div>
        <StatusBadge status={plan.status} />
      </div>

      {/* Price */}
      <div className="mb-4">
        <span className="text-3xl font-bold text-teal">{plan.price}</span>
        <span className="text-sm text-muted-foreground mr-1">ريال / {billingLabels[plan.billingInterval]}</span>
      </div>

      {/* Subscribers */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-accent/50 rounded-lg">
        <Users className="w-4 h-4 text-secondary" />
        <span className="text-sm text-foreground">
          <strong>{plan.activeSubscribers}</strong> مشترك نشط
        </span>
      </div>

      {/* Features Summary */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-2">المميزات:</p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded">
            {typeof plan.maxBranches === 'number' ? `${plan.maxBranches} فروع` : 'فروع مخصصة'}
          </span>
          <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded">
            {typeof plan.maxServiceProviders === 'number' ? `${plan.maxServiceProviders} موظفين` : 'موظفين مخصص'}
          </span>
          <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded">
            {plan.freeSmsCredits} رسالة SMS
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(plan)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(plan)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Copy className="w-4 h-4" />
          </Button>
          {hasSubscribers ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchive(plan)}
              className="text-muted-foreground hover:text-archive"
              disabled={isArchived}
            >
              <Archive className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(plan)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {canToggle && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {plan.status === 'active' ? 'عام' : 'مخفي'}
            </span>
            <Switch
              checked={plan.status === 'active'}
              onCheckedChange={() => onToggleStatus(plan)}
              disabled={hasSubscribers && plan.status === 'active'}
            />
          </div>
        )}
      </div>
    </div>
  );
}
