import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
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
import { UserProfile, HUSTLE_TYPES } from '../src/types';
import { useProfileStore } from '../src/store/profileStore';
import { useGameStore } from '../src/store/gameStore';
import { useClientsStore } from '../src/store/clientsStore';
import { useJobsStore } from '../src/store/jobsStore';
import { usePaymentsStore } from '../src/store/paymentsStore';
import { useCelebration } from '../src/components/CelebrationProvider';
import { checkBadges } from '../src/utils/gamification';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - Spacing.xl * 2;
const CARD_HEIGHT = CARD_WIDTH * (2 / 3.5); // Standard business card ratio 3.5:2

type CardStyle = 'dark' | 'gradient' | 'minimal';

interface CardFields {
  businessName: string;
  ownerName: string;
  hustleLabel: string;
  phone: string;
  email: string;
}

function buildCardHTML(fields: CardFields, style: CardStyle): string {
  const isDark = style !== 'minimal';
  return `
    <html>
      <body style="margin:0; padding:40px; font-family:system-ui; background:${isDark ? '#1A1A2E' : '#FFFFFF'}; color:${isDark ? '#FFFFFF' : '#111111'};">
        <div style="max-width:400px; margin:auto; padding:30px; border-radius:12px; background:${isDark ? '#252542' : '#F5F5F5'};">
          <h1 style="font-size:24px; margin:0 0 4px;">${fields.businessName}</h1>
          <p style="font-size:14px; color:${isDark ? '#B388FF' : '#6200EA'}; margin:0 0 16px;">${fields.hustleLabel}</p>
          <p style="font-size:14px; margin:4px 0;">${fields.ownerName}</p>
          <p style="font-size:12px; margin:4px 0; color:#888;">${fields.phone}</p>
          <p style="font-size:12px; margin:4px 0; color:#888;">${fields.email}</p>
        </div>
      </body>
    </html>
  `;
}

