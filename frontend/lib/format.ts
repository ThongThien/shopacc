export function formatCurrency(value: number | string | null | undefined) {
  const numberValue = Number(value || 0);

  return numberValue.toLocaleString("vi-VN") + " đ";
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "";

  return new Date(value).toLocaleString("vi-VN");
}

export function truncateText(text: string | null | undefined, max = 80) {
  if (!text) return "";

  if (text.length <= max) return text;

  return text.slice(0, max) + "...";
}
