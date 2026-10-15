import { useCallback, useRef, useState } from 'react';
import {
  Image,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { completeOnboarding } from '@/features/onboarding/onboarding.storage';
import { useTheme } from '@/theme/ThemeProvider';

type IconName = keyof typeof Ionicons.glyphMap;

type IntroSlide = {
  label: string;
  heading: string;
  description: string;
  icon: IconName;
};

const SLIDES: readonly IntroSlide[] = [
  {
    label: '01  /  DISCOVER',
    heading: 'Find your people.\nFind your space.',
    description: 'Explore supportive communities around shared interests and experiences, at your own pace.',
    icon: 'compass-outline',
  },
  {
    label: '02  /  FEEL SAFE',
    heading: 'A thoughtful way\nto connect.',
    description: 'Request access to groups and participate in spaces guided by care, respect and moderation.',
    icon: 'shield-checkmark-outline',
  },
  {
    label: '03  /  BELONG',
    heading: 'Every voice\nhas a place.',
    description: 'Share, listen and build meaningful connections in a welcoming peer-support community.',
    icon: 'chatbubbles-outline',
  },
];

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const { isDark, colors } = useTheme();
  const [active, setActive] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const pagerRef = useRef<ScrollView>(null);
  const pageWidth = Math.max(240, width - 40);
  const artworkHeight = Math.min(295, Math.max(205, height * 0.355));
  const navy = isDark ? '#0D3041' : '#0E2A47';
  const soft = isDark ? '#173D47' : '#EAF8F5';
  const mid = isDark ? '#1E4854' : '#EDF5F4';

  const finish = useCallback(async () => {
    if (finishing) return;
    setFinishing(true);
    await completeOnboarding();
    router.replace('/(auth)/login');
  }, [finishing]);

  const goTo = useCallback((index: number) => {
    const safeIndex = Math.max(0, Math.min(SLIDES.length - 1, index));
    setActive(safeIndex);
    pagerRef.current?.scrollTo({ x: safeIndex * pageWidth, animated: true });
  }, [pageWidth]);

  const onPageSettled = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    setActive(Math.max(0, Math.min(SLIDES.length - 1, next)));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../assets/images/alyven-app-icon.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="ALYVEN logo"
          />
          <View>
            <Text style={[styles.brandName, { color: colors.text }]}>ALYVEN</Text>
            <Text style={[styles.brandTagline, { color: colors.muted }]}>A Place to Be Heard.</Text>
          </View>
        </View>
        <Pressable
          onPress={() => { void finish(); }}
          disabled={finishing}
          accessibilityRole="button"
          accessibilityLabel="Skip introduction"
          style={({ pressed }) => [styles.skipButton, { backgroundColor: colors.surfaceSecondary, opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={[styles.skipText, { color: colors.text }]}>Skip</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        style={styles.pager}
        onMomentumScrollEnd={onPageSettled}
        accessibilityLabel="Introduction pages"
      >
        {SLIDES.map((slide, index) => (
          <View key={slide.label} style={[styles.slide, { width: pageWidth }]}>
            <View style={[styles.artwork, { height: artworkHeight, backgroundColor: mid, borderColor: colors.border }]}>
              <View style={[styles.artOrbTop, { backgroundColor: soft }]} />
              <View style={[styles.artOrbBottom, { borderColor: isDark ? '#286F78' : '#C4E9E4' }]} />
              <View style={[styles.artTopPill, { backgroundColor: colors.surface }]}>
                <View style={[styles.onlineDot, { backgroundColor: '#27BEAD' }]} />
                <Text style={[styles.artTopText, { color: colors.text }]}>CONNECT  ·  SHARE  ·  BELONG</Text>
              </View>
              {index === 0 && (
                <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.previewIcon, { backgroundColor: soft }]}>
                    <Ionicons name="people-outline" size={26} color={colors.teal} />
                  </View>
                  <Text style={[styles.previewTitle, { color: colors.text }]}>Discover communities</Text>
                  <Text style={[styles.previewSub, { color: colors.muted }]}>Spaces shaped by connection</Text>
                  <View style={styles.miniPillRow}>
                    <View style={[styles.miniPill, { backgroundColor: soft }]}><Text style={[styles.miniText, { color: colors.teal }]}>Wellbeing</Text></View>
                    <View style={[styles.miniPill, { backgroundColor: soft }]}><Text style={[styles.miniText, { color: colors.teal }]}>Belonging</Text></View>
                  </View>
                  <View style={[styles.previewBottom, { borderTopColor: colors.border }]}>
                    <Text style={[styles.previewFoot, { color: colors.muted }]}>A community for everyone</Text>
                    <Ionicons name="arrow-forward-circle" color={colors.teal} size={24} />
                  </View>
                </View>
              )}
              {index === 1 && (
                <View style={[styles.safeVisual, { backgroundColor: navy }]}>
                  <View style={[styles.safeIcon, { backgroundColor: '#1C5261' }]}>
                    <Ionicons name="shield-checkmark-outline" size={42} color="#9CE6DA" />
                  </View>
                  <Text style={styles.safeVisualTitle}>Connection with care.</Text>
                  <View style={styles.safetyRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#9CE6DA" />
                    <Text style={styles.safetyText}>Thoughtful group access</Text>
                  </View>
                  <View style={styles.safetyRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#9CE6DA" />
                    <Text style={styles.safetyText}>Respectful participation</Text>
                  </View>
                  <View style={styles.safetyRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#9CE6DA" />
                    <Text style={styles.safetyText}>Community moderation</Text>
                  </View>
                </View>
              )}
              {index === 2 && (
                <View style={[styles.conversationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.conversationHeader}>
                    <View style={[styles.chatIcon, { backgroundColor: soft }]}>
                      <Ionicons name="chatbubbles-outline" size={23} color={colors.teal} />
                    </View>
                    <View>
                      <Text style={[styles.previewTitle, { color: colors.text }]}>A welcoming space</Text>
                      <Text style={[styles.previewSub, { color: colors.muted }]}>Listen • Share • Grow</Text>
                    </View>
                  </View>
                  <View style={[styles.bubbleLeft, { backgroundColor: colors.surfaceSecondary }]}>
                    <Text style={[styles.chatText, { color: colors.text }]}>Glad to be here.</Text>
                  </View>
                  <View style={[styles.bubbleRight, { backgroundColor: navy }]}>
                    <Text style={styles.chatReply}>There's room for you here.</Text>
                  </View>
                  <View style={[styles.chatFooter, { borderTopColor: colors.border }]}>
                    <Ionicons name="heart-outline" size={15} color={colors.teal} />
                    <Text style={[styles.chatFooterText, { color: colors.muted }]}>Small conversations. Meaningful connection.</Text>
                  </View>
                </View>
              )}
              <View style={[styles.cornerBadge, { backgroundColor: '#0E7C86' }]}>
                <Ionicons name={slide.icon} size={19} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.copy}>
              <Text style={[styles.stepLabel, { color: colors.teal }]}>{slide.label}</Text>
              <Text style={[styles.heading, { color: colors.text }]}>{slide.heading}</Text>
              <Text style={[styles.description, { color: colors.muted }]}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <View style={styles.pagination}>
          {SLIDES.map((slide, index) => (
            <Pressable
              key={slide.label}
              onPress={() => goTo(index)}
              accessibilityRole="button"
              accessibilityLabel={`Go to introduction page ${index + 1}`}
              style={[styles.pageIndicator, { width: index === active ? 29 : 8, backgroundColor: index === active ? colors.teal : colors.border }]}
            />
          ))}
        </View>
        <Pressable
          onPress={() => { active === SLIDES.length - 1 ? void finish() : goTo(active + 1); }}
          disabled={finishing}
          accessibilityRole="button"
          accessibilityLabel={active === SLIDES.length - 1 ? 'Get started' : 'Next introduction page'}
          style={({ pressed }) => [styles.mainButton, { backgroundColor: isDark ? '#0D7D86' : '#0E7C86', opacity: finishing ? 0.6 : pressed ? 0.88 : 1 }]}
        >
          <Text style={styles.mainButtonText}>{active === SLIDES.length - 1 ? 'Get Started' : 'Continue'}</Text>
          <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
        </Pressable>
        <Pressable onPress={() => { void finish(); }} disabled={finishing} accessibilityRole="button" style={styles.signInButton}>
          <Text style={[styles.signInText, { color: colors.muted }]}>Already a member?  <Text style={{ color: colors.teal, fontWeight: '800' }}>Sign in</Text></Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 20 },
  topBar: { height: 77, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 43, height: 43, borderRadius: 13 },
  brandName: { fontSize: 17, fontWeight: '900', letterSpacing: 3.1 },
  brandTagline: { fontSize: 9.5, fontWeight: '600', letterSpacing: 0.4, marginTop: 1 },
  skipButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, paddingVertical: 10, borderRadius: 30, gap: 5 },
  skipText: { fontSize: 12, fontWeight: '700' },
  pager: { flex: 1 },
  slide: { justifyContent: 'center', paddingBottom: 8 },
  artwork: { borderRadius: 30, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 26 },
  artOrbTop: { position: 'absolute', height: 210, width: 210, borderRadius: 110, top: -116, right: -67 },
  artOrbBottom: { position: 'absolute', height: 180, width: 180, borderRadius: 95, borderWidth: 30, bottom: -110, left: -60 },
  artTopPill: { position: 'absolute', top: 16, left: 17, borderRadius: 18, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7, gap: 6 },
  onlineDot: { width: 5, height: 5, borderRadius: 3 },
  artTopText: { fontSize: 8, letterSpacing: 1, fontWeight: '900' },
  previewCard: { width: '80%', minHeight: 179, marginTop: 28, padding: 17, borderRadius: 22, borderWidth: 1, shadowColor: '#062C34', shadowOpacity: 0.1, shadowRadius: 18, elevation: 2 },
  previewIcon: { height: 39, width: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  previewTitle: { fontSize: 14, fontWeight: '800' },
  previewSub: { fontSize: 11, marginTop: 4 },
  miniPillRow: { flexDirection: 'row', gap: 7, marginTop: 12 },
  miniPill: { borderRadius: 14, paddingHorizontal: 9, paddingVertical: 6 },
  miniText: { fontSize: 9, fontWeight: '700' },
  previewBottom: { marginTop: 14, paddingTop: 10, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewFoot: { fontSize: 10 },
  safeVisual: { width: '81%', borderRadius: 24, padding: 21, marginTop: 29 },
  safeIcon: { height: 65, width: 65, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 11 },
  safeVisualTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  safetyRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 8 },
  safetyText: { fontSize: 11.5, color: '#E3F7F5' },
  conversationCard: { width: '83%', borderRadius: 22, marginTop: 27, padding: 16, borderWidth: 1, shadowColor: '#062C34', shadowOpacity: 0.1, shadowRadius: 18, elevation: 2 },
  conversationHeader: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 },
  chatIcon: { height: 42, width: 42, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  bubbleLeft: { alignSelf: 'flex-start', maxWidth: '85%', borderRadius: 14, borderTopLeftRadius: 4, paddingVertical: 11, paddingHorizontal: 12, marginBottom: 8 },
  bubbleRight: { alignSelf: 'flex-end', maxWidth: '90%', borderRadius: 14, borderTopRightRadius: 4, paddingVertical: 11, paddingHorizontal: 12 },
  chatText: { fontSize: 12 },
  chatReply: { fontSize: 12, color: '#FFFFFF' },
  chatFooter: { flexDirection: 'row', gap: 7, alignItems: 'center', paddingTop: 11, marginTop: 12, borderTopWidth: 1 },
  chatFooterText: { fontSize: 8.8 },
  cornerBadge: { position: 'absolute', right: 17, bottom: 15, height: 38, width: 38, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  copy: { paddingHorizontal: 5, alignItems: 'center' },
  stepLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2.1, marginBottom: 11 },
  heading: { fontSize: 29, lineHeight: 36, letterSpacing: -0.9, fontWeight: '800', textAlign: 'center' },
  description: { maxWidth: 325, fontSize: 13.3, lineHeight: 21, textAlign: 'center', marginTop: 11 },
  bottom: { paddingTop: 5, paddingBottom: 5 },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, marginBottom: 24 },
  pageIndicator: { height: 7, borderRadius: 5 },
  mainButton: { minHeight: 54, flexDirection: 'row', gap: 12, justifyContent: 'center', alignItems: 'center', borderRadius: 17 },
  mainButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  signInButton: { alignItems: 'center', justifyContent: 'center', minHeight: 43 },
  signInText: { fontSize: 12.5 },
});
