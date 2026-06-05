import NoticeBox from "@/components/layout/NoticeBox";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div>
        <NoticeBox type="login" />
        <LoginForm />
      </div>
    </div>
  );
}
