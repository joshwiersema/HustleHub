import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadows,
} from '../src/constants/theme';

const { width } = Dimensions.get('window');
const CARD_GAP = Spacing.md;
const CARD_WIDTH = (width - Spacing.xl * 2 - CARD_GAP) / 2;

interface ToolItem {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  gradient: readonly [string, string, ...string[]];
  comingSoon?: boolean;
}

const TOOLS: ToolItem[] = [
  {
    id: 'flyer',
    name: 'Flyer Generator',
    icon: 'document-text',
    route: '/flyer-generator',
    gradient: Colors.gradientGreen,
  },
  {
    id: 'business-card',
    name: 'Business Card',
    icon: 'card',
    route: '/business-card',
    gradient: Colors.gradientPurple,
  },
  {
    id: 'ideas',
    name: 'Business Ideas',
    icon: 'bulb',
    route: '/ideas',
    gradient: Colors.gradientGold,
  },
  {
    id: 'name-gen',
    name: 'Business Name Generator',
    icon: 'bulb',
    route: '/name-generator',
    gradient: Colors.gradientHero,
  },
  {
    id: 'pricing',
    name: 'Pricing Calculator',
    icon: 'calculator',
    route: '/pricing-calculator',
    gradient: Colors.gradientGreen,
  },
  {
    id: 'invoice',
    name: 'Invoice Template',
    icon: 'receipt',
    route: '/invoice',
    gradient: Colors.gradientDark,
    comingSoon: true,
  },
];

export default function ToolkitScreen() {
  const router = useRouter();

  const handleToolPress = (tool: ToolItem) => {
    if (tool.comingSoon) return;
    router.push(tool.route as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
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
            <Text style={styles.headerTitle}>Toolkit</Text>
            <Text style={styles.headerSubtitle}>
              Everything you need to grow your hustle
            </Text>
          </View>
        </View>

        {/* Tools Grid */}
        <View style={styles.grid}>
          {TOOLS.map((tool, index) => (
            <TouchableOpacity
              key={tool.id}
              style={[
                styles.toolCard,
                tool.comingSoon && styles.toolCardDisabled,
              ]}
              onPress={() => handleToolPress(tool)}
              activeOpacity={tool.comingSoon ? 1 : 0.7}
            >
              <LinearGradient
                colors={tool.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
              >
                <Ionicons name={tool.icon} size={28} color="#FFFFFF" />
              </LinearGradient>
              <Text
                style={[
                  styles.toolName,
                  tool.comingSoon && styles.toolNameDisabled,
                ]}
                numberOfLines={2}
              >
                {tool.name}
              </Text>
              {tool.comingSoon && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>SOON</Text>
                </View>
              )}
              {/* Subtle inventory slot border effect */}
              <View style={styles.slotCornerTL} />
              <View style={styles.slotCornerTR} />
              <View style={styles.slotCornerBL} />
              <View style={styles.slotCornerBR} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom info */}
        <View style={styles.infoBox}>
          <Ionicons name="sparkles" size={20} color={Colors.amber} />
          <Text style={styles.infoText}>
            Use these tools to build your brand and grow your business. More
            tools coming soon!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CORNER_SIZE = 12;
const CORNER_THICKNESS = 2;

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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: CARD_GAP,
  },
  toolCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: CARD_WIDTH * 1.1,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.card,
  },
  toolCardDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  toolName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  toolNameDisabled: {
    color: Colors.textMuted,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.amberBg,
    borderWidth: 1,
    borderColor: Colors.amber,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  comingSoonText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.amber,
    letterSpacing: 1,
  },
  // Inventory slot corner decorations
  slotCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: Colors.primaryBorder,
    borderTopLeftRadius: BorderRadius.lg,
  },
  slotCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: Colors.primaryBorder,
    borderTopRightRadius: BorderRadius.lg,
  },
  slotCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: Colors.primaryBorder,
    borderBottomLeftRadius: BorderRadius.lg,
  },
  slotCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: Colors.primaryBorder,
    borderBottomRightRadius: BorderRadius.lg,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.amberBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginTop: Spacing.xxl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 64, 0.15)',
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
