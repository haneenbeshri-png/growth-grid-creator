import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plan } from '@/types/subscription';
import { Archive, AlertTriangle } from 'lucide-react';

interface ArchivePlanDialogProps {
  plan: Plan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ArchivePlanDialog({
  plan,
  open,
  onOpenChange,
  onConfirm,
}: ArchivePlanDialogProps) {
  if (!plan) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
            <Archive className="w-6 h-6 text-warning" />
          </div>
          <AlertDialogTitle className="text-center">
            أرشفة الباقة
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3">
            <p>
              هذه الباقة لديها <strong className="text-foreground">{plan.activeSubscribers}</strong> مشترك نشط.
            </p>
            <div className="bg-accent/50 p-4 rounded-lg text-sm text-foreground">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <div className="text-right">
                  <p className="font-medium mb-1">سيتم نقل الباقة إلى حالة "مؤرشف":</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• المشتركون الحاليون سيجددون بشكل طبيعي</li>
                    <li>• لن يتمكن المستخدمون الجدد من شراء هذه الباقة</li>
                  </ul>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-warning text-warning-foreground hover:bg-warning/90"
          >
            تأكيد الأرشفة
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
