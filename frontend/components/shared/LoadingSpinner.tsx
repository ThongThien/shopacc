export default function LoadingSpinner({
  text = "Đang tải...",
}: {
  text?: string;
}) {
  return (
    <div className="loading-box">
      <span className="loading-spinner" />
      <p>{text}</p>
    </div>
  );
}
