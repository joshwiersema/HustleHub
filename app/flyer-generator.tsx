import React, { useState, useRef } from 'react';
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
const FLYER_WIDTH = width - Spacing.xl * 2;
const FLYER_HEIGHT = FLYER_WIDTH * 1.4;

interface FlyerDesign {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  subtextColor: string;
  gradient?: readonly [string, string];
}

const FLYER_DESIGNS: FlyerDesign[] = [
  {
    id: 'classic',
    name: 'Classic',
    bgColor: '#FFFFFF',
    textColor: '#111827',
    accentColor: '#DC2626',
    subtextColor: '#6B7280',
  },
  {
    id: 'soft',
    name: 'Soft',
    bgColor: '#F9FAFB',
    textColor: '#111827',
    accentColor: '#DC2626',
    subtextColor: '#9CA3AF',
  },
  {
    id: 'impact',
    name: 'Impact',
    bgColor: '#DC2626',
    textColor: '#FFFFFF',
    accentColor: '#FFFFFF',
    subtextColor: 'rgba(255,255,255,0.7)',
    gradient: ['#DC2626', '#991B1B'],
  },
  {
    id: 'dark',
    name: 'Dark',
    bgColor: '#111827',
    textColor: '#FFFFFF',
    accentColor: '#DC2626',
    subtextColor: '#9CA3AF',
  },
];

function buildFlyerHTML(fields: any, design: FlyerDesign): string {
  return `<html><body style="margin:0;padding:40px;font-family:system-ui;background:${design.bgColor};color:${design.textColor};text-align:center;">
    <div style="max-width:500px;margin:auto;padding:40px;">
      <h1 style="font-size:36px;margin:0 0 8px;font-weight:900;">${fields.businessName}</h1>
      <p style="font-size:18px;color:${design.accentColor};margin:0 0 24px;">${fields.hustleLabel}</p>
      <p style="font-size:16px;margin:0 0 8px;color:${design.subtextColor};">${fields.tagline}</p>
      <hr style="border:none;border-top:1px solid ${design.subtextColor};opacity:0.3;margin:24px 0;" />
      <p style="font-size:14px;margin:4px 0;">${fields.ownerName}</p>
      <p style="font-size:14px;margin:4px 0;color:${design.subtextColor};">${fields.phone}</p>
    </div></body></html>`;
}

export default function FlyerGeneratorScreen() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const { showXPToast } = useCelebration();
  const [selectedDesign, setSelectedDesign] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(false);
  const flyerRef = useRef<View>(null);

  const hustleInfo = HUSTLE_TYPES.find((h) => h.id === (profile?.hustleType || 'lawn_care'));
  const fields = {
    businessName: profile?.businessName || 'My Business',
    ownerName: profile?.name || 'Your Name',
    hustleLabel: hustleInfo?.name || 'Services',
    tagline: `Professional ${hustleInfo?.name || 'Service'} — Quality You Can Trust`,
    phone: '(555) 123-4567',
  };

  const design = FLYER_DESIGNS[selectedDesign];

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
    if (Platform.OS === 'web') { Alert.alert('Share', 'Use a native device.'); return; }
    awardXP();
    try {
      const uri = await captureRef(flyerRef, { format: 'png', quality: 1, width: 1080 / PixelRatio.get() });
      await Sharing.shareAsync(uri, { mimeType: 'image/png' });
    } catch { Alert.alert('Error', 'Unable to share.'); }
  };

  const handleExportPDF = async () => {
    if (Platform.OS === 'web') { Alert.alert('Export', 'Use a native device.'); return; }
    awardXP();
    try {
      const { uri } = await Print.printToFileAsync({ html: buildFlyerHTML(fields, design) });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
    } catch { Alert.alert('Error', 'Unable to export PDF.'); }
  };

  const handlePrint = async () => {
    if (Platform.OS === 'web') { Alert.alert('Print', 'Use a native device.'); return; }
    awardXP();
    try { await Print.printAsync({ html: buildFlyerHTML(fields, design) }); }
    catch { Alert.alert('Error', 'Unable to print.'); }
  };

  const renderFlyer = (d: FlyerDesign) => {
    const content = (
      <View style={styles.flyerContent}>
        <View style={styles.flyerTop}>
          <Ionicons name={(hustleInfo?.icon || 'briefcase') as any} size={32} color={d.accentColor} />
          <Text style={[styles.flyerBusinessName, { color: d.textColor }]}>{fields.businessName}</Text>
          <Text style={[styles.flyerHustle, { color: d.accentColor }]}>{fields.hustleLabel}</Text>
        </View>
        <View style={[styles.flyerDivider, { backgroundColor: d.subtextColor }]} />
        <Text style={[styles.flyerTagline, { color: d.subtextColor }]}>{fields.tagline}</Text>
        <View style={styles.flyerBottom}>
          <Text style={[styles.flyerOwner, { color: d.textColor }]}>{fields.ownerName}</Text>
          <Text style={[styles.flyerPhone, { color: d.subtextColor }]}>{fields.phone}</Text>
        </View>
      </View>
    );

    if (d.gradient) {
      return (
        <LinearGradient colors={[...d.gradient]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.flyer}>
          {content}
        </LinearGradient>
      );
    }
    return (
      <View style={[styles.flyer, { backgroundColor: d.bgColor }, d.id === 'classic' && { borderWidth: 1, borderColor: '#E0E0E0' }]}>
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
            <Text style={styles.headerTitle}>Flyer Generator</Text>
            <Text style={styles.headerSubtitle}>Promote your business</Text>
          </View>
        </View>

        {/* Flyer Preview */}
        <View style={styles.flyerPreviewContainer}>
          <View ref={flyerRef} collapsable={false}>
            {renderFlyer(design)}
          </View>
        </View>

        {/* Design Options */}
        <Text style={styles.sectionTitle}>DESIGNS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.designScroll} contentContainerStyle={styles.designScrollContent}>
          {FLYER_DESIGNS.map((d, i) => (
            <TouchableOpacity key={d.id} onPress={() => setSelectedDesign(i)} style={[styles.designOption, selectedDesign === i && styles.designOptionSelected]}>
              <View style={[styles.designPreview, { backgroundColor: d.bgColor }, d.id === 'classic' && { borderWidth: 1, borderColor: '#E0E0E0' }]}>
                <View style={[styles.designAccentDot, { backgroundColor: d.accentColor }]} />
              </View>
              <Text style={[styles.designLabel, selectedDesign === i && styles.designLabelSelected]}>{d.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Actions */}
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
  flyerPreviewContainer: { alignItems: 'center', marginBottom: Spacing.xxl, ...Shadows.elevated },
  flyer: { width: FLYER_WIDTH, height: FLYER_HEIGHT, borderRadius: BorderRadius.lg, padding: Spacing.xxl, overflow: 'hidden' },
  flyerContent: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },
  flyerTop: { alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.xxl },
  flyerBusinessName: { fontSize: FontSize.xxxl, fontWeight: FontWeight.black, textAlign: 'center', letterSpacing: -0.5 },
  flyerHustle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 3 },
  flyerDivider: { height: 1, width: '60%', opacity: 0.2 },
  flyerTagline: { fontSize: FontSize.md, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.lg },
  flyerBottom: { alignItems: 'center', gap: 4, paddingBottom: Spacing.lg },
  flyerOwner: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  flyerPhone: { fontSize: FontSize.sm },
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
