interface Props {
  type?: "home" | "accounts" | "detail" | "login" | "deposit" | "orders";
}

const noticeMap = {
  home: {
    title: "Thông báo chung",
    items: [
      "Vui lòng đọc kỹ mô tả acc trước khi mua.",
      "Shop chỉ hỗ trợ khiếu nại nếu lỗi phát sinh từ thông tin shop cung cấp.",
      "Liên hệ Zalo 0772438318 nếu cần hỗ trợ.",
    ],
  },
  accounts: {
    title: "Lưu ý khi chọn acc",
    items: [
      "Dùng bộ lọc để tìm acc theo server, giá và từ khóa mô tả.",
      "Thông tin chi tiết sẽ hiển thị trong trang chi tiết acc.",
    ],
  },
  detail: {
    title: "Lưu ý trước khi mua",
    items: [
      "Hãy kiểm tra kỹ game, server, giá và mô tả trước khi xác nhận mua.",
      "Sau khi mua thành công, acc sẽ nằm trong lịch sử mua.",
    ],
  },
  login: {
    title: "Đăng nhập tài khoản",
    items: ["Không chia sẻ mật khẩu cho người khác."],
  },
  deposit: {
    title: "Lưu ý khi nạp tiền",
    items: ["Chuyển khoản đúng nội dung để hệ thống xác nhận nhanh hơn."],
  },
  orders: {
    title: "Lịch sử mua",
    items: [
      "Chỉ bạn mới xem được thông tin acc đã mua.",
      "Nếu acc lỗi, hãy liên hệ hỗ trợ trong thời gian sớm nhất.",
    ],
  },
};

export default function NoticeBox({ type = "home" }: Props) {
  const notice = noticeMap[type];

  return (
    <section className="notice-box">
      <h3>{notice.title}</h3>

      {notice.items.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </section>
  );
}
