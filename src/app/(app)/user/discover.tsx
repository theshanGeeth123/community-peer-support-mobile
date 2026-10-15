import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import SectionBanner from '@/features/branding/components/SectionBanner';
import { groupApi } from '@/features/groups/api/group.api';
import { groupMembershipApi } from '@/features/groups/api/groupMembership.api';
import type { SupportGroup } from '@/features/groups/types/group.types';
import type { GroupReference } from '@/features/groups/types/groupMembership.types';
import { getApiErrorMessage } from '@/services/api/apiError';
import { useTheme } from '@/theme/ThemeProvider';

function getGroupReferenceId(reference: GroupReference): string | null {
  if (typeof reference === 'string') return reference;
  return reference.id ?? reference._id ?? null;
}

export default function DiscoverGroupsScreen() {
  const { colors, isDark } = useTheme();
  const [groups, setGroups] = useState<SupportGroup[]>([]);
  const [joinedGroupIds, setJoinedGroupIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const [groupsResponse, membershipsResponse] = await Promise.all([
        groupApi.getGroups({ page: 1, limit: 100 }),
        groupMembershipApi.getMyJoinedGroups(),
      ]);
      setGroups(Array.isArray(groupsResponse.data.groups) ? groupsResponse.data.groups : []);
      const ids = new Set<string>();
      (membershipsResponse.data.memberships ?? []).forEach((membership) => {
        if (membership.status !== 'ACTIVE') return;
        const groupId = getGroupReferenceId(membership.group);
        if (groupId) ids.add(groupId);
      });
      setJoinedGroupIds(ids);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadData();
    return undefined;
  }, [loadData]));

  const availableGroups = useMemo(
    () => groups.filter((group) => !joinedGroupIds.has(group.id)),
    [groups, joinedGroupIds]
  );
  const categories = useMemo(() => [
    'All',
    ...Array.from(new Set(availableGroups.map((group) => group.category?.trim()).filter((item): item is string => !!item))).sort(),
  ], [availableGroups]);
  const matchingGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    return availableGroups.filter((group) => {
      if (category !== 'All' && group.category !== category) return false;
      if (!query) return true;
      return [group.name, group.category, group.description, group.communityLocation ?? '']
        .join(' ').toLowerCase().includes(query);
    });
  }, [availableGroups, category, search]);

  const resetFilters = () => { setSearch(''); setCategory('All'); };
  const hasFilters = !!search.trim() || category !== 'All';
  const refresh = () => { setRefreshing(true); void loadData(false); };
  const openGroup = (groupId: string) => {
    router.push({ pathname: '/(app)/user/group/[groupId]', params: { groupId } });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={[styles.back, { backgroundColor: colors.surfaceSecondary }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Discover groups</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.teal} colors={['#0E7C86']} />}
      >
        <SectionBanner
          eyebrow="FIND YOUR PEOPLE"
          title="Find a space that fits you."
          description="Explore communities, discover shared interests and connect at your own pace."
          icon="compass-outline"
        />

        <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={21} color={colors.teal} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search name, topic or location"
            placeholderTextColor={colors.subtle}
            returnKeyType="search"
            accessibilityLabel="Search available support groups"
            style={[styles.searchInput, { color: colors.text }]}
          />
          {search.length > 0 && (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={12} onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={21} color={colors.muted} />
            </Pressable>
          )}
        </View>

        {categories.length > 1 && (
          <View style={styles.categoriesBlock}>
            <Text style={[styles.overline, { color: colors.muted }]}>EXPLORE BY INTEREST</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {categories.map((item) => {
                const selected = category === item;
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter by ${item}`}
                    accessibilityState={{ selected }}
                    onPress={() => setCategory(item)}
                    style={[
                      styles.chip,
                      { borderColor: selected ? colors.teal : colors.border, backgroundColor: selected ? (isDark ? '#0D6770' : '#0E7C86') : colors.surface },
                    ]}
                  >
                    <Text style={[styles.chipLabel, { color: selected ? '#FFFFFF' : colors.text }]}>{item}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={styles.listHeading}>
          <View>
            <Text style={[styles.overline, { color: colors.teal }]}>COMMUNITIES</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Explore together</Text>
          </View>
          {!loading && !error && (
            <View style={[styles.countPill, { backgroundColor: colors.tealSoft }]}>
              <Text style={[styles.countText, { color: colors.teal }]}>{matchingGroups.length} shown</Text>
            </View>
          )}
        </View>

        {error && (
          <View style={[styles.feedback, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="cloud-offline-outline" size={27} color={colors.teal} />
            <Text style={[styles.feedbackTitle, { color: colors.text }]}>Couldn't load communities</Text>
            <Text style={[styles.feedbackCopy, { color: colors.muted }]}>{error}</Text>
            <Pressable accessibilityRole="button" onPress={() => void loadData()} style={[styles.feedbackButton, { backgroundColor: '#0E7C86' }]}>
              <Text style={styles.feedbackButtonText}>Try again</Text>
            </Pressable>
          </View>
        )}
        {!error && loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.teal} />
            <Text style={[styles.feedbackCopy, { color: colors.muted, marginTop: 13 }]}>Finding communities for you...</Text>
          </View>
        )}
        {!error && !loading && matchingGroups.length === 0 && (
          <View style={[styles.feedback, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.tealSoft }]}>
              <Ionicons name={hasFilters ? 'search-outline' : 'people-outline'} size={30} color={colors.teal} />
            </View>
            <Text style={[styles.feedbackTitle, { color: colors.text }]}>
              {hasFilters ? 'No matching groups yet' : 'No new groups right now'}
            </Text>
            <Text style={[styles.feedbackCopy, { color: colors.muted }]}>
              {hasFilters ? 'Try another topic or remove the selected filter.' : 'New support spaces will appear here when they are available.'}
            </Text>
            {hasFilters && (
              <Pressable accessibilityRole="button" onPress={resetFilters} style={[styles.feedbackButton, { backgroundColor: '#0E7C86' }]}>
                <Text style={styles.feedbackButtonText}>Clear filters</Text>
              </Pressable>
            )}
          </View>
        )}
        {!error && !loading && matchingGroups.map((group) => (
          <Pressable
            key={group.id}
            accessibilityRole="button"
            accessibilityLabel={`View ${group.name}`}
            onPress={() => openGroup(group.id)}
            style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.82 : 1 }]}
          >
            <View style={styles.cardRow}>
              <View style={[styles.groupIcon, { backgroundColor: colors.tealSoft }]}>
                <Ionicons name="people-outline" size={24} color={colors.teal} />
              </View>
              <View style={{ flex: 1, marginLeft: 13 }}>
                <Text numberOfLines={2} style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
                <Text style={[styles.groupCategory, { color: colors.teal }]}>{group.category}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </View>
            <Text numberOfLines={2} style={[styles.description, { color: colors.muted }]}>{group.description}</Text>
            <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
              <View style={styles.locationRow}>
                <Ionicons name="shield-checkmark-outline" size={15} color={colors.teal} />
                <Text style={[styles.footerLabel, { color: colors.muted }]}>Peer support</Text>
              </View>
              <View style={styles.locationRow}>
                <Text style={[styles.footerAction, { color: colors.teal }]}>View group</Text>
                <Ionicons name="arrow-forward" size={15} color={colors.teal} />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { height: 64, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18 },
  back: { height: 44, width: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800' },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  search: { height: 57, borderRadius: 18, borderWidth: 1, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  searchInput: { flex: 1, fontSize: 14, marginLeft: 10, paddingVertical: 9 },
  categoriesBlock: { marginTop: 21 },
  overline: { fontSize: 10, fontWeight: '900', letterSpacing: 1.25 },
  chips: { paddingVertical: 13, gap: 8, paddingRight: 16 },
  chip: { minHeight: 40, borderRadius: 14, paddingHorizontal: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  chipLabel: { fontSize: 12, fontWeight: '700' },
  listHeading: { marginTop: 20, marginBottom: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.45, marginTop: 4 },
  countPill: { borderRadius: 18, paddingVertical: 8, paddingHorizontal: 12 },
  countText: { fontSize: 11, fontWeight: '800' },
  card: { marginTop: 13, borderWidth: 1, borderRadius: 23, padding: 17, shadowColor: '#0E2A47', shadowOpacity: 0.025, shadowRadius: 9, shadowOffset: { width: 0, height: 4 }, elevation: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  groupIcon: { width: 49, height: 49, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  groupName: { fontSize: 15.5, fontWeight: '800', letterSpacing: -0.2 },
  groupCategory: { marginTop: 5, fontSize: 11.5, fontWeight: '700' },
  description: { marginTop: 14, fontSize: 13, lineHeight: 20 },
  cardFooter: { borderTopWidth: 1, marginTop: 15, paddingTop: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerLabel: { fontSize: 11, fontWeight: '600' },
  footerAction: { fontSize: 11.5, fontWeight: '800' },
  feedback: { borderWidth: 1, borderRadius: 24, paddingHorizontal: 23, paddingVertical: 34, marginTop: 16, alignItems: 'center' },
  emptyIcon: { width: 66, height: 66, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  feedbackTitle: { fontSize: 17, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  feedbackCopy: { fontSize: 12.5, textAlign: 'center', lineHeight: 19, marginTop: 9 },
  feedbackButton: { borderRadius: 14, paddingVertical: 13, paddingHorizontal: 23, marginTop: 18, minHeight: 44 },
  feedbackButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  loading: { alignItems: 'center', paddingVertical: 80 },
});
