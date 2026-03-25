import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

// Native-only imports
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
import { HUSTLE_TYPES } from '../src/types';
import { useProfileStore } from '../src/store/profileStore';
import { useGameStore } from '../src/store/gameStore';
import { useClientsStore } from '../src/store/clientsStore';
import { useJobsStore } from '../src/store/jobsStore';
import { usePaymentsStore } from '../src/store/paymentsStore';
import { useCelebration } from '../src/components/CelebrationProvider';
import { checkBadges } from '../src/utils/gamification';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - Spacing.xl * 2;
const CARD_HEIGHT = CARD_WIDTH * (2 / 3.5);

interface CardDesign {
  id: string;
  name: string;
  bg: string;
  textColor: string;
  subtextColor: string;
  accentColor: string;
  gradient?: readonly [string, string];
}

const CARD_DESIGNS: CardDesign[] = [
  {
    id: 'executive',
    name: 'Executive',
    bg: '#0C0C0F',
    textColor: '#FFFFFF',
    subtextColor: 'rgba(255,255,255,0.5)',
    accentColor: '#DC2626',
  },
  {
    id: 'crimson',
    name: 'Crimson',
    bg: '#DC2626',
    textColor: '#FFFFFF',
    subtextColor: 'rgba(255,255,255,0.7)',
    accentColor: '#FFFFFF',
    gradient: ['#DC2626', '#991B1B'],
  },
  {
    id: 'clean',
    name: 'Clean',
    bg: '#FFFFFF',
    textColor: '#0C0C0F',
    subtextColor: '#6B6B78',
    accentColor: '#DC2626',
  },
  {
    id: 'slate',
    name: 'Slate',
    bg: '#1A1A22',
    textColor: '#FFFFFF',
    subtextColor: '#8A8A96',
    accentColor: '#DC2626',
    gradient: ['#1A1A22', '#141418'],
  },
];

function buildCardHTML(fields: any, design: CardDesign): string {
  return `<html><body style="margin:0;padding:40px;font-family:system-ui;background:${design.bg};color:${design.textColor};">
    <div style="max-width:400px;margin:auto;padding:30px;border-radius:12px;">
      <h1 style="font-size:24px;margin:0 0 4px;">${fields.businessName}</h1>
      <p style="font-size:14px;color:${design.accentColor};margin:0 0 16px;">${fields.hustleLabel}</p>
      <p style="font-size:14px;margin:4px 0;">${fields.ownerName}</p>
      <p style="font-size:12px;margin:4px 0;color:${design.subtextColor};">${fields.phone}</p>
      <p style="font-size:12px;margin:4px 0;color:${design.subtextColor};">${fields.email}</p>
    </div></body></html>`;
}

