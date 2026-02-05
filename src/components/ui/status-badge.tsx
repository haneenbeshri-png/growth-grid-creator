import { cn } from '@/lib/utils';
import { PlanStatus, CouponStatus } from '@/types/subscription';

interface StatusBadgeProps {
  status: PlanStatus | CouponStatus;
  className?: string;
}

const statusConfig: Record<PlanStatus | CouponStatus, { label: string; className: string }> = {
  active: {
    label: 'نشط',
    className: 'bg-success/10 text-success border-success/20',
  },
  hidden: {
    label: 'مخفي',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  draft: {
    label: 'مسودة',
    className: 'bg-draft/10 text-draft border-draft/20',
  },
  archived: {
    label: 'مؤرشف',
    className: 'bg-archive/10 text-archive border-archive/20',
  },
  disabled: {
    label: 'معطل',
    className: 'bg-muted text-muted-foreground border-muted',
  },
  expired: {
    label: 'منتهي',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
