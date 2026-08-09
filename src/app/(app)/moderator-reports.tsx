import RoleFeatureScreen from "@/features/navigation/components/RoleFeatureScreen";

export default function ModeratorReportsScreen() {
  return (
    <RoleFeatureScreen
      allowedRoles={[
        "MODERATOR",
      ]}
      title="Reports"
      description="Review reported posts, comments and group members."
      icon="flag-outline"
      note="Reported content, the related user and the report reason will be reviewed here before taking moderation action."
    />
  );
}