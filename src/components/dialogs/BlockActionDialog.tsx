import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plan } from '@/types/subscription';
import { ShieldAlert } from 'lucide-react';

interface BlockActionDialogProps {
  plan: Plan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BlockActionDialog({
  plan,
  open,
  onOpenChange,
}: BlockActionDialogProps) {
  if (!plan) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center">
            لا يمكن تعطيل هذه الباقة
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            <p className="mb-4">
              لا يمكنك تعطيل هذه الباقة لأن <strong className="text-foreground">{plan.activeSubscribers}</strong> مستخدم مشترك حالياً.
            </p>
            <p className="text-sm">
              يرجى أرشفة الباقة بدلاً من ذلك للحفاظ على اشتراكات المستخدمين الحاليين.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            فهمت
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
