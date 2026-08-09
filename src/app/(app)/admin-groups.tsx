import RoleFeatureScreen from "@/features/navigation/components/RoleFeatureScreen";

export default function AdminGroupsScreen() {
  return (
    <RoleFeatureScreen
      allowedRoles={[
        "ADMIN",
      ]}
      title="Group Management"
      description="Create and manage support groups and assign Peer Supporters and Moderators."
      icon="layers-outline"
      note="The complete group management foundation will be implemented here in the group-management feature branch."
    />
  );
}