// Asset cố định cho homepage — không lưu DB
// Mỗi game có bộ 3 ảnh: {game-slug}/account.png, item.png, service.png
// Đặt trong /public/assets/{game-slug}/

function slugify(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function getTypeAsset(gameName: string, type: string): string {
  const slug = slugify(gameName);
  return `/assets/${slug}/${type.toLowerCase()}.png`;
}