export default function BusinessCardScreen() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const { showXPToast } = useCelebration();
  const [selectedStyle, setSelectedStyle] = useState<CardStyle>('dark');
  const [xpAwarded, setXpAwarded] = useState(false);
  const cardRef = useRef<View>(null);
  const [fields, setFields] = useState<CardFields>({
    businessName: '',
    ownerName: '',
    hustleLabel: '',
    phone: '(555) 123-4567',
    email: 'hello@mybusiness.com',
  });

  useEffect(() => {
    if (profile) {
      const hustleInfo = HUSTLE_TYPES.find((h) => h.id === profile.hustleType);
      setFields({
        businessName: profile.businessName || 'My Business',
        ownerName: profile.name || 'Your Name',
        hustleLabel: hustleInfo?.name || 'Services',
        phone: '(555) 123-4567',
        email: 'hello@mybusiness.com',
      });
    }
  }, [profile]);

  const updateField = (key: keyof CardFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const hustleInfo = HUSTLE_TYPES.find((h) => h.id === (profile?.hustleType || 'lawn_care'));

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
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        width: 1080 / PixelRatio.get(),
      });
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your business card',
      });
    } catch (error) {
      // Fallback to expo-print HTML-to-PDF
      try {
        const { uri } = await Print.printToFileAsync({
          html: buildCardHTML(fields, selectedStyle),
        });
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share your business card',
        });
      } catch {
        Alert.alert('Share Error', 'Unable to share at this time.');
      }
    }
  };

  const renderCardContent = (style: CardStyle) => {
    const isDark = style === 'dark';
    const isMinimal = style === 'minimal';
    const textColor = isMinimal ? '#111111' : '#FFFFFF';
    const subtextColor = isMinimal ? '#666666' : 'rgba(255,255,255,0.7)';
    const accentColor = isMinimal ? Colors.primary : style === 'dark' ? Colors.primary : '#FFFFFF';
    const dividerColor = isMinimal ? '#E0E0E0' : 'rgba(255,255,255,0.15)';

    return (
      <View style={styles.cardContent}>
        {/* Top Row: Emoji + Business Name */}
        <View style={styles.cardTopRow}>
          <Text style={{ fontSize: 24 }}>{hustleInfo?.emoji || '💼'}</Text>
          <View style={styles.cardNameBlock}>
            <Text
              style={[styles.cardBusinessName, { color: textColor }]}
              numberOfLines={1}
            >
              {fields.businessName}
            </Text>
            <Text
              style={[styles.cardHustleLabel, { color: accentColor }]}
              numberOfLines={1}
            >
              {fields.hustleLabel}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View
          style={[styles.cardDivider, { backgroundColor: dividerColor }]}
        />

        {/* Bottom Row: Contact Info */}
        <View style={styles.cardBottomRow}>
          <Text
            style={[styles.cardOwnerName, { color: textColor }]}
            numberOfLines={1}
          >
            {fields.ownerName}
          </Text>
          <View style={styles.cardContactRow}>
            <Ionicons
              name="call-outline"
              size={12}
              color={subtextColor}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.cardContactText, { color: subtextColor }]}>
              {fields.phone}
            </Text>
          </View>
          <View style={styles.cardContactRow}>
            <Ionicons
              name="mail-outline"
              size={12}
              color={subtextColor}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.cardContactText, { color: subtextColor }]}>
              {fields.email}
            </Text>
          </View>
        </View>

        {/* Corner accent */}
        <View
          style={[
            styles.cardCornerAccent,
            { borderColor: accentColor },
          ]}
        />
      </View>
    );
  };

  const renderCard = (style: CardStyle) => {
    switch (style) {
      case 'dark':
        return (
          <View style={[styles.businessCard, { backgroundColor: '#1A1A2E' }]}>
            {renderCardContent(style)}
          </View>
        );
      case 'gradient':
        return (
          <LinearGradient
            colors={['#7C4DFF', '#00C853']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.businessCard}
          >
            {renderCardContent(style)}
          </LinearGradient>
        );
      case 'minimal':
        return (
          <View
            style={[
              styles.businessCard,
              { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0' },
            ]}
          >
            {renderCardContent(style)}
          </View>
        );
      default:
        return null;
    }
  };

  const STYLE_OPTIONS: { id: CardStyle; label: string; previewColors: string[] }[] = [
    { id: 'dark', label: 'Dark', previewColors: ['#1A1A2E', '#16213E'] },
    { id: 'gradient', label: 'Gradient', previewColors: ['#7C4DFF', '#00C853'] },
    { id: 'minimal', label: 'Minimal', previewColors: ['#FFFFFF', '#F5F5F5'] },
  ];

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
            <Text style={styles.headerTitle}>Business Card</Text>
            <Text style={styles.headerSubtitle}>
              Design your professional card
            </Text>
          </View>
        </View>

        {/* Card Preview */}
        <View style={styles.cardPreviewContainer}>
          <View ref={cardRef} collapsable={false}>
            {renderCard(selectedStyle)}
          </View>
        </View>

        {/* Style Selection */}
        <Text style={styles.sectionTitle}>Card Style</Text>
        <View style={styles.styleRow}>
          {STYLE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              onPress={() => setSelectedStyle(opt.id)}
              style={[
                styles.styleOption,
                selectedStyle === opt.id && styles.styleOptionSelected,
              ]}
            >
              <LinearGradient
                colors={opt.previewColors as [string, string]}
                style={styles.stylePreviewDot}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text
                style={[
                  styles.styleLabel,
                  selectedStyle === opt.id && styles.styleLabelSelected,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Edit Fields */}
        <Text style={styles.sectionTitle}>Customize</Text>
        <View style={styles.fieldsContainer}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Business Name</Text>
            <TextInput
              style={styles.fieldInput}
              value={fields.businessName}
              onChangeText={(v) => updateField('businessName', v)}
              placeholderTextColor={Colors.textMuted}
              placeholder="Your business name"
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Your Name</Text>
            <TextInput
              style={styles.fieldInput}
              value={fields.ownerName}
              onChangeText={(v) => updateField('ownerName', v)}
              placeholderTextColor={Colors.textMuted}
              placeholder="Your name"
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Service Type</Text>
            <TextInput
              style={styles.fieldInput}
              value={fields.hustleLabel}
              onChangeText={(v) => updateField('hustleLabel', v)}
              placeholderTextColor={Colors.textMuted}
              placeholder="Service type"
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Phone</Text>
            <TextInput
              style={styles.fieldInput}
              value={fields.phone}
              onChangeText={(v) => updateField('phone', v)}
              placeholderTextColor={Colors.textMuted}
              placeholder="Your phone number"
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.fieldInput}
              value={fields.email}
              onChangeText={(v) => updateField('email', v)}
              placeholderTextColor={Colors.textMuted}
              placeholder="Your email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity onPress={handleShare} activeOpacity={0.8}>
          <LinearGradient
            colors={Colors.gradientGreen}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shareButton}
          >
            <Ionicons name="share-outline" size={22} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Share Card</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  cardPreviewContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    ...Shadows.elevated,
  },
  businessCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    position: 'relative',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cardNameBlock: {
    flex: 1,
  },
  cardBusinessName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  cardHustleLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    width: '100%',
  },
  cardBottomRow: {
    gap: 3,
  },
  cardOwnerName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginBottom: 4,
  },
  cardContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContactText: {
    fontSize: FontSize.xs,
  },
  cardCornerAccent: {
    position: 'absolute',
    bottom: -Spacing.xl,
    right: -Spacing.xl,
    width: 60,
    height: 60,
    borderWidth: 2,
    borderRadius: BorderRadius.full,
    opacity: 0.3,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  styleRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  styleOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  styleOptionSelected: {
    borderColor: Colors.primary,
  },
  stylePreviewDot: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  styleLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  styleLabelSelected: {
    color: Colors.primary,
  },
  fieldsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  fieldGroup: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  fieldInput: {
    backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
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
});
