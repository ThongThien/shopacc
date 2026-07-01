import UserAccountOverview from "@/components/user/UserAccountOverview";
import UserProfile from "@/components/user/UserProfile";
import BalanceHistory from "@/components/user/BalanceHistory";

export default function MePage() {
  return (
    <div className="page-container user-profile-page">
      <UserAccountOverview />
      <UserProfile />
      <BalanceHistory />
    </div>
  );
}
