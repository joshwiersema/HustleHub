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
  GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadows,
} from '../../src/constants/theme';
import { Job } from '../../src/types';
import { useJobsStore } from '../../src/store/jobsStore';
import { useClientsStore } from '../../src/store/clientsStore';
import { useGameStore } from '../../src/store/gameStore';
import { checkBadges } from '../../src/utils/gamification';
import { usePaymentsStore } from '../../src/store/paymentsStore';
import { useCelebration } from '../../src/components/CelebrationProvider';
import { EmptyState, ScreenHeader } from '../../src/components';
import {
  parseDateString,
  getNextOccurrenceDate,
  formatDuration,
} from '../../src/utils/dateHelpers';
import { generateId } from '../../src/utils/generateId';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FilterTab = 'upcoming' | 'completed' | 'all';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'all', label: 'All' },
];

const DURATION_OPTIONS = [
  { label: '30min', value: 30 },
  { label: '1hr', value: 60 },
  { label: '1.5hr', value: 90 },
  { label: '2hr', value: 120 },
];

const FREQUENCY_OPTIONS: {
  label: string;
  value: 'weekly' | 'biweekly' | 'monthly';
}[] = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Biweekly', value: 'biweekly' },
  { label: 'Monthly', value: 'monthly' },
];

// ---------------------------------------------------------------------------
// JobCard -- memoized for FlatList performance
// ---------------------------------------------------------------------------

interface JobCardProps {
  job: Job;
  onPress: (id: string) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const JobCard = React.memo(function JobCard({
  job,
  onPress,
  onComplete,
  onDelete,
}: JobCardProps) {
  const statusColors: Record<
    string,
    { bg: string; text: string }
  > = {
    upcoming: { bg: 'rgba(64, 196, 255, 0.15)', text: Colors.info },
    completed: { bg: 'rgba(0, 230, 118, 0.15)', text: Colors.success },
    cancelled: { bg: 'rgba(255, 82, 82, 0.15)', text: Colors.error },
  };

  const badge = statusColors[job.status] ?? statusColors.upcoming;

  return (
    <Pressable
      onPress={() => onPress(job.id)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Top row: title + status badge */}
      <View style={styles.cardTopRow}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {job.title}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusText, { color: badge.text }]}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Client name */}
      <View style={styles.infoRow}>
        <Ionicons name="person-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.infoText}>{job.clientName}</Text>
      </View>

      {/* Schedule + recurring badge */}
      <View style={styles.infoRow}>
        <Ionicons
          name="calendar-outline"
          size={14}
          color={Colors.textSecondary}
        />
        <Text style={styles.infoText}>
          {job.date}
          {job.time ? ` at ${job.time}` : ''}
        </Text>
        {job.recurring && (
          <Ionicons
            name="repeat-outline"
            size={14}
            color={Colors.info}
            style={{ marginLeft: Spacing.sm }}
          />
        )}
      </View>

      {/* Duration */}
      <View style={styles.infoRow}>
        <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.infoText}>{formatDuration(job.duration)}</Text>
      </View>

      {/* Price */}
      <Text style={styles.priceText}>${job.price.toFixed(2)}</Text>

      {/* Bottom row: Mark Complete (upcoming only) */}
      {job.status === 'upcoming' && (
        <View style={styles.bottomRow}>
          <Pressable
            onPress={(e: GestureResponderEvent) => {
              e.stopPropagation();
              onComplete(job.id);
            }}
            style={styles.completeButton}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={Colors.success}
            />
            <Text style={styles.completeText}>Mark Complete</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
});

// ---------------------------------------------------------------------------
// ItemSeparator
// ---------------------------------------------------------------------------

function ItemSeparator() {
  return <View style={{ height: Spacing.sm }} />;
}

