import RoleFeatureScreen from "@/features/navigation/components/RoleFeatureScreen";

export default function PeerJoinRequestsScreen() {
  return (
    <RoleFeatureScreen
      allowedRoles={[
        "PEER_SUPPORTER",
      ]}
      title="Join Requests"
      description="Review users who request permission to join your assigned support groups."
      icon="person-add-outline"
      note="The Peer Supporter will approve or reject pending group join requests from this page."
    />
  );
}