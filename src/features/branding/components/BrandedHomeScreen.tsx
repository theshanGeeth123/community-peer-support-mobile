import { type ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { type Href, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

import { useAuth } from '@/features/auth/hooks/useAuth';
import BrandMark from '@/features/branding/components/BrandMark';
import NeedsResponseQuickAction from '@/features/groups/components/NeedsResponseQuickAction';
import NotificationBell from '@/features/notifications/components/NotificationBell';
import { Brand } from '@/theme/brand';

type HomeRole = 'USER' | 'PEER_SUPPORTER' | 'MODERATOR' | 'ADMIN';
type IconName = keyof typeof Ionicons.glyphMap;

type HomeAction = {
  title: string;
  description: string;
  icon: IconName;
  route: string;
  accent?: string;
  surface?: string;
};

const roleSettings: Record<HomeRole, {
  badge: string;
  eyebrow: string;
  heading: string;
  description: string;
  actions: HomeAction[];
  highlights: string[];
}> = {
  USER: {
    badge: 'YOUR SPACE',
    eyebrow: 'WELCOME TO YOUR COMMUNITY',
    heading: 'A place to feel\nheard & connected.',
    description: 'Find supportive groups, share at your own pace, and build meaningful connections.',
    highlights: ['Connect', 'Share', 'Belong'],
    actions: [
      { title: 'Discover groups', description: 'Explore communities that feel right for you.', icon: 'compass-outline', route: '/(app)/user/discover', accent: Brand.teal, surface: Brand.softTeal },
      { title: 'My groups', description: 'Your conversations and trusted spaces.', icon: 'people-outline', route: '/(app)/user/groups' },
      { title: 'Community wall', description: 'Read and join supportive discussions.', icon: 'chatbubbles-outline', route: '/(app)/user/community' },
      { title: 'My profile', description: 'Manage your personal experience.', icon: 'person-outline', route: '/(app)/user/profile' },
    ],
  },
  PEER_SUPPORTER: {
    badge: 'PEER SUPPORTER',
    eyebrow: 'THANK YOU FOR SHOWING UP',
    heading: 'Your presence\nmakes a difference.',
    description: 'Welcome new members and nurture positive, respectful connections.',
    highlights: ['Listen', 'Guide', 'Support'],
    actions: [
      { title: 'Join requests', description: 'Review new membership requests.', icon: 'person-add-outline', route: '/(app)/peer-supporter/join-requests' },
      { title: 'My groups', description: 'Look after the spaces you support.', icon: 'people-outline', route: '/(app)/peer-supporter/my-groups' },
      { title: 'Community wall', description: 'Stay connected with the community.', icon: 'chatbubbles-outline', route: '/(app)/peer-supporter/community' },
    ],
  },
  MODERATOR: {
    badge: 'MODERATOR',
    eyebrow: 'BUILDING SAFER SPACES',
    heading: 'Keep every space\nsafe and welcoming.',
    description: 'Review reports and help conversations remain respectful and supportive.',
    highlights: ['Review', 'Protect', 'Support'],
    actions: [
      { title: 'Reported content', description: 'Review cases that need attention.', icon: 'flag-outline', route: '/(app)/moderator/reports' },
      { title: 'Action history', description: 'See previous moderation decisions.', icon: 'time-outline', route: '/(app)/moderator/history' },
      { title: 'Manage groups', description: 'Keep community spaces healthy.', icon: 'people-outline', route: '/(app)/moderator/groups' },
    ],
  },
  ADMIN: {
    badge: 'ADMINISTRATION',
    eyebrow: 'THE ALYVEN WORKSPACE',
    heading: 'Lead with care.\nManage with clarity.',
    description: 'Oversee your community, user access, and platform safety in one place.',
    highlights: ['People', 'Safety', 'Quality'],
    actions: [
      { title: 'User management', description: 'Manage accounts, roles and access.', icon: 'people-outline', route: '/(app)/admin/users' },
      { title: 'Group management', description: 'Review and coordinate groups.', icon: 'albums-outline', route: '/(app)/admin/groups' },
      { title: 'Reports overview', description: 'See moderation reports and outcomes.', icon: 'shield-checkmark-outline', route: '/(app)/admin/reports' },
      { title: 'Community wall', description: 'Stay in touch with the community.', icon: 'chatbubbles-outline', route: '/(app)/admin/community' },
    ],
  },
};

function ActionCard({ action, wide }: { action: HomeAction; wide?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.title}
      onPress={() => router.push(action.route as Href)}
      style={({ pressed }) => [styles.action, wide && styles.actionWide, pressed && styles.pressed]}
    >
      <View style={[styles.actionIcon, { backgroundColor: action.surface ?? Brand.softBlue }]}>
        <Ionicons name={action.icon} size={24} color={action.accent ?? Brand.teal} />
      </View>
      <Text style={styles.actionTitle}>{action.title}</Text>
      <Text style={styles.actionDescription}>{action.description}</Text>
      <View style={styles.actionArrow}>
        <Ionicons name="arrow-forward" size={17} color={Brand.teal} />
      </View>
    </Pressable>
  );
}

export default function BrandedHomeScreen({ role }: { role: HomeRole }) {
  const { user } = useAuth();
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || 'there';
  const settings = roleSettings[role];
  const responseRoute = role === 'MODERATOR'
    ? '/(app)/moderator/needs-response'
    : '/(app)/peer-supporter/needs-response';
  const showResponse = role === 'MODERATOR' || role === 'PEER_SUPPORTER';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topbar}>
          <BrandMark compact />
          <NotificationBell />
        </View>

        <View style={styles.welcomeRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeLabel}>Good to see you again</Text>
            <Text style={styles.welcomeName}>Hello, {firstName}<Text style={styles.welcomeDot}>.</Text></Text>
          </View>
          <View style={styles.welcomeIcon}>
            <Ionicons name="sparkles-outline" size={21} color={Brand.teal} />
          </View>
        </View>

        <View style={styles.hero}>
          <View pointerEvents="none" style={styles.heroOrbitOne} />
          <View pointerEvents="none" style={styles.heroOrbitTwo} />
          <View style={styles.heroBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.heroBadgeText}>{settings.badge}</Text>
          </View>
          <Text style={styles.heroEyebrow}>{settings.eyebrow}</Text>
          <Text style={styles.heroTitle}>{settings.heading}</Text>
          <Text style={styles.heroDescription}>{settings.description}</Text>
          <View style={styles.heroFooter}>
            {settings.highlights.map((item, index) => (
              <View key={item} style={styles.heroHighlight}>
                {index > 0 && <View style={styles.highlightDot} />}
                <Text style={styles.heroHighlightText}>{item}</Text>
              </View>
            ))}
          </View>
          <Image
            source={require('../../../../assets/images/logo.png')}
            style={styles.heroMark}
            resizeMode="contain"
            accessible={false}
          />
        </View>

        {role === 'USER' && (
          <View style={styles.wellbeingCard}>
            <View style={styles.wellbeingAnimation}>
              <LottieView
                source={require('../../../../assets/animations/breathing-pulse.json')}
                autoPlay
                loop
                style={styles.animation}
              />
            </View>
            <View style={styles.wellbeingCopy}>
              <Text style={styles.wellbeingLabel}>A GENTLE REMINDER</Text>
              <Text style={styles.wellbeingTitle}>Make room for yourself.</Text>
              <Text style={styles.wellbeingDescription}>A little moment of calm can go a long way.</Text>
            </View>
          </View>
        )}

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>EXPLORE ALYVEN</Text>
            <Text style={styles.sectionTitle}>Your quick actions</Text>
          </View>
          <View style={styles.sectionIcon}><Ionicons name="grid-outline" size={19} color={Brand.teal} /></View>
        </View>

        {showResponse && (
          <View style={styles.responseContainer}>
            <NeedsResponseQuickAction href={responseRoute as Href} />
          </View>
        )}

        <View style={styles.actionGrid}>
          {settings.actions.map((action) => <ActionCard action={action} key={action.route} />)}
        </View>

        <View style={styles.closingCard}>
          <View style={styles.closingIcon}><Ionicons name="heart-outline" size={19} color={Brand.teal} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.closingTitle}>Connect. Share. Belong.</Text>
            <Text style={styles.closingDescription}>Real people. Safer spaces. Brighter tomorrows.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.background },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 42, paddingTop: 12 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18 },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  welcomeLabel: { color: Brand.secondaryText, fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
  welcomeName: { color: Brand.navy, fontSize: 28, letterSpacing: -0.8, fontWeight: '800', marginTop: 4 },
  welcomeDot: { color: Brand.teal },
  welcomeIcon: { width: 44, height: 44, backgroundColor: Brand.mint, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  hero: { backgroundColor: Brand.navy, borderRadius: 29, minHeight: 262, paddingHorizontal: 23, paddingTop: 23, paddingBottom: 21, overflow: 'hidden' },
  heroOrbitOne: { position: 'absolute', backgroundColor: '#14536B', height: 250, width: 250, borderRadius: 125, top: -124, right: -130, opacity: 0.55 },
  heroOrbitTwo: { position: 'absolute', borderWidth: 40, borderColor: '#166A76', height: 230, width: 230, borderRadius: 115, bottom: -167, right: -80, opacity: 0.6 },
  heroBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#245069', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7 },
  badgeDot: { backgroundColor: Brand.aqua, width: 6, height: 6, borderRadius: 3, marginRight: 7 },
  heroBadgeText: { color: Brand.mint, fontSize: 10, letterSpacing: 1.2, fontWeight: '800' },
  heroEyebrow: { color: Brand.aqua, marginTop: 22, fontSize: 10, letterSpacing: 1.45, fontWeight: '800' },
  heroTitle: { color: Brand.white, fontSize: 28, lineHeight: 35, marginTop: 8, fontWeight: '800', letterSpacing: -0.55, maxWidth: '89%' },
  heroDescription: { color: '#CDE1E5', fontSize: 13.5, lineHeight: 21, marginTop: 12, maxWidth: '83%' },
  heroFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 21, flexWrap: 'wrap' },
  heroHighlight: { flexDirection: 'row', alignItems: 'center' },
  highlightDot: { height: 3, width: 3, borderRadius: 2, backgroundColor: Brand.aqua, marginHorizontal: 10 },
  heroHighlightText: { color: Brand.aqua, fontSize: 11, fontWeight: '700' },
  heroMark: { width: 95, height: 95, position: 'absolute', right: -15, top: 43, opacity: 0.14 },
  wellbeingCard: { marginTop: 16, padding: 16, borderRadius: 23, backgroundColor: Brand.mint, flexDirection: 'row', alignItems: 'center' },
  wellbeingAnimation: { width: 80, height: 80, backgroundColor: '#F7FFFD', borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  animation: { width: 108, height: 108 },
  wellbeingCopy: { flex: 1, paddingLeft: 14 },
  wellbeingLabel: { fontSize: 9, color: Brand.teal, letterSpacing: 1.1, fontWeight: '800' },
  wellbeingTitle: { fontSize: 16, color: Brand.navy, fontWeight: '800', marginTop: 5 },
  wellbeingDescription: { fontSize: 12, lineHeight: 18, color: '#376A74', marginTop: 5 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 27, marginBottom: 15 },
  sectionEyebrow: { color: Brand.teal, fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  sectionTitle: { color: Brand.navy, fontSize: 21, fontWeight: '800', marginTop: 4, letterSpacing: -0.45 },
  sectionIcon: { height: 37, width: 37, borderRadius: 12, backgroundColor: Brand.softTeal, alignItems: 'center', justifyContent: 'center' },
  responseContainer: { marginBottom: 11 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  action: { backgroundColor: Brand.white, width: '48.4%', minHeight: 185, borderRadius: 23, borderWidth: 1, borderColor: Brand.border, padding: 16, marginBottom: 12, shadowColor: Brand.navy, shadowOpacity: 0.035, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 1 },
  actionWide: { width: '100%' },
  pressed: { opacity: 0.83, transform: [{ scale: 0.985 }] },
  actionIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { color: Brand.navy, fontSize: 15, fontWeight: '800', marginTop: 15 },
  actionDescription: { color: Brand.secondaryText, fontSize: 11.7, lineHeight: 17, marginTop: 5, marginBottom: 14 },
  actionArrow: { alignItems: 'flex-end', position: 'absolute', bottom: 13, right: 15 },
  closingCard: { borderRadius: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: Brand.softTeal, padding: 17, marginTop: 9 },
  closingIcon: { height: 38, width: 38, borderRadius: 13, backgroundColor: Brand.mint, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  closingTitle: { color: Brand.navy, fontWeight: '800', fontSize: 14 },
  closingDescription: { color: Brand.secondaryText, fontSize: 11, marginTop: 3 },
});
