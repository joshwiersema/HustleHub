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
import { Client } from '../../src/types';
import { useClientsStore } from '../../src/store/clientsStore';
import { useGameStore } from '../../src/store/gameStore';
import { EmptyState, ScreenHeader } from '../../src/components';

// ---------------------------------------------------------------------------
// ClientCard — memoized for FlatList performance
// ---------------------------------------------------------------------------

interface ClientCardProps {
  client: Client;
  isExpanded: boolean;
  onPress: (id: string) => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

const ClientCard = React.memo(function ClientCard({
  client,
  isExpanded,
  onPress,
  onEdit,
  onDelete,
}: ClientCardProps) {
  const initial = client.name.length > 0 ? client.name[0].toUpperCase() : '?';

  return (
    <Pressable
      onPress={() => onPress(client.id)}
      style={({ pressed }) => [
        styles.card,
        pressed && !isExpanded && styles.cardPressed,
        isExpanded && styles.cardExpanded,
      ]}
    >
      {/* Collapsed row — always visible */}
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {client.name}
          </Text>
          {client.phone ? (
            <Text style={styles.cardPhone} numberOfLines={1}>
              {client.phone}
            </Text>
          ) : null}
          {client.address ? (
            <Text style={styles.cardAddress} numberOfLines={1}>
              {client.address}
            </Text>
          ) : null}
        </View>

        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.textMuted}
        />
      </View>

      {/* Expanded details */}
      {isExpanded && (
        <View style={styles.expandedSection}>
          <DetailRow icon="call-outline" value={client.phone} fallback="No phone" />
          <DetailRow icon="mail-outline" value={client.email} fallback="No email" />
          <DetailRow icon="location-outline" value={client.address} fallback="No address" />
          <DetailRow icon="document-text-outline" value={client.notes} fallback="No notes" />

          <View style={styles.actionRow}>
            <Pressable
              onPress={() => onEdit(client)}
              style={styles.actionButton}
            >
              <Ionicons name="create-outline" size={20} color={Colors.info} />
              <Text style={[styles.actionText, { color: Colors.info }]}>
                Edit
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onDelete(client.id)}
              style={styles.actionButton}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
              <Text style={[styles.actionText, { color: Colors.error }]}>
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </Pressable>
  );
});

// ---------------------------------------------------------------------------
// DetailRow helper
// ---------------------------------------------------------------------------

function DetailRow({
  icon,
  value,
  fallback,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  fallback: string;
}) {
  const hasValue = value && value.trim().length > 0;
  return (
    <View style={styles.detailRow}>
      <Ionicons
        name={icon}
        size={18}
        color={hasValue ? Colors.textSecondary : Colors.textMuted}
      />
      <Text
        style={[
          styles.detailText,
          !hasValue && { color: Colors.textMuted },
        ]}
      >
        {hasValue ? value : fallback}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// ItemSeparator
// ---------------------------------------------------------------------------

function ItemSeparator() {
  return <View style={{ height: Spacing.sm }} />;
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function ClientsScreen() {
  // Store hooks
  const clients = useClientsStore((s) => s.clients);
  const addClient = useClientsStore((s) => s.addClient);
  const updateClient = useClientsStore((s) => s.updateClient);
  const deleteClient = useClientsStore((s) => s.deleteClient);

  // Local state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Form fields
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Search filtering
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q),
    );
  }, [clients, searchQuery]);

  // Populate form when editing
  useEffect(() => {
    if (modalVisible && editingClient) {
      setFormName(editingClient.name);
      setFormPhone(editingClient.phone);
      setFormEmail(editingClient.email);
      setFormAddress(editingClient.address);
      setFormNotes(editingClient.notes);
    } else if (modalVisible && !editingClient) {
      setFormName('');
      setFormPhone('');
      setFormEmail('');
      setFormAddress('');
      setFormNotes('');
    }
  }, [modalVisible, editingClient]);

  // Handlers ----------------------------------------------------------------

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleOpenAdd = useCallback(() => {
    setEditingClient(undefined);
    setModalVisible(true);
  }, []);

  const handleOpenEdit = useCallback((client: Client) => {
    setEditingClient(client);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      const client = clients.find((c) => c.id === id);
      const name = client ? client.name : 'this client';
      Alert.alert(
        'Delete Client',
        `Are you sure you want to delete "${name}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteClient(id);
              setExpandedId(null);
            },
          },
        ],
      );
    },
    [clients, deleteClient],
  );

  const handleSave = useCallback(() => {
    if (!formName.trim()) {
      Alert.alert('Missing Info', 'Please enter a client name.');
      return;
    }

    const trimmed = {
      name: formName.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim(),
      address: formAddress.trim(),
      notes: formNotes.trim(),
    };

    if (editingClient) {
      updateClient(editingClient.id, trimmed);
    } else {
      const isFirstClient = clients.length === 0;
      const newClient: Client = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        ...trimmed,
        createdAt: new Date().toISOString(),
      };
      addClient(newClient);

      if (isFirstClient) {
        useGameStore.getState().addXP(15);
      }
    }

    setModalVisible(false);
  }, [
    formName,
    formPhone,
    formEmail,
    formAddress,
    formNotes,
    editingClient,
    clients.length,
    addClient,
    updateClient,
  ]);

  const handleCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  // Render helpers -----------------------------------------------------------

  const renderItem = useCallback(
    ({ item }: { item: Client }) => (
      <ClientCard
        client={item}
        isExpanded={expandedId === item.id}
        onPress={handleToggleExpand}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />
    ),
    [expandedId, handleToggleExpand, handleOpenEdit, handleDelete],
  );

  const keyExtractor = useCallback((item: Client) => item.id, []);

  const listEmpty = useCallback(
    () => (
      <EmptyState
        icon="people-outline"
        title="No clients yet"
        subtitle="Add your first client to get started"
        actionLabel="Add Client"
        onAction={handleOpenAdd}
      />
    ),
    [handleOpenAdd],
  );

  // -------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Clients"
        subtitle={`${clients.length} total`}
      />

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color={Colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search clients..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      {/* Client list */}
      <FlatList
        data={filteredClients}
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
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
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
                {editingClient ? 'Edit Client' : 'Add Client'}
              </Text>

              <Pressable
                onPress={handleSave}
                disabled={!formName.trim()}
                style={styles.modalHeaderBtn}
              >
                <Text
                  style={[
                    styles.modalSaveText,
                    !formName.trim() && styles.modalSaveDisabled,
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
                  <FormField
                    label="Name *"
                    placeholder="Client name"
                    value={formName}
                    onChangeText={setFormName}
                    autoCapitalize="words"
                  />
                  <FormField
                    label="Phone"
                    placeholder="Phone number"
                    value={formPhone}
                    onChangeText={setFormPhone}
                    keyboardType="phone-pad"
                  />
                  <FormField
                    label="Email"
                    placeholder="Email address"
                    value={formEmail}
                    onChangeText={setFormEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <FormField
                    label="Address"
                    placeholder="Street address"
                    value={formAddress}
                    onChangeText={setFormAddress}
                  />
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
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
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
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.md,
    height: 44,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.md,
    height: 44,
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
  cardExpanded: {
    borderColor: Colors.primaryBorder,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: Colors.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  cardInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardName: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  cardPhone: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  cardAddress: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },

  // Expanded
  expandedSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  detailText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginLeft: Spacing.md,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
    gap: Spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  actionText: {
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
});
