import React, { useState, useCallback, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { SmoothPressable } from '@/components/SmoothPressable';
import { showToast } from '@/components/Toast';
import { confirmDelete } from '@/utils/confirm';
import {
  getAllInventory,
  createInventoryItem,
  updateInventoryItem,
  updateInventoryQuantity,
  deleteInventoryItem,
} from '@/db/inventory';
import type { InventoryCategory, InventoryItem } from '@/db/types';

const CATEGORIES: ('All' | InventoryCategory)[] = ['All', 'Food', 'Health', 'Care'];

const ICON_PRESETS: { id: string; emoji: string; label: string }[] = [
  { id: 'bone', emoji: '🦴', label: 'Bone' },
  { id: 'can', emoji: '🥫', label: 'Canned Food' },
  { id: 'pill', emoji: '💊', label: 'Medicine' },
  { id: 'bath', emoji: '🛁', label: 'Care / Bath' },
  { id: 'roll', emoji: '🧻', label: 'Waste Bags' },
  { id: 'bowl', emoji: '🥣', label: 'Kibble / Bowl' },
  { id: 'box', emoji: '📦', label: 'General Supply' },
];

export default function HomeInventoryScreen() {
  const theme = useTheme();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'All' | InventoryCategory>('All');
  const [refreshing, setRefreshing] = useState(false);

  // Modal State for Add / Edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<InventoryCategory>('Food');
  const [formQty, setFormQty] = useState('1');
  const [formUnit, setFormUnit] = useState('units');
  const [formMinStock, setFormMinStock] = useState('1');
  const [formIcon, setFormIcon] = useState('bone');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await getAllInventory();
      setItems(data);
    } catch (err) {
      console.warn('Failed to load inventory:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Status metrics
  const totalTracked = items.length;
  const needRestockingCount = useMemo(() => {
    return items.filter((it) => it.quantity <= it.min_stock).length;
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return items;
    return items.filter((it) => it.category === selectedCategory);
  }, [items, selectedCategory]);

  // Quantity Change Handlers
  const handleQuantityDelta = async (item: InventoryItem, delta: number) => {
    try {
      const updated = await updateInventoryQuantity(item.id, delta);
      setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
      if (updated.quantity <= updated.min_stock && item.quantity > item.min_stock) {
        showToast(`${updated.name} is now LOW in stock!`, 'warning', 'Low Stock Alert');
      }
    } catch {
      showToast('Failed to update quantity.', 'error', 'Error');
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormDesc('');
    setFormCategory('Food');
    setFormQty('1');
    setFormUnit('bags');
    setFormMinStock('1');
    setFormIcon('bone');
    setModalVisible(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDesc(item.description);
    setFormCategory(item.category);
    setFormQty(String(item.quantity));
    setFormUnit(item.unit);
    setFormMinStock(String(item.min_stock));
    setFormIcon(item.icon || 'box');
    setModalVisible(true);
  };

  // Save Add/Edit
  const handleSaveForm = async () => {
    if (!formName.trim()) {
      showToast('Please enter an item name.', 'warning', 'Name Required');
      return;
    }
    const qty = parseInt(formQty.trim(), 10);
    const minStock = parseInt(formMinStock.trim(), 10);
    if (isNaN(qty) || qty < 0) {
      showToast('Please enter a valid quantity (0 or greater).', 'warning', 'Invalid Quantity');
      return;
    }
    if (isNaN(minStock) || minStock < 0) {
      showToast('Please enter a valid minimum stock level.', 'warning', 'Invalid Min Stock');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id, {
          name: formName.trim(),
          description: formDesc.trim(),
          category: formCategory,
          quantity: qty,
          unit: formUnit.trim() || 'units',
          min_stock: minStock,
          icon: formIcon,
        });
        showToast(`${formName.trim()} updated successfully!`, 'success', 'Inventory Updated');
      } else {
        await createInventoryItem({
          name: formName.trim(),
          description: formDesc.trim(),
          category: formCategory,
          quantity: qty,
          unit: formUnit.trim() || 'units',
          min_stock: minStock,
          icon: formIcon,
        });
        showToast(`${formName.trim()} added to Home Inventory!`, 'success', 'Item Added');
      }
      await loadData();
      setModalVisible(false);
    } catch {
      showToast('Failed to save item. Please try again.', 'error', 'Error');
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = (item: InventoryItem) => {
    confirmDelete(
      'Delete Inventory Item',
      `Are you sure you want to remove "${item.name}" from your home inventory?`,
      async () => {
        try {
          await deleteInventoryItem(item.id);
          await loadData();
          setModalVisible(false);
          showToast(`${item.name} removed from inventory.`, 'info', 'Item Deleted');
        } catch {
          showToast('Failed to delete item.', 'error', 'Delete Failed');
        }
      }
    );
  };

  const getEmojiIcon = (icon?: string): string => {
    const found = ICON_PRESETS.find((p) => p.id === icon);
    return found ? found.emoji : '📦';
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.buttonPrimary}
        />
      }
    >
      {/* 1. Header (Home Inventory & Add Button) */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitles}>
          <Text style={[styles.mainTitle, { color: theme.text }]}>Home Inventory</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Pet supplies available at home
          </Text>
        </View>

        <SmoothPressable
          onPress={handleOpenAdd}
          style={[styles.addBtn, { backgroundColor: theme.buttonPrimary }]}
          accessibilityLabel="Add Inventory Item"
        >
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </SmoothPressable>
      </View>

      {/* 2. Household Supply Status Card */}
      <View style={styles.statusCard}>
        {/* Background box outline decoration */}
        <View style={styles.statusWatermark}>
          <Ionicons name="cube-outline" size={80} color="rgba(255,255,255,0.08)" />
        </View>

        <Text style={styles.statusCardLabel}>HOUSEHOLD SUPPLY STATUS</Text>

        <View style={styles.statusStatsRow}>
          {/* Total Items Tracked */}
          <View style={styles.statusStatCol}>
            <Text style={styles.statusBigNumberWhite}>{totalTracked}</Text>
            <Text style={styles.statusSubtext}>items tracked</Text>
          </View>

          {/* Need Restocking */}
          <View style={styles.statusStatCol}>
            <Text style={styles.statusBigNumberYellow}>{needRestockingCount}</Text>
            <Text style={styles.statusSubtext}>need restocking</Text>
          </View>
        </View>
      </View>

      {/* 3. Category Filter Pills */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <SmoothPressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? theme.buttonPrimary : theme.card,
                    borderColor: isSelected ? theme.buttonPrimary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.textSecondary,
                      fontWeight: isSelected ? '700' : '600',
                    },
                  ]}
                >
                  {cat}
                </Text>
              </SmoothPressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. Section Header: INVENTORY AT HOME */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>INVENTORY AT HOME</Text>
        <Text style={styles.itemCountText}>
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {/* 5. Inventory Items List */}
      <View style={styles.itemsList}>
        {filteredItems.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="cube-outline" size={38} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Supplies Found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {selectedCategory === 'All'
                ? 'Your home supply list is currently empty. Tap the "+" button above to add food, medicine, and care supplies.'
                : `No items found under "${selectedCategory}". Tap "+" to add a new supply.`}
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => {
            const isLow = item.quantity <= item.min_stock;
            return (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}
              >
                {/* Tappable Item Info to Open Edit */}
                <SmoothPressable
                  onPress={() => handleOpenEdit(item)}
                  style={styles.itemMainTouchable}
                  accessibilityLabel={`Edit ${item.name}`}
                >
                  {/* Left Emoji Icon Box */}
                  <View style={styles.itemIconBox}>
                    <Text style={{ fontSize: 24 }}>{getEmojiIcon(item.icon)}</Text>
                  </View>

                  {/* Middle Info */}
                  <View style={styles.itemDetails}>
                    <View style={styles.itemNameRow}>
                      <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      {isLow && (
                        <View style={styles.lowBadge}>
                          <Text style={styles.lowBadgeText}>LOW</Text>
                        </View>
                      )}
                    </View>

                    <Text style={[styles.itemSub, { color: theme.textSecondary }]} numberOfLines={1}>
                      {item.description ? `${item.description} · ` : ''}Min {item.min_stock}
                    </Text>
                  </View>
                </SmoothPressable>

                {/* Right Increment / Decrement Controls (Not nested in a button) */}
                <View style={styles.itemActionsRow}>
                  {/* Decrease Button */}
                  <SmoothPressable
                    onPress={() => handleQuantityDelta(item, -1)}
                    style={[styles.stepperBtnMinus, { backgroundColor: '#F1F5F9' }]}
                    accessibilityLabel={`Decrease ${item.name}`}
                  >
                    <Ionicons name="remove" size={16} color="#64748B" />
                  </SmoothPressable>

                  {/* Quantity & Unit */}
                  <View style={styles.qtyDisplayCol}>
                    <Text style={[styles.qtyNumber, { color: theme.text }]}>{item.quantity}</Text>
                    <Text style={[styles.qtyUnit, { color: theme.textSecondary }]} numberOfLines={1}>
                      {item.unit || 'units'}
                    </Text>
                  </View>

                  {/* Increase Button */}
                  <SmoothPressable
                    onPress={() => handleQuantityDelta(item, 1)}
                    style={[styles.stepperBtnPlus, { backgroundColor: '#0D766E' }]}
                    accessibilityLabel={`Increase ${item.name}`}
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                  </SmoothPressable>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Add / Edit Inventory Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingItem ? 'Edit Supply Item' : 'Add Supply Item'}
              </Text>
              <SmoothPressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </SmoothPressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollForm}>
              {/* Item Name */}
              <View style={styles.modalField}>
                <Text style={[styles.modalLabel, { color: theme.text }]}>Item Name *</Text>
                <TextInput
                  placeholder="e.g. Dry Kibble, Flea Medicine, Shampoo"
                  placeholderTextColor={theme.textSecondary}
                  value={formName}
                  onChangeText={setFormName}
                  style={[styles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                />
              </View>

              {/* Description / Brand */}
              <View style={styles.modalField}>
                <Text style={[styles.modalLabel, { color: theme.text }]}>Brand / Description</Text>
                <TextInput
                  placeholder="e.g. Royal Canin Adult, NexGard Spectra, Oatmeal formula"
                  placeholderTextColor={theme.textSecondary}
                  value={formDesc}
                  onChangeText={setFormDesc}
                  style={[styles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                />
              </View>

              {/* Category Selector */}
              <View style={styles.modalField}>
                <Text style={[styles.modalLabel, { color: theme.text }]}>Category</Text>
                <View style={styles.modalCategoryRow}>
                  {(['Food', 'Health', 'Care'] as InventoryCategory[]).map((c) => {
                    const isSel = formCategory === c;
                    return (
                      <SmoothPressable
                        key={c}
                        onPress={() => setFormCategory(c)}
                        style={[
                          styles.modalCatChip,
                          {
                            backgroundColor: isSel ? theme.buttonPrimary : theme.inputBackground,
                            borderColor: isSel ? theme.buttonPrimary : theme.border,
                          },
                        ]}
                      >
                        <Text style={[styles.modalCatText, { color: isSel ? '#FFFFFF' : theme.text }]}>
                          {c}
                        </Text>
                      </SmoothPressable>
                    );
                  })}
                </View>
              </View>

              {/* Quantity, Unit & Min Stock */}
              <View style={styles.modalNumbersRow}>
                {/* Current Quantity */}
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={[styles.modalLabel, { color: theme.text }]}>Quantity *</Text>
                  <TextInput
                    placeholder="e.g. 2"
                    placeholderTextColor={theme.textSecondary}
                    value={formQty}
                    onChangeText={setFormQty}
                    keyboardType="number-pad"
                    style={[styles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                  />
                </View>

                {/* Unit */}
                <View style={{ flex: 1.2, gap: 6 }}>
                  <Text style={[styles.modalLabel, { color: theme.text }]}>Unit (e.g. bags)</Text>
                  <TextInput
                    placeholder="bags, cans, doses"
                    placeholderTextColor={theme.textSecondary}
                    value={formUnit}
                    onChangeText={setFormUnit}
                    style={[styles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                  />
                </View>

                {/* Minimum Stock Level */}
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={[styles.modalLabel, { color: theme.text }]}>Min Stock *</Text>
                  <TextInput
                    placeholder="e.g. 1"
                    placeholderTextColor={theme.textSecondary}
                    value={formMinStock}
                    onChangeText={setFormMinStock}
                    keyboardType="number-pad"
                    style={[styles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                  />
                </View>
              </View>

              {/* Icon Preset Selector */}
              <View style={styles.modalField}>
                <Text style={[styles.modalLabel, { color: theme.text }]}>Supply Icon</Text>
                <View style={styles.iconPresetsRow}>
                  {ICON_PRESETS.map((ic) => {
                    const isSel = formIcon === ic.id;
                    return (
                      <SmoothPressable
                        key={ic.id}
                        onPress={() => setFormIcon(ic.id)}
                        style={[
                          styles.iconPresetBtn,
                          {
                            backgroundColor: isSel ? theme.primaryLight : theme.inputBackground,
                            borderColor: isSel ? theme.buttonPrimary : theme.border,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 22 }}>{ic.emoji}</Text>
                      </SmoothPressable>
                    );
                  })}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalSubmitRow}>
                <SmoothPressable
                  onPress={handleSaveForm}
                  disabled={saving}
                  style={[styles.modalSaveBtn, { backgroundColor: theme.buttonPrimary }]}
                >
                  <Text style={styles.modalSaveBtnText}>
                    {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Item'}
                  </Text>
                </SmoothPressable>

                {editingItem && (
                  <SmoothPressable
                    onPress={() => handleDelete(editingItem)}
                    style={[styles.modalDeleteBtn, { backgroundColor: `${theme.danger}15` }]}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.danger} />
                    <Text style={{ color: theme.danger, fontWeight: '700', fontSize: 14 }}>
                      Delete Item
                    </Text>
                  </SmoothPressable>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 16,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  headerTitles: {
    gap: 2,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#FF6B4A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  statusCard: {
    backgroundColor: '#0D766E',
    borderRadius: 22,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0D766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  statusWatermark: {
    position: 'absolute',
    right: -10,
    top: -10,
  },
  statusCardLabel: {
    color: '#CCFBF1',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  statusStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 48,
  },
  statusStatCol: {
    gap: 2,
  },
  statusBigNumberWhite: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 40,
  },
  statusBigNumberYellow: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FACC15',
    lineHeight: 40,
  },
  statusSubtext: {
    color: '#CCFBF1',
    fontSize: 13,
    fontWeight: '500',
  },
  filterRow: {
    marginVertical: 2,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  filterPillText: {
    fontSize: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B4A',
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  itemMainTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 14,
    gap: 2,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
  },
  lowBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  lowBadgeText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  itemSub: {
    fontSize: 13,
  },
  itemActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 8,
  },
  stepperBtnMinus: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyDisplayCol: {
    width: 40,
    alignItems: 'center',
  },
  qtyNumber: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 20,
  },
  qtyUnit: {
    fontSize: 10,
    fontWeight: '500',
  },
  stepperBtnPlus: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
  },
  modalScrollForm: {
    gap: 14,
  },
  modalField: {
    gap: 6,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  modalCategoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalCatChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCatText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalNumbersRow: {
    flexDirection: 'row',
    gap: 10,
  },
  iconPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconPresetBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitRow: {
    gap: 10,
    marginTop: 10,
    marginBottom: 4,
  },
  modalSaveBtn: {
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  modalDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    paddingVertical: 12,
  },
});

