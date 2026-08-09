import AdminUsersScreen from "../(admin)/users";

import RoleGuard from "@/features/navigation/components/RoleGuard";

export default function AdminUsersTabScreen() {
  return (
    <RoleGuard
      allowedRoles={[
        "ADMIN",
      ]}
    >
      <AdminUsersScreen />
    </RoleGuard>
  );
}