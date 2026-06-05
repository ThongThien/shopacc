import CategoryCard from "@/components/category/CategoryCard";
import { HomeGameSection } from "@/types/category";

interface Props {
  section: HomeGameSection;
}

export default function HomeCategorySection({ section }: Props) {
  return (
    <section className="home-category-section">
      <div className="section-title">
        <h2>{section.gameName}</h2>
        <p>{section.categories.length} danh mục đang mở bán</p>
      </div>

      <div className="category-grid">
        {section.categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