export default function BusinessCardScreen() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const { showXPToast } = useCelebration();
  const [selectedDesign, setSelectedDesign] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(false);
  const cardRef = useRef<View>(null);

  const hustleInfo = HUSTLE_TYPES.find((h) => h.id === (profile?.hustleType || 'lawn_care'));
  const fields = {
    businessName: profile?.businessName || 'My Business',
    ownerName: profile?.name || 'Your Name',
    hustleLabel: hustleInfo?.name || 'Services',
    phone: '(555) 123-4567',
    email: 'hello@mybusiness.com',
  };

  const design = CARD_DESIGNS[selectedDesign];

  const awardXP = () => {
    if (xpAwarded) return;
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
  };

  const handleShare = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Share', 'Use a native device to share.');
      return;
    }
    awardXP();
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, width: 1080 / PixelRatio.get() });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your business card' });
    } catch {
      Alert.alert('Error', 'Unable to share at this time.');
    }
  };

  const handleExportPDF = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Export', 'Use a native device to export PDF.');
      return;
    }
    awardXP();
    try {
      const { uri } = await Print.printToFileAsync({ html: buildCardHTML(fields, design) });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Export business card PDF' });
    } catch {
      Alert.alert('Error', 'Unable to export PDF.');
    }
  };

  const handlePrint = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Print', 'Use a native device to print.');
      return;
    }
    awardXP();
    try {
      await Print.printAsync({ html: buildCardHTML(fields, design) });
    } catch {
      Alert.alert('Error', 'Unable to print.');
    }
  };

  const renderCard = (d: CardDesign) => {
    const content = (
      <View style={[styles.cardContent]}>
        <View style={styles.cardTopRow}>
          <Ionicons name={(hustleInfo?.icon || 'briefcase') as any} size={22} color={d.accentColor} />
          <View style={styles.cardNameBlock}>
            <Text style={[styles.cardBusinessName, { color: d.textColor }]} numberOfLines={1}>
              {fields.businessName}
            </Text>
            <Text style={[styles.cardHustleLabel, { color: d.accentColor }]} numberOfLines={1}>
              {fields.hustleLabel}
            </Text>
          </View>
        </View>
        <View style={[styles.cardDivider, { backgroundColor: d.subtextColor }]} />
        <View style={styles.cardBottomRow}>
          <Text style={[styles.cardOwnerName, { color: d.textColor }]}>{fields.ownerName}</Text>
          <Text style={[styles.cardContactText, { color: d.subtextColor }]}>{fields.phone}</Text>
          <Text style={[styles.cardContactText, { color: d.subtextColor }]}>{fields.email}</Text>
        </View>
      </View>
    );

    if (d.gradient) {
      return (
        <LinearGradient colors={[...d.gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.businessCard}>
          {content}
        </LinearGradient>
      );
    }
    return (
      <View style={[styles.businessCard, { backgroundColor: d.bg }, d.id === 'clean' && { borderWidth: 1, borderColor: '#E0E0E0' }]}>
        {content}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Business Card</Text>
            <Text style={styles.headerSubtitle}>Choose a design for your card</Text>
          </View>
        </View>

        {/* Selected Card Preview */}
        <View style={styles.cardPreviewContainer}>
          <View ref={cardRef} collapsable={false}>
            {renderCard(design)}
          </View>
        </View>

        {/* Design Options */}
        <Text style={styles.sectionTitle}>DESIGNS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.designScroll} contentContainerStyle={styles.designScrollContent}>
          {CARD_DESIGNS.map((d, i) => (
            <TouchableOpacity
              key={d.id}
              onPress={() => setSelectedDesign(i)}
              style={[styles.designOption, selectedDesign === i && styles.designOptionSelected]}
            >
              <View style={[styles.designPreview, { backgroundColor: d.bg }, d.id === 'clean' && { borderWidth: 1, borderColor: '#E0E0E0' }]}>
                <View style={[styles.designAccentDot, { backgroundColor: d.accentColor }]} />
              </View>
              <Text style={[styles.designLabel, selectedDesign === i && styles.designLabelSelected]}>{d.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity onPress={handleShare} style={styles.actionBtn} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={20} color={Colors.text} />
            <Text style={styles.actionBtnText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExportPDF} style={styles.actionBtn} activeOpacity={0.7}>
            <Ionicons name="document-outline" size={20} color={Colors.text} />
            <Text style={styles.actionBtnText}>PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePrint} style={styles.actionBtn} activeOpacity={0.7}>
            <Ionicons name="print-outline" size={20} color={Colors.text} />
            <Text style={styles.actionBtnText}>Print</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.huge },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, marginBottom: Spacing.xxl },
  backButton: { width: 44, height: 44, borderRadius: BorderRadius.md, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  headerSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  cardPreviewContainer: { alignItems: 'center', marginBottom: Spacing.xxl, ...Shadows.elevated },
  businessCard: { width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: BorderRadius.lg, padding: Spacing.xl, overflow: 'hidden', justifyContent: 'space-between' },
  cardContent: { flex: 1, justifyContent: 'space-between' },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardNameBlock: { flex: 1 },
  cardBusinessName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, letterSpacing: 0.5 },
  cardHustleLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 2, marginTop: 2 },
  cardDivider: { height: 1, width: '100%', opacity: 0.2 },
  cardBottomRow: { gap: 3 },
  cardOwnerName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, marginBottom: 4 },
  cardContactText: { fontSize: FontSize.xs },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted, letterSpacing: 2, marginBottom: Spacing.md },
  designScroll: { marginBottom: Spacing.xxl },
  designScrollContent: { gap: Spacing.md },
  designOption: { alignItems: 'center', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 2, borderColor: 'transparent' },
  designOptionSelected: { borderColor: Colors.primary },
  designPreview: { width: 56, height: 36, borderRadius: BorderRadius.sm, marginBottom: Spacing.xs, alignItems: 'center', justifyContent: 'center' },
  designAccentDot: { width: 12, height: 12, borderRadius: 6 },
  designLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textMuted },
  designLabelSelected: { color: Colors.primary },
  actionsGrid: { flexDirection: 'row', gap: Spacing.md },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md, paddingVertical: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  actionBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
});
