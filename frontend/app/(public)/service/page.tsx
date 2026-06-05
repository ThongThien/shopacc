import NoticeBox from "@/components/layout/NoticeBox";

export default function ServicesPage() {
  return (
    <div className="page-container">
      <NoticeBox type="home" />

      <section className="page-heading">
        <h1>Dịch vụ</h1>
        <p>
          Khu vực dành cho các dịch vụ mở rộng như ngọc, vàng, vật phẩm hoặc hỗ
          trợ game. Nội dung sẽ được cập nhật sau.
        </p>
      </section>

      <div className="card service-placeholder">
        <h2>Sắp ra mắt</h2>
        <p>
          Hiện tại shop tập trung vào bán acc. Các dịch vụ khác sẽ dùng chung
          layout này khi được mở rộng.
        </p>
      </div>
    </div>
  );
}
