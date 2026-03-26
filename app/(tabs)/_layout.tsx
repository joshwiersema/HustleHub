import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';
import { Colors, Shadows } from '../../src/constants/theme';

type TabIcon = keyof typeof Ionicons.glyphMap;

interface TabConfig {
  name: string;
  title: string;
  iconFocused: TabIcon;
  iconDefault: TabIcon;
}

const TABS: TabConfig[] = [
  { name: 'index', title: 'Home', iconFocused: 'home', iconDefault: 'home-outline' },
  { name: 'jobs', title: 'Jobs', iconFocused: 'briefcase', iconDefault: 'briefcase-outline' },
  { name: 'clients', title: 'Clients', iconFocused: 'people', iconDefault: 'people-outline' },
  { name: 'earnings', title: 'Earnings', iconFocused: 'wallet', iconDefault: 'wallet-outline' },
  { name: 'profile', title: 'Profile', iconFocused: 'person-circle', iconDefault: 'person-circle-outline' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: Colors.bg,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: Colors.border,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          ...Shadows.card,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.iconDefault}
                size={size ?? 24}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
