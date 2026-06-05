import HomeCategorySection from "@/components/home/HomeCategorySection";
import NoticeBox from "@/components/layout/NoticeBox";
import { getPublicHomeData } from "@/services/listing.service";

export default async function HomePage() {
  const homeData = await getPublicHomeData();

  return (
    <div className="page-container">
      <NoticeBox type="home" />

      <section className="page-heading">
        <h1>Kho acc game</h1>
        <p>Chọn game và danh mục acc phù hợp với nhu cầu của bạn.</p>
      </section>

      <div className="home-sections">
        {homeData.map((section) => (
          <HomeCategorySection key={section.gameName} section={section} />
        ))}
      </div>
    </div>
  );
}
