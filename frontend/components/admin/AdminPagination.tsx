interface Props {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function AdminPagination({
  page,
  totalItems,
  pageSize,
  onPageChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="admin-pagination">
      <p>
        Hiển thị {start}-{end} / {totalItems} bản ghi
      </p>

      <div>
        <button
          className="btn-secondary"
          disabled={page <= 1}
          type="button"
          onClick={() => onPageChange(page - 1)}
        >
          Trước
        </button>

        <span>
          Trang {page}/{totalPages}
        </span>

        <button
          className="btn-secondary"
          disabled={page >= totalPages}
          type="button"
          onClick={() => onPageChange(page + 1)}
        >
          Sau
        </button>
      </div>
    </div>
  );
}
