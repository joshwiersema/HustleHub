import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadows,
} from '../src/constants/theme';
import { Job } from '../src/types';
import { useJobsStore } from '../src/store/jobsStore';
import { useClientsStore } from '../src/store/clientsStore';
import { useGameStore } from '../src/store/gameStore';
import { checkBadges } from '../src/utils/gamification';
import { usePaymentsStore } from '../src/store/paymentsStore';
import { useCelebration } from '../src/components/CelebrationProvider';
import { getNextOccurrenceDate, formatDuration } from '../src/utils/dateHelpers';

const DURATION_OPTIONS = [
  { label: '30min', value: 30 },
  { label: '1hr', value: 60 },
  { label: '1.5hr', value: 90 },
  { label: '2hr', value: 120 },
];

const RECURRING_OPTIONS: { label: string; value: 'weekly' | 'biweekly' | 'monthly' }[] = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Biweekly', value: 'biweekly' },
  { label: 'Monthly', value: 'monthly' },
];

export default function JobDetailScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();

  // Synchronous Zustand selectors -- no loading state needed
  const job = useJobsStore((s) => s.jobs.find((j) => j.id === jobId));
  const client = useClientsStore((s) =>
    job ? s.clients.find((c) => c.id === job.clientId) : undefined
  );
  const updateJob = useJobsStore((s) => s.updateJob);
  const deleteJobAction = useJobsStore((s) => s.deleteJob);
  const completeJobAction = useJobsStore((s) => s.completeJob);
  const addJobAction = useJobsStore((s) => s.addJob);
  const { showXPToast } = useCelebration();

  const [editModalVisible, setEditModalVisible] = useState(false);

  // Edit form state
  const [formClientName, setFormClientName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formDuration, setFormDuration] = useState(60);
  const [formPrice, setFormPrice] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formRecurring, setFormRecurring] = useState(false);
  const [formRecurringFrequency, setFormRecurringFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [formNotes, setFormNotes] = useState('');

  const populateEditForm = (j: Job) => {
    setFormClientName(j.clientName);
    setFormTitle(j.title);
    setFormDate(j.date);
    setFormTime(j.time);
    setFormDuration(j.duration);
    setFormPrice(j.price.toString());
    setFormAddress(j.address);
    setFormRecurring(j.recurring);
    setFormRecurringFrequency(j.recurringFrequency || 'weekly');
    setFormNotes(j.notes);
  };

  const handleMarkComplete = () => {
    if (!job) return;
    Alert.alert(
      'Complete Job',
      `Mark "${job.title}" as complete? You'll earn 25 XP!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            // 1. Mark complete in store
            completeJobAction(job.id);
            // 2. Award XP (triggers level calc + HustleBucks)
            const gameState = useGameStore.getState();
            gameState.addXP(25);
            // 3. Update streak
            gameState.updateStreak();
            // 4. Check badges
            const updated = useGameStore.getState();
            const allJobs = useJobsStore.getState().jobs;
            const newBadges = checkBadges(
              { earnedBadges: updated.earnedBadges, streak: updated.streak },
              {
                totalClients: useClientsStore.getState().clients.length,
                completedJobs: allJobs.filter(j => j.status === 'completed').length,
                totalEarnings: usePaymentsStore.getState().payments.reduce((s, p) => s + p.amount, 0),
              }
            );
            newBadges.forEach(id => useGameStore.getState().earnBadge(id));
            // 5. Show XP toast
            showXPToast(25);
            // 6. Auto-generate next occurrence for recurring jobs
            if (job.recurring && job.recurringFrequency) {
              const nextDate = getNextOccurrenceDate(job.date, job.recurringFrequency);
              const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);
              const nextJob: Job = {
                ...job,
                id: newId,
                date: nextDate,
                status: 'upcoming' as const,
              };
              addJobAction(nextJob);
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    if (!job) return;
    Alert.alert(
      'Delete Job',
      `Are you sure you want to delete "${job.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteJobAction(job.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleSaveEdit = () => {
    if (!job) return;
    if (!formTitle.trim()) {
      Alert.alert('Missing Info', 'Please enter a job title.');
      return;
    }
    if (!formDate.trim()) {
      Alert.alert('Missing Info', 'Please enter a date.');
      return;
    }
    if (!formPrice.trim()) {
      Alert.alert('Missing Info', 'Please enter a price.');
      return;
    }

    updateJob(job.id, {
      clientName: formClientName.trim(),
      title: formTitle.trim(),
      date: formDate.trim(),
      time: formTime.trim(),
      duration: formDuration,
      price: parseFloat(formPrice) || 0,
      address: formAddress.trim(),
      recurring: formRecurring,
      recurringFrequency: formRecurring ? formRecurringFrequency : undefined,
      notes: formNotes.trim(),
    });
    setEditModalVisible(false);
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'upcoming':
        return Colors.info;
      case 'completed':
        return Colors.success;
      case 'cancelled':
        return Colors.error;
    }
  };

  if (!job) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Job Not Found</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyStateText}>This job could not be found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(job.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Job Details
        </Text>
        <Pressable
          style={styles.editHeaderButton}
          onPress={() => {
            populateEditForm(job);
            setEditModalVisible(true);
          }}
        >
          <Ionicons name="create-outline" size={22} color={Colors.info} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status & Title Card */}
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                {job.status === 'completed' && (
                  <Ionicons name="checkmark-circle" size={16} color={statusColor} style={{ marginRight: 4 }} />
                )}
                <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.priceTag}>${job.price.toFixed(2)}</Text>
          </View>
        </View>

        {/* Schedule Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Schedule</Text>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={18} color={Colors.info} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{job.date}</Text>
            </View>
          </View>
          {job.time ? (
            <View style={styles.detailRow}>
              <Ionicons name="time" size={18} color={Colors.info} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{job.time}</Text>
              </View>
            </View>
          ) : null}
          <View style={styles.detailRow}>
            <Ionicons name="hourglass" size={18} color={Colors.info} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{formatDuration(job.duration)}</Text>
            </View>
          </View>
          {job.recurring && (
            <View style={styles.detailRow}>
              <Ionicons name="repeat" size={18} color={Colors.secondary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Recurring</Text>
                <Text style={[styles.detailValue, { color: Colors.secondary }]}>
                  {job.recurringFrequency
                    ? job.recurringFrequency.charAt(0).toUpperCase() + job.recurringFrequency.slice(1)
                    : 'Yes'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Client Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Client</Text>
          <View style={styles.clientRow}>
            <View style={styles.clientAvatar}>
              <Text style={styles.clientAvatarText}>
                {job.clientName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.clientName}>
                {job.clientName}
                {!client && (
                  <Text style={{ color: Colors.textMuted }}> (deleted)</Text>
                )}
              </Text>
              {client?.phone ? (
                <Text style={styles.clientDetail}>{client.phone}</Text>
              ) : null}
              {client?.email ? (
                <Text style={styles.clientDetail}>{client.email}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Location Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Location</Text>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color={Colors.error} />
            <Text style={styles.addressText}>
              {job.address || 'No address set'}
            </Text>
          </View>
        </View>

        {/* Notes Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Notes</Text>
          <Text style={styles.notesText}>
            {job.notes || 'No notes'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {job.status === 'upcoming' && (
            <Pressable style={styles.completeButtonWrapper} onPress={handleMarkComplete}>
              <LinearGradient
                colors={Colors.gradientGreen}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.completeButton}
              >
                <Ionicons name="checkmark-circle" size={22} color={Colors.textInverse} />
                <Text style={styles.completeButtonText}>Mark as Complete (+25 XP)</Text>
              </LinearGradient>
            </Pressable>
          )}

          <Pressable
            style={styles.editButton}
            onPress={() => {
              populateEditForm(job);
              setEditModalVisible(true);
            }}
          >
            <Ionicons name="create-outline" size={20} color={Colors.info} />
            <Text style={[styles.actionButtonText, { color: Colors.info }]}>Edit Job</Text>
          </Pressable>

          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
            <Text style={[styles.actionButtonText, { color: Colors.error }]}>Delete Job</Text>
          </Pressable>
        </View>

        <View style={{ height: Spacing.huge }} />
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <SafeAreaView style={styles.modalContainer} edges={['top']}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>Edit Job</Text>
              <Pressable onPress={handleSaveEdit}>
                <Text style={styles.modalSave}>Save</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Client Name */}
              <Text style={styles.inputLabel}>Client</Text>
              <TextInput
                style={styles.input}
                placeholder="Client name"
                placeholderTextColor={Colors.textMuted}
                value={formClientName}
                onChangeText={setFormClientName}
              />

              {/* Job Title */}
              <Text style={styles.inputLabel}>Job Title</Text>
              <TextInput
                style={styles.input}
                placeholder='e.g., "Front yard mow"'
                placeholderTextColor={Colors.textMuted}
                value={formTitle}
                onChangeText={setFormTitle}
              />

              {/* Date */}
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={Colors.textMuted}
                value={formDate}
                onChangeText={setFormDate}
                keyboardType="numbers-and-punctuation"
              />

              {/* Time */}
              <Text style={styles.inputLabel}>Time</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2:00 PM"
                placeholderTextColor={Colors.textMuted}
                value={formTime}
                onChangeText={setFormTime}
              />

              {/* Duration */}
              <Text style={styles.inputLabel}>Duration</Text>
              <View style={styles.durationRow}>
                {DURATION_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.durationButton,
                      formDuration === opt.value && styles.durationButtonActive,
                    ]}
                    onPress={() => setFormDuration(opt.value)}
                  >
                    <Text
                      style={[
                        styles.durationButtonText,
                        formDuration === opt.value && styles.durationButtonTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Price */}
              <Text style={styles.inputLabel}>Price ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
                value={formPrice}
                onChangeText={setFormPrice}
                keyboardType="decimal-pad"
              />

              {/* Address */}
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Job location address"
                placeholderTextColor={Colors.textMuted}
                value={formAddress}
                onChangeText={setFormAddress}
              />

              {/* Recurring */}
              <Text style={styles.inputLabel}>Recurring</Text>
              <Pressable
                style={styles.toggleRow}
                onPress={() => setFormRecurring(!formRecurring)}
              >
                <Text style={styles.toggleLabel}>Repeat this job</Text>
                <View style={[styles.toggle, formRecurring && styles.toggleActive]}>
                  <View style={[styles.toggleKnob, formRecurring && styles.toggleKnobActive]} />
                </View>
              </Pressable>

              {formRecurring && (
                <View style={styles.recurringOptions}>
                  {RECURRING_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={[
                        styles.recurringOptionButton,
                        formRecurringFrequency === opt.value && styles.recurringOptionButtonActive,
                      ]}
                      onPress={() => setFormRecurringFrequency(opt.value)}
                    >
                      <Text
                        style={[
                          styles.recurringOptionText,
                          formRecurringFrequency === opt.value && styles.recurringOptionTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Notes */}
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any special instructions..."
                placeholderTextColor={Colors.textMuted}
                value={formNotes}
                onChangeText={setFormNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* Save Button */}
              <Pressable style={styles.saveButtonWrapper} onPress={handleSaveEdit}>
                <LinearGradient
                  colors={Colors.gradientGreen}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveEditButton}
                >
                  <Text style={styles.saveEditButtonText}>Save Changes</Text>
                </LinearGradient>
              </Pressable>

              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  editHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.heavy,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  priceTag: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.heavy,
    color: Colors.primary,
  },
  cardSectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryBg,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientAvatarText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  clientName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  clientDetail: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addressText: {
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  notesText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  actionsContainer: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  completeButtonWrapper: {
    ...Shadows.card,
  },
  completeButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  completeButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.info,
    backgroundColor: Colors.info + '10',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: Colors.error + '10',
  },
  actionButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  emptyStateText: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCancel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  modalSave: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  textArea: {
    minHeight: 80,
    paddingTop: Spacing.md,
  },
  durationRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  durationButton: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  durationButtonActive: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primaryBorder,
  },
  durationButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  durationButtonTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  toggleLabel: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.textMuted,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.text,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  recurringOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  recurringOptionButton: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  recurringOptionButtonActive: {
    backgroundColor: Colors.secondaryBg,
    borderColor: Colors.secondaryBorder,
  },
  recurringOptionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  recurringOptionTextActive: {
    color: Colors.secondary,
    fontWeight: FontWeight.bold,
  },
  saveButtonWrapper: {
    marginTop: Spacing.xxl,
    ...Shadows.card,
  },
  saveEditButton: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveEditButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },
});
