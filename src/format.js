// 8500 -> "8,500", 8507.5 -> "8,507.50"
export const formatAmount = (n) => {
  const digits = Number.isInteger(Number(n)) ? 0 : 2;
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

export const formatMoney = (n) => `₹${formatAmount(n)}`;

export const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// "Today, 10:42 am", "Yesterday, 6:10 pm", "14 Oct, 3:05 pm" (year added if not this year).
export function formatWhen(value, now = new Date()) {
  const d = new Date(value);
  const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  const dayStart = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const daysAgo = Math.round((dayStart(now) - dayStart(d)) / 86400000);
  if (daysAgo === 0) return `Today, ${time}`;
  if (daysAgo === 1) return `Yesterday, ${time}`;
  const date = d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    ...(d.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
  });
  return `${date}, ${time}`;
}

export const formatDateTime = (value) =>
  new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
