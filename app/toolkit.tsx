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
}

const TOOLS: ToolItem[] = [
  {
    id: 'flyer',
    name: 'Flyer Generator',
    icon: 'document-text-outline',
    route: '/flyer-generator',
  },
  {
    id: 'business-card',
    name: 'Business Card',
    icon: 'card-outline',
    route: '/business-card',
  },
  {
    id: 'ideas',
    name: 'Business Ideas',
    icon: 'bulb-outline',
    route: '/ideas',
  },
  {
    id: 'pricing',
    name: 'Pricing Calculator',
    icon: 'calculator-outline',
    route: '/pricing-calculator',
  },
];

export default function ToolkitScreen() {
  const router = useRouter();

  const handleToolPress = (tool: ToolItem) => {
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
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Toolkit</Text>
            <Text style={styles.headerSubtitle}>
              Tools to grow your business
            </Text>
          </View>
        </View>

        {/* Tools Grid */}
        <View style={styles.grid}>
          {TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              onPress={() => handleToolPress(tool)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={tool.icon} size={28} color={Colors.primary} />
              </View>
              <Text style={styles.toolName} numberOfLines={2}>
                {tool.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
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
    ...Shadows.card,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryBg,
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
});