// ---------------------------------------------------------------------------
// FormField helper
// ---------------------------------------------------------------------------

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  multiline,
  numberOfLines,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?:
    | 'default'
    | 'phone-pad'
    | 'email-address'
    | 'decimal-pad'
    | 'numbers-and-punctuation';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  multiline?: boolean;
  numberOfLines?: number;
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[
          styles.fieldInput,
          multiline && {
            minHeight: 80,
            textAlignVertical: 'top',
            paddingTop: Spacing.md,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function JobsScreen() {
  const router = useRouter();

  // Store hooks
  const jobs = useJobsStore((s) => s.jobs);
  const addJob = useJobsStore((s) => s.addJob);
  const updateJob = useJobsStore((s) => s.updateJob);
  const deleteJob = useJobsStore((s) => s.deleteJob);
  const clients = useClientsStore((s) => s.clients);
  const { showXPToast } = useCelebration();

  // Filter state
  const [activeTab, setActiveTab] = useState<FilterTab>('upcoming');

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | undefined>(undefined);

  // Form state
  const [formClientId, setFormClientId] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formDuration, setFormDuration] = useState(60);
  const [formPrice, setFormPrice] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formRecurring, setFormRecurring] = useState(false);
  const [formRecurringFrequency, setFormRecurringFrequency] = useState<
    'weekly' | 'biweekly' | 'monthly'
  >('weekly');
  const [formNotes, setFormNotes] = useState('');

  // Client picker state
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  // Derived data
  const upcomingCount = useMemo(
    () => jobs.filter((j) => j.status === 'upcoming').length,
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    let filtered =
      activeTab === 'all'
        ? jobs
        : jobs.filter((j) => j.status === activeTab);
    return [...filtered].sort((a, b) => {
      const dateA = parseDateString(a.date);
      const dateB = parseDateString(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [jobs, activeTab]);

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [clients, clientSearch]);

  // Populate form when editing
  useEffect(() => {
    if (modalVisible && editingJob) {
      setFormClientId(editingJob.clientId);
      setFormClientName(editingJob.clientName);
      setFormTitle(editingJob.title);
      setFormDate(editingJob.date);
      setFormTime(editingJob.time);
      setFormDuration(editingJob.duration);
      setFormPrice(editingJob.price.toString());
      setFormAddress(editingJob.address);
      setFormRecurring(editingJob.recurring);
      setFormRecurringFrequency(editingJob.recurringFrequency ?? 'weekly');
      setFormNotes(editingJob.notes);
    } else if (modalVisible && !editingJob) {
      setFormClientId('');
      setFormClientName('');
      setFormTitle('');
      setFormDate('');
      setFormTime('');
      setFormDuration(60);
      setFormPrice('');
      setFormAddress('');
      setFormRecurring(false);
      setFormRecurringFrequency('weekly');
      setFormNotes('');
    }
    setShowClientPicker(false);
    setClientSearch('');
  }, [modalVisible, editingJob]);

  // Handlers ----------------------------------------------------------------

  const handleOpenAdd = useCallback(() => {
    setEditingJob(undefined);
    setModalVisible(true);
  }, []);

  const handleOpenEdit = useCallback((job: Job) => {
    setEditingJob(job);
    setModalVisible(true);
  }, []);

  const handleCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!formClientId) {
      Alert.alert('Missing Info', 'Please select a client.');
      return;
    }
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

    const jobData = {
      clientId: formClientId,
      clientName: formClientName,
      title: formTitle.trim(),
      date: formDate.trim(),
      time: formTime.trim(),
      duration: formDuration,
      price: parseFloat(formPrice) || 0,
      address: formAddress.trim(),
      recurring: formRecurring,
      recurringFrequency: formRecurring ? formRecurringFrequency : undefined,
      notes: formNotes.trim(),
    };

    if (editingJob) {
      updateJob(editingJob.id, jobData);
    } else {
      const newJob: Job = {
        id: generateId(),
        ...jobData,
        status: 'upcoming',
      };
      addJob(newJob);
    }

    setModalVisible(false);
  }, [
    formClientId,
    formClientName,
    formTitle,
    formDate,
    formTime,
    formDuration,
    formPrice,
    formAddress,
    formRecurring,
    formRecurringFrequency,
    formNotes,
    editingJob,
    addJob,
    updateJob,
  ]);

  const handleDelete = useCallback(
    (id: string) => {
      const job = jobs.find((j) => j.id === id);
      const title = job ? job.title : 'this job';
      Alert.alert(
        'Delete Job',
        `Are you sure you want to delete "${title}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteJob(id),
          },
        ],
      );
    },
    [jobs, deleteJob],
  );

  const completeJobWithOptionalPhoto = useCallback(
    (jobId: string, photoUri?: string) => {
      // Read job directly from store to avoid stale closure issues
      const job = useJobsStore.getState().jobs.find((j) => j.id === jobId);
      if (!job) return;

      // 1. Mark current job as completed, optionally with photo
      useJobsStore.getState().completeJob(jobId);
      if (photoUri) {
        useJobsStore.getState().updateJob(jobId, { photoUri });
      }

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
        const nextDate = getNextOccurrenceDate(
          job.date,
          job.recurringFrequency,
        );
        const nextJob: Job = {
          ...job,
          id: generateId(),
          date: nextDate,
          status: 'upcoming',
        };
        useJobsStore.getState().addJob(nextJob);
      }
    },
    [showXPToast],
  );

  const handleComplete = useCallback(
    (jobId: string) => {
      if (Platform.OS === 'web') {
        // On web, skip the photo prompt (image picker UX is poor)
        // and use window.confirm for reliability
        const confirmed = window.confirm('Mark this job as complete?');
        if (confirmed) {
          completeJobWithOptionalPhoto(jobId);
        }
        return;
      }
      Alert.alert(
        'Complete Job',
        'Would you like to add a photo of your finished work?',
        [
          {
            text: 'Skip',
            onPress: () => completeJobWithOptionalPhoto(jobId),
          },
          {
            text: 'Add Photo',
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.8,
              });
              if (!result.canceled && result.assets[0]) {
                completeJobWithOptionalPhoto(jobId, result.assets[0].uri);
              } else {
                completeJobWithOptionalPhoto(jobId);
              }
            },
          },
        ],
      );
    },
    [completeJobWithOptionalPhoto],
  );

  const handleCardPress = useCallback(
    (id: string) => {
      handleOpenEdit(jobs.find((j) => j.id === id)!);
    },
    [jobs, handleOpenEdit],
  );

  // Render helpers -----------------------------------------------------------

  const renderItem = useCallback(
    ({ item }: { item: Job }) => (
      <JobCard
        job={item}
        onPress={handleCardPress}
        onComplete={handleComplete}
        onDelete={handleDelete}
      />
    ),
    [handleCardPress, handleComplete, handleDelete],
  );

  const keyExtractor = useCallback((item: Job) => item.id, []);

  const emptySubtitle = useMemo(() => {
    if (activeTab === 'upcoming') return 'No upcoming jobs scheduled';
    if (activeTab === 'completed') return 'No completed jobs yet';
    return 'Add your first job to get started';
  }, [activeTab]);

  const listEmpty = useCallback(
    () => (
      <EmptyState
        icon="briefcase-outline"
        title="No jobs yet"
        subtitle={emptySubtitle}
        actionLabel="Add Job"
        onAction={handleOpenAdd}
      />
    ),
    [emptySubtitle, handleOpenAdd],
  );

  // -------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="My Jobs"
        subtitle={`${upcomingCount} upcoming`}
      />

      {/* Tab filter bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tab,
                isActive ? styles.tabActive : styles.tabInactive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Job list */}
      <FlatList
        data={filteredJobs}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={listEmpty}
        ItemSeparatorComponent={ItemSeparator}
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

      {/* Add / Edit Modal */}
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

              <Text style={styles.modalTitle}>
                {editingJob ? 'Edit Job' : 'Add Job'}
              </Text>

              <Pressable
                onPress={handleSave}
                disabled={!formTitle.trim() || !formClientId}
                style={styles.modalHeaderBtn}
              >
                <Text
                  style={[
                    styles.modalSaveText,
                    (!formTitle.trim() || !formClientId) &&
                      styles.modalSaveDisabled,
                  ]}
                >
                  Save
                </Text>
              </Pressable>
            </View>

            {/* Form */}
            <FlatList
              data={[]}
              renderItem={null}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                <View style={styles.formContainer}>
                  {/* Client picker */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Client *</Text>
                    <Pressable
                      onPress={() => setShowClientPicker(!showClientPicker)}
                      style={styles.pickerField}
                    >
                      <Text
                        style={
                          formClientName
                            ? styles.pickerText
                            : styles.pickerPlaceholder
                        }
                      >
                        {formClientName || 'Select client...'}
                      </Text>
                      <Ionicons
                        name={showClientPicker ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={Colors.textMuted}
                      />
                    </Pressable>

                    {showClientPicker && (
                      <View style={styles.pickerDropdown}>
                        <TextInput
                          style={styles.pickerSearch}
                          placeholder="Search clients..."
                          placeholderTextColor={Colors.textMuted}
                          value={clientSearch}
                          onChangeText={setClientSearch}
                          autoCorrect={false}
                          autoCapitalize="none"
                        />
                        {filteredClients.length === 0 ? (
                          <Text style={styles.pickerEmpty}>
                            No clients yet -- add a client first
                          </Text>
                        ) : (
                          <FlatList
                            data={filteredClients}
                            keyExtractor={(c) => c.id}
                            style={{ maxHeight: 200 }}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item: c }) => (
                              <Pressable
                                onPress={() => {
                                  setFormClientId(c.id);
                                  setFormClientName(c.name);
                                  setShowClientPicker(false);
                                  setClientSearch('');
                                }}
                                style={({ pressed }) => [
                                  styles.pickerItem,
                                  pressed && styles.pickerItemPressed,
                                ]}
                              >
                                <Text style={styles.pickerItemText}>
                                  {c.name}
                                </Text>
                              </Pressable>
                            )}
                          />
                        )}
                      </View>
                    )}
                  </View>

                  {/* Job Title */}
                  <FormField
                    label="Job Title *"
                    placeholder="e.g. Mow lawn, Walk dogs"
                    value={formTitle}
                    onChangeText={setFormTitle}
                    autoCapitalize="sentences"
                  />

                  {/* Date */}
                  <FormField
                    label="Date *"
                    placeholder="MM/DD/YYYY"
                    value={formDate}
                    onChangeText={setFormDate}
                    keyboardType="numbers-and-punctuation"
                  />

                  {/* Time */}
                  <FormField
                    label="Time"
                    placeholder="e.g. 2:00 PM"
                    value={formTime}
                    onChangeText={setFormTime}
                  />

                  {/* Duration selector */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Duration</Text>
                    <View style={styles.pillRow}>
                      {DURATION_OPTIONS.map((opt) => {
                        const isActive = formDuration === opt.value;
                        return (
                          <Pressable
                            key={opt.value}
                            onPress={() => setFormDuration(opt.value)}
                            style={[
                              styles.pill,
                              isActive ? styles.pillActive : styles.pillInactive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.pillText,
                                isActive
                                  ? styles.pillTextActive
                                  : styles.pillTextInactive,
                              ]}
                            >
                              {opt.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Price */}
                  <FormField
                    label="Price *"
                    placeholder="0.00"
                    value={formPrice}
                    onChangeText={setFormPrice}
                    keyboardType="decimal-pad"
                  />

                  {/* Address */}
                  <FormField
                    label="Address"
                    placeholder="Job location"
                    value={formAddress}
                    onChangeText={setFormAddress}
                  />

                  {/* Recurring toggle */}
                  <View style={styles.fieldContainer}>
                    <View style={styles.toggleRow}>
                      <Text style={styles.fieldLabel}>Recurring Job</Text>
                      <Pressable
                        onPress={() => setFormRecurring(!formRecurring)}
                        style={[
                          styles.toggle,
                          {
                            backgroundColor: formRecurring
                              ? Colors.primary
                              : Colors.bgInput,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.toggleCircle,
                            { left: formRecurring ? 24 : 2 },
                          ]}
                        />
                      </Pressable>
                    </View>

                    {formRecurring && (
                      <View style={[styles.pillRow, { marginTop: Spacing.sm }]}>
                        {FREQUENCY_OPTIONS.map((opt) => {
                          const isActive =
                            formRecurringFrequency === opt.value;
                          return (
                            <Pressable
                              key={opt.value}
                              onPress={() =>
                                setFormRecurringFrequency(opt.value)
                              }
                              style={[
                                styles.pill,
                                isActive
                                  ? styles.pillActive
                                  : styles.pillInactive,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.pillText,
                                  isActive
                                    ? styles.pillTextActive
                                    : styles.pillTextInactive,
                                ]}
                              >
                                {opt.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                  </View>

                  {/* Notes */}
                  <FormField
                    label="Notes"
                    placeholder="Additional notes..."
                    value={formNotes}
                    onChangeText={setFormNotes}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              }
            />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
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

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  tab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabInactive: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  tabTextActive: {
    color: Colors.textInverse,
    fontWeight: FontWeight.bold,
  },
  tabTextInactive: {
    color: Colors.textSecondary,
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },

  // Card
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  cardPressed: {
    backgroundColor: Colors.bgCardHover,
    transform: [{ scale: 0.98 }],
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  priceText: {
    color: Colors.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.sm,
  },
  bottomRow: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 44,
  },
  completeText: {
    color: Colors.success,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
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
  modalSaveDisabled: {
    color: Colors.textMuted,
  },

  // Form
  formContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
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

  // Client picker
  pickerField: {
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
  pickerText: {
    color: Colors.text,
    fontSize: FontSize.md,
  },
  pickerPlaceholder: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
  },
  pickerDropdown: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xs,
    overflow: 'hidden',
  },
  pickerSearch: {
    backgroundColor: Colors.bgInput,
    color: Colors.text,
    fontSize: FontSize.sm,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerEmpty: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    padding: Spacing.md,
    textAlign: 'center',
  },
  pickerItem: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    minHeight: 44,
    justifyContent: 'center',
  },
  pickerItemPressed: {
    backgroundColor: Colors.bgCardHover,
  },
  pickerItemText: {
    color: Colors.text,
    fontSize: FontSize.md,
  },

  // Duration / Frequency pills
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.primaryBg,
  },
  pillInactive: {
    borderColor: Colors.border,
    borderWidth: 1,
    backgroundColor: Colors.bgCard,
  },
  pillText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  pillTextActive: {
    color: Colors.primary,
  },
  pillTextInactive: {
    color: Colors.textSecondary,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
  },
  toggleCircle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.text,
    top: 2,
  },
});
