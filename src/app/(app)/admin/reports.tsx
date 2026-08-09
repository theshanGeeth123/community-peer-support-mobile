import RoleTabPlaceholder from "@/features/navigation/components/RoleTabPlaceholder";

export default function AdminReportsScreen() {
  return (
    <RoleTabPlaceholder
      title="Admin Reports"
      description="Review serious or escalated moderation cases that require Administrator action."
      icon="flag-outline"
    />
  );
}