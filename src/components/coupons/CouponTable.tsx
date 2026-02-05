import { Coupon } from '@/types/subscription';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface CouponTableProps {
  coupons: Coupon[];
  onEdit: (coupon: Coupon) => void;
  onToggle: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
}

export function CouponTable({ coupons, onEdit, onToggle, onDelete }: CouponTableProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-right font-semibold">الحالة</TableHead>
            <TableHead className="text-right font-semibold">الكود</TableHead>
            <TableHead className="text-right font-semibold">الخصم</TableHead>
            <TableHead className="text-right font-semibold">الاستخدام</TableHead>
            <TableHead className="text-right font-semibold">تاريخ الانتهاء</TableHead>
            <TableHead className="text-right font-semibold">تأثير الإيرادات</TableHead>
            <TableHead className="text-right font-semibold">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id} className="hover:bg-accent/30 transition-colors">
              <TableCell>
                <StatusBadge status={coupon.status} />
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-mono font-bold text-foreground">{coupon.code}</p>
                  <p className="text-xs text-muted-foreground">{coupon.internalName}</p>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-semibold text-teal">
                  {coupon.discountType === 'percentage' 
                    ? `${coupon.discountValue}%` 
                    : `${coupon.discountValue} ريال`}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-20">
                    <div 
                      className="h-full bg-secondary transition-all"
                      style={{ width: `${(coupon.usageCount / coupon.maxRedemptions) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {coupon.usageCount} / {coupon.maxRedemptions}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {format(coupon.expiryDate, 'dd MMM yyyy', { locale: ar })}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-semibold text-destructive">
                  -{coupon.revenueImpact.toLocaleString()} ريال
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(coupon)}
                    className="h-8 w-8"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggle(coupon)}
                    className="h-8 w-8"
                    disabled={coupon.status === 'expired'}
                  >
                    {coupon.status === 'active' ? (
                      <PowerOff className="w-4 h-4 text-warning" />
                    ) : (
                      <Power className="w-4 h-4 text-success" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(coupon)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
