import RoleTabPlaceholder from "@/features/navigation/components/RoleTabPlaceholder";

export default function ModeratorHistoryScreen() {
  return (
    <RoleTabPlaceholder
      title="Moderation History"
      description="View previous warnings, removed content, suspensions and other moderation actions."
      icon="time-outline"
    />
  );
}