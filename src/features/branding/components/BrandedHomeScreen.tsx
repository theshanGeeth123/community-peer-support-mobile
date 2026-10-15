import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
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

import { useAuth } from '@/features/auth/hooks/useAuth';
import BrandMark from '@/features/branding/components/BrandMark';
import NeedsResponseQuickAction from '@/features/groups/components/NeedsResponseQuickAction';
import NotificationBell from '@/features/notifications/components/NotificationBell';
import { Brand } from '@/theme/brand';
import { useTheme } from '@/theme/ThemeProvider';

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

type HeroCopy = {
  eyebrow: string;
  heading: string;
  description: string;
  highlights: string[];
};

/** Two additional slides for each role; existing home copy remains slide one. */
const additionalHeroSlides: Record<HomeRole, HeroCopy[]> = {
  USER: [
    {
      eyebrow: 'DISCOVER YOUR SPACE',
      heading: 'Find a community\nthat feels right.',
      description: 'Explore peer-support groups, discover shared interests, and take the first step when you feel ready.',
      highlights: ['Explore', 'Discover', 'Connect'],
    },
    {
      eyebrow: 'A PLACE TO BELONG',
      heading: 'Good conversations\nstart with care.',
      description: 'Make space to listen, share your thoughts, and grow meaningful connections with your community.',
      highlights: ['Listen', 'Share', 'Grow'],
    },
  ],
  PEER_SUPPORTER: [
    {
      eyebrow: 'GUIDE WITH EMPATHY',
      heading: 'Help new voices\nfeel welcome.',
      description: 'Thoughtfully review requests and introduce members to supportive group conversations.',
      highlights: ['Welcome', 'Connect', 'Support'],
    },
    {
      eyebrow: 'BE PRESENT, BE KIND',
      heading: 'A listening ear\ncan make space.',
      description: 'Encourage respectful participation and help groups remain warm and welcoming.',
      highlights: ['Listen', 'Respect', 'Encourage'],
    },
  ],
  MODERATOR: [
    {
      eyebrow: 'CARE THROUGH ACTION',
      heading: 'Thoughtful reviews.\nStronger trust.',
      description: 'Address reported content with consistency, care and clear decisions.',
      highlights: ['Assess', 'Respond', 'Protect'],
    },
    {
      eyebrow: 'NURTURE EVERY SPACE',
      heading: 'Keep conversations\nrespectful.',
      description: 'Support healthy group participation with transparent and responsible moderation.',
      highlights: ['Guide', 'Moderate', 'Improve'],
    },
  ],
  ADMIN: [
    {
      eyebrow: 'BRING PEOPLE TOGETHER',
      heading: 'Build communities\nwith purpose.',
      description: 'Coordinate users, groups and access from one organized workspace.',
      highlights: ['Organize', 'Connect', 'Grow'],
    },
    {
      eyebrow: 'SUPPORT PLATFORM TRUST',
      heading: 'Better oversight.\nBetter experiences.',
      description: 'Monitor community activity and strengthen responsible management at every level.',
      highlights: ['Review', 'Support', 'Improve'],
    },
  ],
};

function ActionCard({ action, wide }: { action: HomeAction; wide?: boolean }) {
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.title}
      onPress={() => router.push(action.route as Href)}
      style={({ pressed }) => [themeStyles.action, wide && themeStyles.actionWide, pressed && themeStyles.pressed]}
    >
      <View style={[themeStyles.actionIcon, { backgroundColor: action.surface ?? Brand.softBlue }]}>
        <Ionicons name={action.icon} size={24} color={action.accent ?? Brand.teal} />
      </View>
      <Text style={themeStyles.actionTitle}>{action.title}</Text>
      <Text style={themeStyles.actionDescription}>{action.description}</Text>
      <View style={themeStyles.actionArrow}>
        <Ionicons name="arrow-forward" size={17} color={themeTone(Brand.teal, "color")} />
      </View>
    </Pressable>
  );
}

