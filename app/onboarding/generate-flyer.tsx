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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

let captureRef: any = null;
let Sharing: any = null;
if (Platform.OS !== 'web') {
  import('react-native-view-shot').then(m => { captureRef = m.captureRef; }).catch(() => {});
  import('expo-sharing').then(m => { Sharing = m; }).catch(() => {});
}

import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadows,
} from '../../src/constants/theme';
import { HUSTLE_TYPES } from '../../src/types';
import { useProfileStore } from '../../src/store/profileStore';

const { width } = Dimensions.get('window');
const FLYER_W = width - Spacing.xxl * 2;
const FLYER_H = FLYER_W * 1.3;

const DESIGNS = [
  { id: 'classic', name: 'Classic', bg: '#FFF', text: '#111827', accent: '#DC2626', sub: '#6B7280' },
  { id: 'soft', name: 'Soft', bg: '#F9FAFB', text: '#111827', accent: '#DC2626', sub: '#9CA3AF' },
  { id: 'impact', name: 'Impact', bg: '#DC2626', text: '#FFF', accent: '#FFF', sub: 'rgba(255,255,255,0.7)', grad: ['#DC2626', '#991B1B'] as const },
  { id: 'dark', name: 'Dark', bg: '#111827', text: '#FFF', accent: '#DC2626', sub: '#9CA3AF' },
];

export default function GenerateFlyerScreen() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const [selected, setSelected] = useState(0);
  const flyerRef = useRef<View>(null);

  const hustleInfo = HUSTLE_TYPES.find((h) => h.id === profile?.hustleType);
  const biz = profile?.businessName || 'My Business';
  const name = profile?.name || 'Your Name';
  const label = hustleInfo?.name || 'Services';
  const d = DESIGNS[selected];

  const handleExport = async () => {
    if (Platform.OS === 'web') { Alert.alert('Export', 'Use a native device.'); return; }
    try {
      const uri = await captureRef(flyerRef, { format: 'png', quality: 1, width: 1080 / PixelRatio.get() });
      await Sharing.shareAsync(uri, { mimeType: 'image/png' });
    } catch { Alert.alert('Error', 'Unable to export.'); }
  };

  const renderFlyer = () => {
    const content = (
      <View style={styles.flyerInner}>
        <View style={styles.flyerTop}>
          <Ionicons name={(hustleInfo?.icon || 'briefcase') as any} size={28} color={d.accent} />
          <Text style={[styles.flyerBiz, { color: d.text }]}>{biz}</Text>
          <Text style={[styles.flyerLabel, { color: d.accent }]}>{label}</Text>
        </View>
        <View style={[styles.flyerDiv, { backgroundColor: d.sub }]} />
        <Text style={[styles.flyerTagline, { color: d.sub }]}>
          Professional {label} — Quality You Can Trust
        </Text>
        <View style={styles.flyerBottom}>
          <Text style={[styles.flyerName, { color: d.text }]}>{name}</Text>
          <Text style={[styles.flyerPhone, { color: d.sub }]}>(555) 123-4567</Text>
        </View>
      </View>
    );
    if (d.grad) {
      return <LinearGradient colors={[...d.grad]} style={styles.flyer}>{content}</LinearGradient>;
    }
    return <View style={[styles.flyer, { backgroundColor: d.bg }, d.id === 'classic' && { borderWidth: 1, borderColor: '#E0E0E0' }]}>{content}</View>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.steps}>
          <View style={[styles.dot, styles.dotDone]} />
          <View style={[styles.dot, styles.dotDone]} />
          <View style={[styles.dot, styles.dotDone]} />
          <View style={[styles.dot, styles.dotDone]} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your Flyer</Text>
        <Text style={styles.subtitle}>Create a flyer to promote your business.</Text>

        <View style={styles.preview} ref={flyerRef} collapsable={false}>
          {renderFlyer()}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.designRow}>
          {DESIGNS.map((dd, i) => (
            <TouchableOpacity key={dd.id} onPress={() => setSelected(i)} style={[styles.designOpt, selected === i && styles.designOptSel]}>
              <View style={[styles.designDot, { backgroundColor: dd.bg }, dd.id === 'classic' && { borderWidth: 1, borderColor: '#CCC' }]}>
                <View style={[styles.designAccent, { backgroundColor: dd.accent }]} />
              </View>
              <Text style={[styles.designNameText, selected === i && { color: Colors.primary }]}>{dd.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity onPress={handleExport} style={styles.exportBtn}>
          <Ionicons name="download-outline" size={18} color={Colors.text} />
          <Text style={styles.exportBtnText}>Export Flyer</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.push('/onboarding/ready')} style={styles.nextBtn}>
          <LinearGradient colors={[...Colors.gradientPrimary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextGrad}>
            <Text style={styles.nextText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/onboarding/ready')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md },
  backBtn: { width: 44, height: 44, borderRadius: BorderRadius.md, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  steps: { flexDirection: 'row', gap: Spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary, width: 24, borderRadius: 4 },
  dotDone: { backgroundColor: Colors.primary },
  scroll: { paddingHorizontal: Spacing.xxl, paddingBottom: 140 },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.black, color: Colors.text, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.xxl, lineHeight: 22 },
  preview: { alignItems: 'center', marginBottom: Spacing.xxl, ...Shadows.elevated },
  flyer: { width: FLYER_W, height: FLYER_H, borderRadius: BorderRadius.lg, padding: Spacing.xxl, overflow: 'hidden' },
  flyerInner: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },
  flyerTop: { alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.xl },
  flyerBiz: { fontSize: FontSize.xxl, fontWeight: FontWeight.black, textAlign: 'center' },
  flyerLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 3 },
  flyerDiv: { height: 1, width: '50%', opacity: 0.2 },
  flyerTagline: { fontSize: FontSize.md, textAlign: 'center', lineHeight: 22 },
  flyerBottom: { alignItems: 'center', gap: 4, paddingBottom: Spacing.md },
  flyerName: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  flyerPhone: { fontSize: FontSize.sm },
  designRow: { gap: Spacing.md, marginBottom: Spacing.xxl },
  designOpt: { alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: 2, borderColor: 'transparent' },
  designOptSel: { borderColor: Colors.primary },
  designDot: { width: 48, height: 32, borderRadius: BorderRadius.sm, marginBottom: Spacing.xs, alignItems: 'center', justifyContent: 'center' },
  designAccent: { width: 10, height: 10, borderRadius: 5 },
  designNameText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md, paddingVertical: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  exportBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.xxl, paddingBottom: Spacing.xxxl, backgroundColor: Colors.bg, borderTopWidth: 1, borderTopColor: Colors.border, alignItems: 'center', gap: Spacing.md },
  nextBtn: { width: '100%', borderRadius: BorderRadius.lg, overflow: 'hidden' },
  nextGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.lg, gap: Spacing.sm, borderRadius: BorderRadius.lg },
  nextText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#FFF' },
  skipText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium },
});
