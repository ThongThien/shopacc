import Link from "next/link";
import { CategorySummary } from "@/types/category";

interface Props {
  category: CategorySummary;
}

export default function CategoryCard({ category }: Props) {
  return (
    <Link href={`/accounts/${category.slug}`} className="category-card">
      <div className="category-card-image">
        <img
          src={category.thumbnail || "/placeholder.png"}
          alt={category.name}
        />
      </div>

      <div className="category-card-body">
        <h3>{category.name}</h3>

        <p>
          Đã bán <b>{category.soldCount}</b>
        </p>

        <p>
          Còn <b>{category.availableCount}</b>
        </p>

        <span>Xem danh sách →</span>
      </div>
    </Link>
  );
}
