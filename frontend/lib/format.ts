export function formatCurrency(value: number | string | null | undefined) {
  const numberValue = Number(value || 0);

  return numberValue.toLocaleString("vi-VN") + " đ";
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "";

  const d = new Date(value);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function truncateText(text: string | null | undefined, max = 80) {
  if (!text) return "";

  if (text.length <= max) return text;

  return text.slice(0, max) + "...";
}
