import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  PixelRatio,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Native-only imports — crash on web
let captureRef: any = null;
let Sharing: any = null;
let Print: any = null;
if (Platform.OS !== 'web') {
  import('react-native-view-shot').then(m => { captureRef = m.captureRef; }).catch(() => {});
  import('expo-sharing').then(m => { Sharing = m; }).catch(() => {});
  import('expo-print').then(m => { Print = m; }).catch(() => {});
}
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadows,
} from '../src/constants/theme';
import { UserProfile, HustleType, HUSTLE_TYPES } from '../src/types';
import { useProfileStore } from '../src/store/profileStore';
import { useGameStore } from '../src/store/gameStore';
import { useClientsStore } from '../src/store/clientsStore';
import { useJobsStore } from '../src/store/jobsStore';
import { usePaymentsStore } from '../src/store/paymentsStore';
import { useCelebration } from '../src/components/CelebrationProvider';
import { checkBadges } from '../src/utils/gamification';

const { width } = Dimensions.get('window');
const FLYER_PREVIEW_WIDTH = (width - Spacing.xl * 2 - Spacing.md) / 2;
const FLYER_FULL_WIDTH = width - Spacing.xl * 2;

interface FlyerTemplate {
  id: string;
  name: string;
  bgType: 'green-gradient' | 'dark' | 'purple-gradient' | 'classic';
}

const TEMPLATES: FlyerTemplate[] = [
  { id: 'bold', name: 'Bold', bgType: 'green-gradient' },
  { id: 'clean', name: 'Clean', bgType: 'dark' },
  { id: 'friendly', name: 'Friendly', bgType: 'purple-gradient' },
  { id: 'classic', name: 'Classic', bgType: 'classic' },
];

const SERVICES_BY_TYPE: Record<HustleType, string[]> = {
  lawn_care: ['Lawn Mowing', 'Edging & Trimming', 'Leaf Cleanup', 'Garden Beds'],
  power_washing: ['Driveway Cleaning', 'Deck Restoration', 'House Siding', 'Fence Cleaning'],
  dog_walking: ['Daily Dog Walks', 'Pet Sitting', 'Puppy Visits', 'Weekend Care'],
  tutoring: ['Math Tutoring', 'Science Help', 'Essay Writing', 'Test Prep'],
  car_detailing: ['Full Detail', 'Interior Clean', 'Exterior Wash & Wax', 'Engine Bay'],
  snow_removal: ['Driveway Clearing', 'Walkway Shoveling', 'Salt Treatment', 'Emergency Service'],
};

const PRICING_BY_TYPE: Record<HustleType, string> = {
  lawn_care: 'Starting at $25/yard',
  power_washing: 'Starting at $50/job',
  dog_walking: 'Starting at $15/walk',
  tutoring: 'Starting at $20/hour',
  car_detailing: 'Starting at $50/car',
  snow_removal: 'Starting at $25/job',
};

function buildFlyerHTML(profile: UserProfile | null, templateId: string): string {
  const businessName = profile?.businessName ?? 'My Business';
  const hustleType = profile?.hustleType ?? 'lawn_care';
  const hustleInfo = HUSTLE_TYPES.find((h) => h.id === hustleType);
  const isDark = templateId !== 'classic';
  return `
    <html>
      <body style="margin:0; padding:40px; font-family:system-ui; background:${isDark ? '#1A1A2E' : '#FFFFFF'}; color:${isDark ? '#FFFFFF' : '#111111'};">
        <h1 style="text-align:center; font-size:32px; margin-bottom:8px;">${businessName}</h1>
        <p style="text-align:center; font-size:18px; color:${isDark ? '#B388FF' : '#6200EA'};">${hustleInfo?.name ?? 'Services'}</p>
        <hr style="border:1px solid ${isDark ? '#333' : '#DDD'}; margin:20px 0;">
        <p style="text-align:center; font-size:14px;">Professional services in your neighborhood</p>
        <p style="text-align:center; font-size:12px; margin-top:20px; color:#888;">Created with HustleHub</p>
      </body>
    </html>
  `;
}