export default function BrandedHomeScreen({ role }: { role: HomeRole }) {
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();
  const { isDark, colors } = useTheme();
  const [heroIndex, setHeroIndex] = useState(0);
  const heroOpacity = useRef(new Animated.Value(1)).current;
  const heroOffset = useRef(new Animated.Value(0)).current;

  const { user } = useAuth();
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || 'there';
  const settings = roleSettings[role];
  const responseRoute = role === 'MODERATOR'
    ? '/(app)/moderator/needs-response'
    : '/(app)/peer-supporter/needs-response';
  const showResponse = role === 'MODERATOR' || role === 'PEER_SUPPORTER';
  const heroSlides: HeroCopy[] = [
    { eyebrow: settings.eyebrow, heading: settings.heading, description: settings.description, highlights: settings.highlights },
    ...additionalHeroSlides[role],
  ];
  const currentHero = heroSlides[heroIndex] ?? heroSlides[0];

  // Rotate every four seconds; clean up when the screen unmounts or role changes.
  useEffect(() => {
    setHeroIndex(0);
    const timer = setInterval(() => setHeroIndex((previous) => (previous + 1) % 3), 4000);
    return () => clearInterval(timer);
  }, [role]);

  useEffect(() => {
    heroOpacity.setValue(0.2);
    heroOffset.setValue(20);
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(heroOffset, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
    return () => { heroOpacity.stopAnimation(); heroOffset.stopAnimation(); };
  }, [heroIndex, heroOpacity, heroOffset]);

  return (
    <SafeAreaView style={themeStyles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={themeStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={themeStyles.topbar}>
          <BrandMark compact />
          <NotificationBell />
        </View>

        <View style={themeStyles.welcomeRow}>
          <View style={{ flex: 1 }}>
            <Text style={themeStyles.welcomeLabel}>Good to see you again</Text>
            <Text style={themeStyles.welcomeName}>Hello, {firstName}<Text style={themeStyles.welcomeDot}>.</Text></Text>
          </View>
          <View style={themeStyles.welcomeIcon}>
            <Ionicons name="sparkles-outline" size={21} color={themeTone(Brand.teal, "color")} />
          </View>
        </View>

        <View style={themeStyles.hero}>
          <View pointerEvents="none" style={themeStyles.heroOrbitOne} />
          <View pointerEvents="none" style={themeStyles.heroOrbitTwo} />
          <Image
            source={require('../../../../assets/images/logo.png')}
            style={themeStyles.heroMark}
            resizeMode="contain"
            accessible={false}
          />
          <Animated.View style={{ opacity: heroOpacity, transform: [{ translateX: heroOffset }] }}>
            <View style={themeStyles.heroBadge}>
              <View style={themeStyles.badgeDot} />
              <Text style={themeStyles.heroBadgeText}>{settings.badge}</Text>
            </View>
            <Text style={themeStyles.heroEyebrow}>{currentHero.eyebrow}</Text>
            <Text style={themeStyles.heroTitle}>{currentHero.heading}</Text>
            <Text style={themeStyles.heroDescription}>{currentHero.description}</Text>
            <View style={themeStyles.heroFooter}>
              {currentHero.highlights.map((item, index) => (
                <View key={item} style={themeStyles.heroHighlight}>
                  {index > 0 && <View style={themeStyles.highlightDot} />}
                  <Text style={themeStyles.heroHighlightText}>{item}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
          <View style={themeStyles.heroNavigation}>
            <View style={themeStyles.heroDots}>
              {heroSlides.map((slide, index) => (
                <Pressable
                  key={`${role}-${slide.eyebrow}`}
                  onPress={() => setHeroIndex(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Show home banner ${index + 1} of ${heroSlides.length}`}
                  style={[themeStyles.heroDot, { width: heroIndex === index ? 27 : 8, backgroundColor: heroIndex === index ? Brand.aqua : '#517987' }]}
                />
              ))}
            </View>
            <Text style={themeStyles.heroCounter}>0{heroIndex + 1} / 0{heroSlides.length}</Text>
          </View>
        </View>

        {role === 'USER' && (
          <View style={[themeStyles.wellbeingCard, { backgroundColor: isDark ? '#143C42' : '#DFF4EE', borderColor: isDark ? '#286067' : '#C8E8E0' }]}>
            <View style={[themeStyles.wellbeingIconFrame, { backgroundColor: isDark ? '#215560' : '#FFFFFF' }]}>
              <View style={themeStyles.wellbeingIconCore}>
                <Ionicons name="heart-outline" size={25} color="#FFFFFF" />
              </View>
            </View>
            <View style={themeStyles.wellbeingCopy}>
              <Text style={[themeStyles.wellbeingLabel, { color: colors.teal }]}>A MOMENT FOR YOU</Text>
              <Text style={[themeStyles.wellbeingTitle, { color: colors.text }]}>Your pace. Your space.</Text>
              <Text style={[themeStyles.wellbeingDescription, { color: colors.muted }]}>Take your time. Meaningful connection begins with feeling comfortable.</Text>
              <View style={themeStyles.wellbeingTagRow}>
                <Ionicons name="leaf-outline" size={13} color={colors.teal} />
                <Text style={[themeStyles.wellbeingTag, { color: colors.teal }]}>Gentle steps, genuine support</Text>
              </View>
            </View>
          </View>
        )}

        <View style={themeStyles.sectionHeading}>
          <View>
            <Text style={themeStyles.sectionEyebrow}>EXPLORE ALYVEN</Text>
            <Text style={themeStyles.sectionTitle}>Your quick actions</Text>
          </View>
          <View style={themeStyles.sectionIcon}><Ionicons name="grid-outline" size={19} color={themeTone(Brand.teal, "color")} /></View>
        </View>

        {showResponse && (
          <View style={themeStyles.responseContainer}>
            <NeedsResponseQuickAction href={responseRoute as Href} />
          </View>
        )}

        <View style={themeStyles.actionGrid}>
          {settings.actions.map((action) => <ActionCard action={action} key={action.route} />)}
        </View>

        <View style={themeStyles.closingCard}>
          <View style={themeStyles.closingIcon}><Ionicons name="heart-outline" size={19} color={themeTone(Brand.teal, "color")} /></View>
          <View style={{ flex: 1 }}>
            <Text style={themeStyles.closingTitle}>Connect. Share. Belong.</Text>
            <Text style={themeStyles.closingDescription}>Real people. Safer spaces. Brighter tomorrows.</Text>
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
  hero: { backgroundColor: Brand.navy, borderRadius: 29, minHeight: 306, paddingHorizontal: 23, paddingTop: 23, paddingBottom: 18, overflow: 'hidden', justifyContent: 'space-between' },
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
  heroNavigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  heroDots: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  heroDot: { height: 7, borderRadius: 4 },
  heroCounter: { color: '#9FD0D2', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  wellbeingCard: { marginTop: 16, padding: 16, borderRadius: 23, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  wellbeingIconFrame: { width: 64, height: 76, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  wellbeingIconCore: { height: 46, width: 46, borderRadius: 16, backgroundColor: '#0E7C86', alignItems: 'center', justifyContent: 'center' },
  wellbeingCopy: { flex: 1, paddingLeft: 14 },
  wellbeingLabel: { fontSize: 9, letterSpacing: 1.4, fontWeight: '900' },
  wellbeingTitle: { fontSize: 16, fontWeight: '800', marginTop: 5 },
  wellbeingDescription: { fontSize: 11.5, lineHeight: 17.5, marginTop: 5 },
  wellbeingTagRow: { flexDirection: 'row', gap: 5, alignItems: 'center', marginTop: 11 },
  wellbeingTag: { fontSize: 9.5, fontWeight: '700' },
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
