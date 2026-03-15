import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import numbro from 'numbro';

export function formatCurrency(value: number): string {
  return `${numbro(value).format({ thousandSeparated: true, mantissa: 0 })}원`;
}

export function formatCompactCurrency(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1_0000_0000) {
    const billions = absValue / 1_0000_0000;
    const formatted = billions % 1 === 0 ? `${billions}` : numbro(billions).format({ mantissa: 1, trimMantissa: true });
    return `${sign}${formatted}억원`;
  }

  if (absValue >= 1_0000) {
    const tenThousands = absValue / 1_0000;
    const formatted = tenThousands % 1 === 0 ? `${tenThousands}` : numbro(tenThousands).format({ mantissa: 0 });
    return `${sign}${formatted}만원`;
  }

  return formatCurrency(value);
}

export function formatDate(date: string | Date, formatStr: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr, { locale: ko });
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'yyyy-MM-dd HH:mm');
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: ko });
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${numbro(value).format({ mantissa: decimals, trimMantissa: true })}%`;
}

export function formatNumber(value: number): string {
  return numbro(value).format({ thousandSeparated: true, mantissa: 0 });
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone;
}
