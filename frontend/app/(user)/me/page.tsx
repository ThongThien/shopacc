import UserAccountOverview from "@/components/user/UserAccountOverview";
import UserProfile from "@/components/user/UserProfile";

export default function MePage() {
  return (
    <div className="page-container user-profile-page">
      <UserAccountOverview />
      <UserProfile />
    </div>
  );
}
