export default function CategoryToolbar() {
  return (
    <section className="listing-toolbar">
      <div>
        <label>Tìm danh mục</label>

        <input className="input" placeholder="Acc VIP, Acc sơ sinh..." />
      </div>

      <button className="btn-primary">Tìm</button>
    </section>
  );
}