export default function FlyerGeneratorScreen() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const { showXPToast } = useCelebration();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('bold');
  const [xpAwarded, setXpAwarded] = useState(false);
  const flyerRef = useRef<View>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedTemplate]);

  const hustleType = profile?.hustleType || 'lawn_care';
  const hustleInfo = HUSTLE_TYPES.find((h) => h.id === hustleType);
  const businessName = profile?.businessName || 'My Business';
  const services = SERVICES_BY_TYPE[hustleType];
  const pricing = PRICING_BY_TYPE[hustleType];

  const handleShare = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Share', 'Sharing is not available on web preview. Use a native device to share.');
      return;
    }
    // Gamification orchestration (first share per session)
    if (!xpAwarded) {
      const gs = useGameStore.getState();
      gs.addXP(10);
      gs.updateStreak();
      const clients = useClientsStore.getState().clients;
      const jobs = useJobsStore.getState().jobs;
      const payments = usePaymentsStore.getState().payments;
      const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
      const completedJobs = jobs.filter((j) => j.status === 'completed').length;
      const newBadges = checkBadges(
        { earnedBadges: gs.earnedBadges, streak: gs.streak },
        { totalClients: clients.length, completedJobs, totalEarnings }
      );
      newBadges.forEach((id) => useGameStore.getState().earnBadge(id));
      showXPToast(10);
      setXpAwarded(true);
    }

    // Real sharing via view-shot capture
    try {
      const uri = await captureRef(flyerRef, {
        format: 'png',
        quality: 1,
        width: 1080 / PixelRatio.get(),
      });
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your flyer',
      });
    } catch (error) {
      // Fallback to expo-print HTML-to-PDF
      try {
        const { uri } = await Print.printToFileAsync({
          html: buildFlyerHTML(profile, selectedTemplate),
        });
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share your flyer',
        });
      } catch {
        Alert.alert('Share Error', 'Unable to share at this time.');
      }
    }
  };

  const handleSelectTemplate = (id: string) => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    setSelectedTemplate(id);
  };

  const renderFlyerContent = (
    templateId: string,
    isPreview: boolean,
  ) => {
    const scaleFactor = isPreview ? 0.45 : 1;
    const s = (n: number) => n * scaleFactor;

    const content = (
      <View style={[isPreview ? styles.flyerPreviewInner : styles.flyerFullInner]}>
        {/* Top accent bar */}
        <View
          style={{
            height: s(4),
            backgroundColor:
              templateId === 'classic' ? Colors.primary : 'rgba(255,255,255,0.3)',
            borderRadius: 2,
            marginBottom: s(12),
            width: '40%',
            alignSelf: 'center',
          }}
        />

        {/* Icon */}
        <View style={{ alignItems: 'center', marginBottom: s(8) }}>
          <Ionicons name={(hustleInfo?.icon || 'briefcase') as any} size={s(32)} color={Colors.primary} />
        </View>

        {/* Business Name */}
        <Text
          style={{
            fontSize: s(22),
            fontWeight: FontWeight.black,
            color: templateId === 'classic' ? '#111111' : '#FFFFFF',
            textAlign: 'center',
            marginBottom: s(4),
            letterSpacing: 0.5,
          }}
          numberOfLines={isPreview ? 1 : 2}
        >
          {businessName}
        </Text>

        {/* Tagline */}
        <Text
          style={{
            fontSize: s(11),
            fontWeight: FontWeight.medium,
            color:
              templateId === 'classic'
                ? Colors.textSecondary
                : 'rgba(255,255,255,0.8)',
            textAlign: 'center',
            marginBottom: s(16),
            textTransform: 'uppercase',
            letterSpacing: s(2),
          }}
        >
          {hustleInfo?.name || 'Services'}
        </Text>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor:
              templateId === 'classic'
                ? '#E0E0E0'
                : 'rgba(255,255,255,0.2)',
            marginBottom: s(12),
            width: '60%',
            alignSelf: 'center',
          }}
        />

        {/* Services */}
        <View style={{ marginBottom: s(14), alignItems: 'center' }}>
          <Text
            style={{
              fontSize: s(10),
              fontWeight: FontWeight.bold,
              color:
                templateId === 'classic' ? Colors.primary : '#FFFFFF',
              marginBottom: s(6),
              textTransform: 'uppercase',
              letterSpacing: s(1.5),
            }}
          >
            Our Services
          </Text>
          {services.map((service, i) => (
            <Text
              key={i}
              style={{
                fontSize: s(12),
                color:
                  templateId === 'classic'
                    ? '#333333'
                    : 'rgba(255,255,255,0.9)',
                marginBottom: s(3),
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {isPreview ? service : `\u2022 ${service}`}
            </Text>
          ))}
        </View>

        {/* Pricing */}
        <View
          style={{
            backgroundColor:
              templateId === 'classic'
                ? Colors.primaryBg
                : 'rgba(0,0,0,0.2)',
            borderRadius: s(8),
            paddingVertical: s(8),
            paddingHorizontal: s(12),
            marginBottom: s(12),
            alignSelf: 'center',
          }}
        >
          <Text
            style={{
              fontSize: s(13),
              fontWeight: FontWeight.bold,
              color:
                templateId === 'classic' ? Colors.primary : '#FFFFFF',
              textAlign: 'center',
            }}
          >
            {pricing}
          </Text>
        </View>

        {/* Contact */}
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: s(12),
              fontWeight: FontWeight.semibold,
              color:
                templateId === 'classic' ? '#111111' : '#FFFFFF',
              textAlign: 'center',
            }}
          >
            Call/Text (555) 123-4567
          </Text>
        </View>
      </View>
    );

    return content;
  };

  const renderFlyerBackground = (
    templateId: string,
    isPreview: boolean,
    children: React.ReactNode,
  ) => {
    const containerStyle = isPreview ? styles.flyerPreview : styles.flyerFull;

    switch (templateId) {
      case 'bold':
        return (
          <LinearGradient
            colors={['#00C853', '#00E676', '#69F0AE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={containerStyle}
          >
            {children}
          </LinearGradient>
        );
      case 'clean':
        return (
          <View style={[containerStyle, { backgroundColor: '#1A1A2E' }]}>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                backgroundColor: Colors.primary,
              }}
            />
            {children}
          </View>
        );
      case 'friendly':
        return (
          <LinearGradient
            colors={['#7C4DFF', '#B388FF', '#CE93D8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={containerStyle}
          >
            {children}
          </LinearGradient>
        );
      case 'classic':
        return (
          <View
            style={[
              containerStyle,
              {
                backgroundColor: '#FFFFFF',
                borderWidth: 2,
                borderColor: '#E0E0E0',
              },
            ]}
          >
            {children}
          </View>
        );
      default:
        return <View style={containerStyle}>{children}</View>;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Flyer Generator</Text>
            <Text style={styles.headerSubtitle}>
              Create eye-catching flyers for your business
            </Text>
          </View>
        </View>

        {/* Template Selection */}
        <Text style={styles.sectionTitle}>Choose a Template</Text>
        <View style={styles.templateGrid}>
          {TEMPLATES.map((template) => (
            <TouchableOpacity
              key={template.id}
              onPress={() => handleSelectTemplate(template.id)}
              style={[
                styles.templateCard,
                selectedTemplate === template.id && styles.templateCardSelected,
              ]}
            >
              {renderFlyerBackground(
                template.id,
                true,
                renderFlyerContent(template.id, true),
              )}
              <View style={styles.templateLabelRow}>
                <Text
                  style={[
                    styles.templateLabel,
                    selectedTemplate === template.id &&
                      styles.templateLabelSelected,
                  ]}
                >
                  {template.name}
                </Text>
                {selectedTemplate === template.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={Colors.primary}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Full Preview */}
        <Text style={styles.sectionTitle}>Preview</Text>
        <Animated.View
          style={[
            styles.fullPreviewContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View ref={flyerRef} collapsable={false}>
            {renderFlyerBackground(
              selectedTemplate,
              false,
              renderFlyerContent(selectedTemplate, false),
            )}
          </View>
        </Animated.View>

        {/* Share Button */}
        <TouchableOpacity onPress={handleShare} activeOpacity={0.8}>
          <LinearGradient
            colors={Colors.gradientGreen}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shareButton}
          >
            <Ionicons name="share-outline" size={22} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Share Flyer</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* XP Notice */}
        {!xpAwarded && (
          <View style={styles.xpNotice}>
            <Ionicons name="star" size={16} color={Colors.amber} />
            <Text style={styles.xpNoticeText}>
              Earn 10 XP for your first flyer!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  templateCard: {
    width: FLYER_PREVIEW_WIDTH,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  templateCardSelected: {
    borderColor: Colors.primary,
  },
  flyerPreview: {
    width: '100%',
    aspectRatio: 0.75,
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  flyerPreviewInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  templateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  templateLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  templateLabelSelected: {
    color: Colors.primary,
  },
  fullPreviewContainer: {
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.elevated,
  },
  flyerFull: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  flyerFullInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.card,
  },
  shareButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  xpNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  xpNoticeText: {
    fontSize: FontSize.sm,
    color: Colors.amber,
    fontWeight: FontWeight.medium,
  },
});
