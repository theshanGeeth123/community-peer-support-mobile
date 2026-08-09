import RoleTabPlaceholder from "@/features/navigation/components/RoleTabPlaceholder";

export default function ModeratorGroupsScreen() {
  return (
    <RoleTabPlaceholder
      title="Groups"
      description="View only the groups assigned to this Moderator by an Administrator."
      icon="people-outline"
    />
  );
}