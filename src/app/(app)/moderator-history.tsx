import RoleFeatureScreen from "@/features/navigation/components/RoleFeatureScreen";

export default function ModeratorHistoryScreen() {
  return (
    <RoleFeatureScreen
      allowedRoles={[
        "MODERATOR",
      ]}
      title="Moderation History"
      description="View previous moderation actions taken inside support groups."
      icon="time-outline"
      note="Warnings, removed content, suspensions and other completed moderation actions will be displayed here."
    />
  );
}