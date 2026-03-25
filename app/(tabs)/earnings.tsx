import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Modal,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadows,
} from '../../src/constants/theme';
import { Payment, PAYMENT_METHODS } from '../../src/types';
import { usePaymentsStore } from '../../src/store/paymentsStore';
import { useClientsStore } from '../../src/store/clientsStore';
import { useJobsStore } from '../../src/store/jobsStore';
import { useGameStore } from '../../src/store/gameStore';
import { checkBadges } from '../../src/utils/gamification';
import { parseDateString } from '../../src/utils/dateHelpers';
import { useCelebration } from '../../src/components/CelebrationProvider';
import { ScreenHeader, StatCard, EmptyState, Card } from '../../src/components';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type TimeFilter = 'week' | 'month' | 'all';

const TIME_FILTERS: { key: TimeFilter; label: string }[] = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
];

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function EarningsScreen() {
  // Store hooks (granular selectors)
  const payments = usePaymentsStore((s) => s.payments);
  const addPayment = usePaymentsStore((s) => s.addPayment);
  const deletePayment = usePaymentsStore((s) => s.deletePayment);
  const clients = useClientsStore((s) => s.clients);
  const { showXPToast } = useCelebration();

  // Local state
  const [modalVisible, setModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('all');

  // Form fields
  const [formAmount, setFormAmount] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formMethod, setFormMethod] = useState<Payment['method']>('cash');
  const [formDate, setFormDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  // Today's date default
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
  }, []);

  // Initialize formDate when modal opens
  useEffect(() => {
    if (modalVisible) {
      setFormDate(todayStr);
    }
  }, [modalVisible, todayStr]);

  // ---------------------------------------------------------------------------
  // Filter logic
  // ---------------------------------------------------------------------------

  const filteredPayments = useMemo(() => {
    if (activeFilter === 'all') return payments;
    const now = new Date();
    let startDate: Date;
    if (activeFilter === 'week') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return payments.filter((p) => parseDateString(p.date) >= startDate);
  }, [payments, activeFilter]);

  // ---------------------------------------------------------------------------
  // Derived stats
  // ---------------------------------------------------------------------------

  const totalEarnings = useMemo(
    () => filteredPayments.reduce((sum, p) => sum + p.amount, 0),
    [filteredPayments],
  );

  const avgPerPayment = useMemo(
    () => (filteredPayments.length > 0 ? totalEarnings / filteredPayments.length : 0),
    [totalEarnings, filteredPayments],
  );

  const sortedPayments = useMemo(
    () =>
      [...filteredPayments].sort(
        (a, b) => parseDateString(b.date).getTime() - parseDateString(a.date).getTime(),
      ),
    [filteredPayments],
  );

  // ---------------------------------------------------------------------------
  // Bar chart data
  // ---------------------------------------------------------------------------

  const barData = useMemo(() => {
    if (activeFilter === 'week') {
      // 7 bars: one per day for last 7 days (today + 6 prior)
      const now = new Date();
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
        const dayPayments = filteredPayments.filter((p) => {
          const pd = parseDateString(p.date);
          return (
            pd.getFullYear() === d.getFullYear() &&
            pd.getMonth() === d.getMonth() &&
            pd.getDate() === d.getDate()
          );
        });
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return {
          label: dayNames[d.getDay()],
          value: dayPayments.reduce((s, p) => s + p.amount, 0),
        };
      });
    } else if (activeFilter === 'month') {
      // ~4 bars: one per week of current month
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const weeks: { label: string; value: number }[] = [];
      let weekStart = new Date(firstOfMonth);
      let weekNum = 1;
      while (weekStart <= now) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const cap = weekEnd > now ? now : weekEnd;
        const weekPayments = filteredPayments.filter((p) => {
          const pd = parseDateString(p.date);
          return pd >= weekStart && pd <= cap;
        });
        weeks.push({
          label: `W${weekNum}`,
          value: weekPayments.reduce((s, p) => s + p.amount, 0),
        });
        weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() + 1);
        weekNum++;
      }
      return weeks;
    } else {
      // 12 bars: last 12 calendar months
      const now = new Date();
      return Array.from({ length: 12 }, (_, i) => {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
        const monthPayments = payments.filter((p) => {
          const pd = parseDateString(p.date);
          return pd >= monthDate && pd < nextMonth;
        });
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
        ];
        return {
          label: monthNames[monthDate.getMonth()],
          value: monthPayments.reduce((s, p) => s + p.amount, 0),
        };
      });
    }
  }, [filteredPayments, payments, activeFilter]);

  const maxBarValue = useMemo(
    () => Math.max(...barData.map((b) => b.value), 0),
    [barData],
  );

  // ---------------------------------------------------------------------------
  // Client picker filtered list
  // ---------------------------------------------------------------------------

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [clients, clientSearch]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleOpenAdd = useCallback(() => {
    setFormAmount('');
    setFormClientName('');
    setFormMethod('cash');
    setFormDate(todayStr);
    setFormNotes('');
    setShowClientPicker(false);
    setClientSearch('');
    setModalVisible(true);
  }, [todayStr]);

  const handleSave = useCallback(() => {
    const amt = parseFloat(formAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (!formClientName.trim()) {
      Alert.alert('Missing Client', 'Please enter a client name.');
      return;
    }

    const newPayment: Payment = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      clientName: formClientName.trim(),
      amount: amt,
      method: formMethod,
      date: formDate || todayStr,
      notes: formNotes.trim(),
    };

    addPayment(newPayment);

    // Gamification orchestration (screen-level)
    const gs = useGameStore.getState();
    gs.addXP(20);
    gs.updateStreak();

    const updated = useGameStore.getState();
    const allPayments = usePaymentsStore.getState().payments;
    const newBadges = checkBadges(
      { earnedBadges: updated.earnedBadges, streak: updated.streak },
      {
        totalClients: useClientsStore.getState().clients.length,
        completedJobs: useJobsStore.getState().jobs.filter((j) => j.status === 'completed').length,
        totalEarnings: allPayments.reduce((s, p) => s + p.amount, 0),
      },
    );
    newBadges.forEach((id) => useGameStore.getState().earnBadge(id));
    showXPToast(20);

    setModalVisible(false);
  }, [formAmount, formClientName, formMethod, formDate, formNotes, todayStr, addPayment, showXPToast]);

  const handleCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleDeletePayment = useCallback(
    (payment: Payment) => {
      Alert.alert(
        'Delete Payment',
        `Delete $${payment.amount.toFixed(2)} from ${payment.clientName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deletePayment(payment.id),
          },
        ],
      );
    },
    [deletePayment],
  );

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const getMethodIcon = useCallback((method: Payment['method']) => {
    const found = PAYMENT_METHODS.find((m) => m.id === method);
    return found ? found.icon : 'ellipsis-horizontal';
  }, []);

  const renderPaymentRow = useCallback(
    ({ item }: { item: Payment }) => (
      <Pressable
        onLongPress={() => handleDeletePayment(item)}
        style={({ pressed }) => [styles.paymentRow, pressed && styles.paymentRowPressed]}
      >
        <View style={styles.paymentLeft}>
          <Text style={styles.paymentClient} numberOfLines={1}>
            {item.clientName}
          </Text>
          <Text style={styles.paymentDate}>{item.date}</Text>
        </View>
        <View style={styles.paymentRight}>
          <Text style={styles.paymentAmount}>${item.amount.toFixed(2)}</Text>
          <Ionicons name={getMethodIcon(item.method) as any} size={16} color={Colors.textSecondary} />
        </View>
      </Pressable>
    ),
    [handleDeletePayment, getMethodIcon],
  );

  const keyExtractor = useCallback((item: Payment) => item.id, []);

  const listEmpty = useCallback(
    () => (
      <EmptyState
        icon="receipt-outline"
        title="No payments yet"
        subtitle="Tap + to log your first payment"
      />
    ),
    [],
  );

  // ---------------------------------------------------------------------------
  // Bar chart render helper
  // ---------------------------------------------------------------------------

  const barWidth = useMemo(() => {
    const colWidth = barData.length > 0 ? Math.floor(300 / barData.length) : 24;
    return Math.max(16, Math.min(32, Math.floor(colWidth * 0.6)));
  }, [barData]);

  // ---------------------------------------------------------------------------
  // List header (all content above payment list)
  // ---------------------------------------------------------------------------

  const listHeader = useMemo(
    () => (
      <View>
        <ScreenHeader title="Earnings" subtitle="Track your money" />

        {/* Giant total */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalAmount}>
            ${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
          <Text style={styles.totalLabel}>Total Earnings</Text>
        </View>

        {/* Time filter pills */}
        <View style={styles.pillRow}>
          {TIME_FILTERS.map((filter) => (
            <Pressable
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[styles.pill, activeFilter === filter.key && styles.pillActive]}
            >
              <Text
                style={[
                  styles.pillText,
                  activeFilter === filter.key && styles.pillTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Bar chart */}
        <Card>
          {maxBarValue > 0 ? (
            <View style={styles.barsRow}>
              {barData.map((item, i) => (
                <View key={`bar-${i}`} style={styles.barColumn}>
                  {item.value > 0 && (
                    <Text style={styles.barAmount}>
                      ${item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value.toFixed(0)}
                    </Text>
                  )}
                  <View
                    style={[
                      styles.bar,
                      {
                        height: maxBarValue > 0 ? (item.value / maxBarValue) * 120 : 0,
                        minHeight: item.value > 0 ? 4 : 0,
                        width: barWidth,
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.chartEmpty}>
              <Ionicons name="bar-chart-outline" size={32} color={Colors.textMuted} />
              <Text style={styles.chartEmptyText}>No data for this period</Text>
            </View>
          )}
        </Card>

        {/* Summary stats row */}
        <View style={styles.statsRow}>
          <StatCard
            label="Total"
            value={`$${totalEarnings.toFixed(0)}`}
            icon="cash-outline"
            color={Colors.primary}
          />
          <StatCard
            label="Average"
            value={`$${avgPerPayment.toFixed(0)}`}
            icon="trending-up-outline"
            color={Colors.amber}
          />
          <StatCard
            label="Payments"
            value={sortedPayments.length.toString()}
            icon="receipt-outline"
            color={Colors.secondary}
          />
        </View>

        {/* Section header */}
        <Text style={styles.sectionTitle}>Payment History</Text>
      </View>
    ),
    [totalEarnings, activeFilter, barData, maxBarValue, barWidth, avgPerPayment, sortedPayments.length],
  );

  // ---------------------------------------------------------------------------
  // Modal form header
  // ---------------------------------------------------------------------------

  const modalFormContent = useMemo(
    () => (
      <View style={styles.formContainer}>
        {/* Amount field */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountPrefix}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={Colors.textMuted}
            value={formAmount}
            onChangeText={setFormAmount}
            keyboardType="numeric"
            autoFocus
          />
        </View>

        {/* Client name field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Client</Text>
          {!showClientPicker ? (
            <Pressable
              onPress={() => setShowClientPicker(true)}
              style={styles.clientPickerButton}
            >
              <Text
                style={[
                  styles.clientPickerText,
                  !formClientName && { color: Colors.textMuted },
                ]}
              >
                {formClientName || 'Select client...'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.textMuted} />
            </Pressable>
          ) : (
            <View>
              <TextInput
                style={styles.fieldInput}
                placeholder="Search clients..."
                placeholderTextColor={Colors.textMuted}
                value={clientSearch}
                onChangeText={setClientSearch}
                autoCapitalize="words"
              />
              <View style={styles.clientList}>
                {filteredClients.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => {
                      setFormClientName(c.name);
                      setShowClientPicker(false);
                      setClientSearch('');
                    }}
                    style={({ pressed }) => [
                      styles.clientOption,
                      pressed && styles.clientOptionPressed,
                    ]}
                  >
                    <Text style={styles.clientOptionText}>{c.name}</Text>
                  </Pressable>
                ))}
                {filteredClients.length === 0 && (
                  <Text style={styles.clientNoResults}>No clients found</Text>
                )}
              </View>
              <View style={styles.manualEntryRow}>
                <Text style={styles.manualEntryLabel}>Or type a name:</Text>
                <TextInput
                  style={[styles.fieldInput, { flex: 1, marginLeft: Spacing.sm }]}
                  placeholder="Client name"
                  placeholderTextColor={Colors.textMuted}
                  value={formClientName}
                  onChangeText={(text) => {
                    setFormClientName(text);
                    if (text.length > 0) {
                      setShowClientPicker(false);
                      setClientSearch('');
                    }
                  }}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}
        </View>

        {/* Payment method pills */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Payment Method</Text>
          <View style={styles.methodRow}>
            {PAYMENT_METHODS.map((method) => (
              <Pressable
                key={method.id}
                onPress={() => setFormMethod(method.id as Payment['method'])}
                style={[
                  styles.methodPill,
                  formMethod === method.id && styles.methodPillActive,
                ]}
              >
                <Ionicons name={method.icon as any} size={16} color={formMethod === method.id ? Colors.primary : Colors.textMuted} />
                <Text
                  style={[
                    styles.methodLabel,
                    formMethod === method.id && styles.methodLabelActive,
                  ]}
                >
                  {method.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Date field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Date</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="MM/DD/YYYY"
            placeholderTextColor={Colors.textMuted}
            value={formDate}
            onChangeText={setFormDate}
            keyboardType="numeric"
          />
        </View>

        {/* Notes field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Notes (optional)</Text>
          <TextInput
            style={[styles.fieldInput, styles.notesInput]}
            placeholder="Add a note..."
            placeholderTextColor={Colors.textMuted}
            value={formNotes}
            onChangeText={setFormNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>
    ),
    [formAmount, formClientName, formMethod, formDate, formNotes, showClientPicker, clientSearch, filteredClients],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <FlatList
          data={sortedPayments}
          keyExtractor={keyExtractor}
          renderItem={renderPaymentRow}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={<View style={{ height: Spacing.huge }} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        {/* FAB */}
        <Pressable
          onPress={handleOpenAdd}
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        >
          <LinearGradient
            colors={Colors.gradientGreen}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color={Colors.textInverse} />
          </LinearGradient>
        </Pressable>

        {/* Add Payment Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCancel}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <SafeAreaView style={styles.modalSafe} edges={['top']}>
              {/* Modal header */}
              <View style={styles.modalHeader}>
                <Pressable onPress={handleCancel} style={styles.modalHeaderBtn}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>

                <Text style={styles.modalTitle}>Log Payment</Text>

                <Pressable onPress={handleSave} style={styles.modalHeaderBtn}>
                  <Text style={styles.modalSaveText}>Save</Text>
                </Pressable>
              </View>

              {/* Form */}
              <FlatList
                data={[]}
                renderItem={null}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={modalFormContent}
              />
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },

  // Total earnings display
  totalContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  totalAmount: {
    fontSize: FontSize.mega,
    fontWeight: FontWeight.black,
    color: Colors.primary,
    textAlign: 'center',
  },
  totalLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },

  // Time filter pills
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  pillTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },

  // Bar chart
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 20,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barAmount: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  bar: {
    backgroundColor: Colors.primary,
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
  },
  barLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },
  chartEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  chartEmptyText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  // Section title
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },

  // Payment rows
  paymentRow: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  paymentRowPressed: {
    backgroundColor: Colors.bgCardHover,
    transform: [{ scale: 0.98 }],
  },
  paymentLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  paymentClient: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  paymentDate: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    color: Colors.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  paymentMethod: {
    fontSize: FontSize.md,
    marginTop: 2,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    zIndex: 10,
    ...Shadows.elevated,
  },
  fabPressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.9,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  modalSafe: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalHeaderBtn: {
    minWidth: 60,
    minHeight: 44,
    justifyContent: 'center',
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  modalSaveText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    textAlign: 'right',
  },

  // Form
  formContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.huge,
  },

  // Amount input
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },
  amountPrefix: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginRight: Spacing.xs,
  },
  amountInput: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    textAlign: 'center',
    minWidth: 120,
  },

  // Fields
  fieldContainer: {
    marginBottom: Spacing.xl,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  fieldInput: {
    backgroundColor: Colors.bgInput,
    color: Colors.text,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 48,
    fontSize: FontSize.md,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
    height: undefined,
  },

  // Client picker
  clientPickerButton: {
    backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clientPickerText: {
    color: Colors.text,
    fontSize: FontSize.md,
  },
  clientList: {
    marginTop: Spacing.sm,
    maxHeight: 160,
    backgroundColor: Colors.bgElevated,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  clientOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  clientOptionPressed: {
    backgroundColor: Colors.bgCardHover,
  },
  clientOptionText: {
    color: Colors.text,
    fontSize: FontSize.md,
  },
  clientNoResults: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    padding: Spacing.md,
    textAlign: 'center',
  },
  manualEntryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  manualEntryLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },

  // Payment method pills
  methodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  methodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  methodPillActive: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  methodEmoji: {
    fontSize: FontSize.md,
  },
  methodLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  methodLabelActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
});
