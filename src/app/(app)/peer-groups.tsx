import RoleFeatureScreen from "@/features/navigation/components/RoleFeatureScreen";

export default function PeerGroupsScreen() {
  return (
    <RoleFeatureScreen
      allowedRoles={[
        "PEER_SUPPORTER",
      ]}
      title="My Groups"
      description="View the support groups assigned to you by an Administrator."
      icon="people-outline"
      note="The group assignment and member support functionality will be implemented on this page."
    />
  );
}