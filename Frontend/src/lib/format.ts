export function formatFCFA(amount: number | string): string {
  const val = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (isNaN(val)) return '0 FCFA';
  return Math.round(val).toLocaleString('fr-FR').replace(/\s/g, ' ') + ' FCFA';
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
