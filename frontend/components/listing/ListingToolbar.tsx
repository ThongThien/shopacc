"use client";

interface Props {
  keyword: string;
  serverName: string;
  priceRange: string;
  sortBy: string;
  onKeywordChange: (value: string) => void;
  onServerNameChange: (value: string) => void;
  onPriceRangeChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onReset: () => void;
}

export default function ListingToolbar({
  keyword,
  serverName,
  priceRange,
  sortBy,
  onKeywordChange,
  onServerNameChange,
  onPriceRangeChange,
  onSortByChange,
  onReset,
}: Props) {
  return (
    <section className="listing-toolbar">
      <div>
        <label>Từ khóa</label>
        <input
          className="input"
          placeholder="Tên acc, mô tả, bông tai..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
      </div>

      <div>
        <label>Server</label>
        <input
          className="input"
          placeholder="VD: 1, 7, Asia..."
          value={serverName}
          onChange={(e) => onServerNameChange(e.target.value)}
        />
      </div>

      <div>
        <label>Mức giá</label>
        <select
          className="input"
          value={priceRange}
          onChange={(e) => onPriceRangeChange(e.target.value)}
        >
          <option value="">Tất cả</option>
          <option value="under-100k">Dưới 100k</option>
          <option value="100k-500k">100k - 500k</option>
          <option value="over-500k">Trên 500k</option>
        </select>
      </div>

      <div>
        <label>Sắp xếp</label>
        <select
          className="input"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
        >
          <option value="newest">Ngày đăng mới nhất</option>
          <option value="oldest">Ngày đăng cũ nhất</option>
          <option value="price-desc">Giá cao đến thấp</option>
          <option value="price-asc">Giá thấp đến cao</option>
        </select>
      </div>

      <button className="btn-secondary" type="button" onClick={onReset}>
        Xóa lọc
      </button>
    </section>
  );
}
