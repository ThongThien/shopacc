"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Listing } from "@/types/listing";
import ListingGrid from "@/components/listing/ListingGrid";
import ListingToolbar from "@/components/listing/ListingToolbar";

interface Props {
  listings: Listing[];
  gameName?: string;
  categorySlug?: string;
  listingType?: string;
}

const PAGE_SIZE = 8;

const TYPE_TABS = [
  { key: "", label: "Tất cả" },
  { key: "ACCOUNT", label: "Tài khoản" },
  // { key: "ITEM", label: "Vật phẩm" },
];

export default function ListingBrowser({
  listings,
  gameName,
  categorySlug,
  listingType: initialType,
}: Props) {
  const router = useRouter();
  const [activeType, setActiveType] = useState(initialType || "");
  const [keyword, setKeyword] = useState("");
  const [serverName, setServerName] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  function handleTypeChange(key: string) {
    setActiveType(key);
    setPage(1);
  }

  function resetFilters() {
    setKeyword("");
    setServerName("");
    setPriceRange("");
    setSortBy("newest");
    setPage(1);
  }

  const filteredListings = useMemo(() => {
    const normalizedKeyword = normalizeText(keyword);
    const normalizedServer = normalizeText(serverName);

    return listings
      .filter((listing) => listing.status === "PUBLISHED")
      .filter((listing) => {
        if (!activeType) return true;
        return listing.listingType === activeType;
      })
      .filter((listing) => {
        if (!gameName) return true;
        return normalizeText(listing.gameName) === normalizeText(gameName);
      })
      .filter((listing) => {
        if (!categorySlug) return true;
        return slugify(listing.categoryName) === categorySlug;
      })
      .filter((listing) => {
        if (!normalizedKeyword) return true;
        const searchableText = normalizeText(
          `${listing.title} ${listing.description} ${listing.gameName} ${listing.categoryName}`,
        );
        return searchableText.includes(normalizedKeyword);
      })
      .filter((listing) => {
        if (!normalizedServer) return true;
        return normalizeText(listing.serverName).includes(normalizedServer);
      })
      .filter((listing) => {
        const price = Number(listing.price || 0);
        if (priceRange === "under-100k") return price < 100000;
        if (priceRange === "100k-500k")
          return price >= 100000 && price <= 500000;
        if (priceRange === "over-500k") return price > 500000;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
        if (sortBy === "price-asc") return Number(a.price) - Number(b.price);
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
        if (sortBy === "oldest") return aDate - bDate;
        return bDate - aDate;
      });
  }, [
    listings,
    gameName,
    categorySlug,
    activeType,
    keyword,
    serverName,
    priceRange,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredListings.length / PAGE_SIZE),
  );
  const paginatedListings = filteredListings.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <section>
      {/* Type Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTypeChange(tab.key)}
            className={activeType === tab.key ? "btn-primary" : "btn-secondary"}
            style={{ padding: "8px 16px", fontSize: 14 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ListingToolbar
        keyword={keyword}
        serverName={serverName}
        priceRange={priceRange}
        sortBy={sortBy}
        onKeywordChange={(value) => {
          setKeyword(value);
          setPage(1);
        }}
        onServerNameChange={(value) => {
          setServerName(value);
          setPage(1);
        }}
        onPriceRangeChange={(value) => {
          setPriceRange(value);
          setPage(1);
        }}
        onSortByChange={(value) => {
          setSortBy(value);
          setPage(1);
        }}
        onReset={resetFilters}
      />

      <div className="result-summary">
        Tìm thấy <b>{filteredListings.length}</b> sản phẩm phù hợp
      </div>

      <ListingGrid listings={paginatedListings} />

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-secondary"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Trước
          </button>
          <span>
            Trang {page}/{totalPages}
          </span>
          <button
            className="btn-secondary"
            disabled={page === totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Sau
          </button>
        </div>
      )}
    </section>
  );
}

function normalizeText(value: string | null | undefined) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

function slugify(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
