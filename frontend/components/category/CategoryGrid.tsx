import CategoryCard from "./CategoryCard";
import { CategorySummary } from "@/types/category";

interface Props {
  categories: CategorySummary[];
}

export default function CategoryGrid({ categories }: Props) {
  if (!categories.length) {
    return <p className="empty-text">Chưa có danh mục nào.</p>;
  }

  return (
    <div className="category-grid">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
