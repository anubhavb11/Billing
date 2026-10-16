// 8500 -> "8,500", 8507.5 -> "8,507.50"
export const formatAmount = (n) => {
  const digits = Number.isInteger(Number(n)) ? 0 : 2;
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

export const formatMoney = (n) => `₹${formatAmount(n)}`;

export const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDateTime = (value) =>
  new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
