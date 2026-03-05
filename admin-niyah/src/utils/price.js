export function toNumberPrice(value) {
  const parsed =
    typeof value === 'number'
      ? value
      : Number(String(value || '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatNumberPrice(value) {
  return toNumberPrice(value).toLocaleString('en-PK');
}

export function formatMoney(value, currency = 'PKR') {
  return `${currency} ${formatNumberPrice(value)}`;
}
