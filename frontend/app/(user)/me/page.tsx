import UserAccountOverview from "@/components/user/UserAccountOverview";
import UserProfile from "@/components/user/UserProfile";
import BalanceHistory from "@/components/user/BalanceHistory";

export default function MePage() {
  return (
    <div className="page-container user-profile-page">
      <UserAccountOverview />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 24,
          alignItems: "start",
        }}
      >
        <section>
          <UserProfile />
        </section>

        <section>
          <BalanceHistory />
        </section>
      </div>
    </div>
  );
}
