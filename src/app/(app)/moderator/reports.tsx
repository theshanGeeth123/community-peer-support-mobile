import RoleTabPlaceholder from "@/features/navigation/components/RoleTabPlaceholder";

export default function ModeratorReportsScreen() {
  return (
    <RoleTabPlaceholder
      title="Reports"
      description="Review reported posts, comments and users and take suitable moderation actions."
      icon="flag-outline"
    />
  );
}