import RoleFeatureScreen from "@/features/navigation/components/RoleFeatureScreen";

export default function ModeratorGroupsScreen() {
  return (
    <RoleFeatureScreen
      allowedRoles={[
        "MODERATOR",
      ]}
      title="Groups"
      description="View the support groups assigned to you for moderation."
      icon="people-outline"
      note="The Moderator will monitor discussions only inside groups assigned by an Administrator."
    />
  );
}