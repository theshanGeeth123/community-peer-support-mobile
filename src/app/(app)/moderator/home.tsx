import RoleTabPlaceholder from "@/features/navigation/components/RoleTabPlaceholder";

export default function ModeratorHomeScreen() {
  return (
    <RoleTabPlaceholder
      title="Moderator Home"
      description="View moderation responsibilities, assigned groups and reported-content updates."
      icon="shield-checkmark-outline"
    />
  );
}