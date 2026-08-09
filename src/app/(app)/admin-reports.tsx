import RoleFeatureScreen from "@/features/navigation/components/RoleFeatureScreen";

export default function AdminReportsScreen() {
  return (
    <RoleFeatureScreen
      allowedRoles={[
        "ADMIN",
      ]}
      title="Reports"
      description="Review serious or escalated moderation cases that require Administrator attention."
      icon="flag-outline"
      note="Normal reports will be handled by Moderators. Serious cases can later be escalated to the Administrator."
    />
  );
}