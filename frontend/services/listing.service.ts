import { apiFetch } from "@/lib/api";
import { Listing, ListingDetail } from "@/types/listing";
import { HomeGameSection } from "@/types/category";

export async function getListings(): Promise<Listing[]> {
  return apiFetch<Listing[]>("/api/listings", {
    auth: false,
  });
}

export async function getListingDetail(id: number): Promise<ListingDetail> {
  return apiFetch<ListingDetail>(`/api/listings/${id}`, {
    auth: false,
  });
}

/**
 * Tạm thời build home data từ listings public.
 * Sau này BE có API /home/categories thì đổi tại đây, không cần sửa UI.
 */
export async function getPublicHomeData(): Promise<HomeGameSection[]> {
  const listings = await getListings();

  const grouped = new Map<
    string,
    Map<string, HomeGameSection["categories"][number]>
  >();

  for (const listing of listings) {
    const gameName = listing.gameName || "Khác";
    const categoryName = listing.categoryName || "Chưa phân loại";
    const categorySlug = slugify(categoryName);

    if (!grouped.has(gameName)) {
      grouped.set(gameName, new Map());
    }

    const categoryMap = grouped.get(gameName)!;

    if (!categoryMap.has(categorySlug)) {
      categoryMap.set(categorySlug, {
        id: categoryMap.size + 1,
        name: categoryName,
        slug: categorySlug,
        thumbnail: listing.thumbnail,
        soldCount: 0,
        availableCount: 0,
      });
    }

    const category = categoryMap.get(categorySlug)!;

    if (listing.status === "SOLD_OUT") {
      category.soldCount += 1;
    } else if (listing.status === "PUBLISHED") {
      category.availableCount += 1;
    }
  }

  return Array.from(grouped.entries()).map(([gameName, categoryMap]) => ({
    gameName,
    categories: Array.from(categoryMap.values()),
  }));
}

export async function getListingsByCategorySlug(
  categorySlug: string,
): Promise<Listing[]> {
  const listings = await getListings();

  return listings.filter(
    (listing) => slugify(listing.categoryName) === categorySlug,
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
