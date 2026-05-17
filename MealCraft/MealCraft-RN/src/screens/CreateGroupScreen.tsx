import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFetch } from '../api';
import { useAuth } from '../contexts/AuthContext';

type GroupType = 'private' | 'public';

type NominatimResult = { display_name: string; lat: string; lon: string };

const DEADLINE_OPTIONS = [
  { label: '10 phút nữa', minutes: 10 },
  { label: '15 phút nữa', minutes: 15 },
  { label: '20 phút nữa', minutes: 20 },
  { label: '30 phút nữa', minutes: 30 },
  { label: '45 phút nữa', minutes: 45 },
  { label: '1 tiếng nữa', minutes: 60 },
  { label: '2 tiếng nữa', minutes: 120 },
];

const PICKUP_PRESETS = [
  'Lễ tân tầng trệt',
  'Grab Collection Point cổng chính',
  'Pantry văn phòng',
  'Bưu phòng tầng 2',
  'Sảnh thang máy',
  'Cổng sau toà nhà',
];

function useNominatim() {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback((text: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text + ' Ho Chi Minh City')}&format=json&limit=5&countrycodes=vn`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'vi' } });
        const json = await res.json();
        setSuggestions(json);
      } catch { setSuggestions([]); }
    }, 500);
  }, []);

  const clear = useCallback(() => setSuggestions([]), []);

  return { suggestions, fetchSuggestions, clear };
}

export function CreateGroupScreen() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();

  // Basic info
  const [name, setName] = useState('');
  const [type, setType] = useState<GroupType>('private');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  // Delivery address
  const [address, setAddress] = useState('');
  const [addressLat, setAddressLat] = useState<number | null>(null);
  const [addressLon, setAddressLon] = useState<number | null>(null);
  const addrNominatim = useNominatim();

  // Pickup point
  const [pickupPoint, setPickupPoint] = useState('');
  const pickupNominatim = useNominatim();

  // Deadline
  const [deadlineOption, setDeadlineOption] = useState<typeof DEADLINE_OPTIONS[0] | null>(null);
  const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);

  const addMember = () => {
    const v = memberInput.trim();
    if (!v || members.includes(v)) return;
    setMembers(prev => [...prev, v]);
    setMemberInput('');
  };

  const removeMember = (m: string) => setMembers(prev => prev.filter(x => x !== m));

  const createGroup = async () => {
    if (!name.trim()) { Alert.alert('Thiếu tên nhóm', 'Vui lòng nhập tên nhóm'); return; }
    if (!token) return;
    setCreating(true);
    try {
      const orderDeadline = deadlineOption
        ? new Date(Date.now() + deadlineOption.minutes * 60 * 1000).toISOString()
        : undefined;

      const data = await apiFetch<{ group_id: string }>('/api/group/create', token, {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description: type === 'private' ? 'Nhóm riêng' : 'Nhóm công khai',
          address: address.trim(),
          pickup_point: pickupPoint.trim(),
          latitude: addressLat ?? 10.7769,
          longitude: addressLon ?? 106.7009,
          order_deadline: orderDeadline,
        }),
      });
      navigation.replace('GroupChat', { groupId: data.group_id, groupName: name.trim() });
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không tạo được nhóm');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Tạo nhóm mới</Text>
          <Text style={s.headerSub}>Tạo group chat để cùng nấu ăn hoặc đặt món</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.iconWrap}>
          <View style={s.iconCircle}><Text style={s.iconEmoji}>👥</Text></View>
        </View>

        {/* ── Tên nhóm ── */}
        <Text style={s.label}>Tên nhóm</Text>
        <TextInput
          style={s.input}
          placeholder="Ví dụ: Team ăn trưa, Hội mê đồ Việt..."
          value={name}
          onChangeText={setName}
          placeholderTextColor="#9ca3af"
        />

        {/* ── Loại nhóm ── */}
        <Text style={s.label}>Loại nhóm</Text>
        <View style={s.typeRow}>
          {(['private', 'public'] as GroupType[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[s.typeCard, type === t && s.typeCardActive]}
              onPress={() => setType(t)}
            >
              <Text style={[s.typeName, type === t && s.typeNameActive]}>
                {t === 'private' ? 'Nhóm riêng' : 'Nhóm công khai'}
              </Text>
              <Text style={s.typeDesc}>
                {t === 'private' ? 'Chỉ thành viên được mời mới tham gia' : 'Người dùng khác có thể tìm và tham gia'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Địa chỉ đặt món ── */}
        <Text style={s.label}>📍 Địa chỉ đặt món</Text>
        <View style={s.autocompleteWrap}>
          <TextInput
            style={s.input}
            placeholder="Ví dụ: 105 Tôn Dật Tiên, Tân Phú, Quận 7"
            value={address}
            onChangeText={t => {
              setAddress(t);
              setAddressLat(null);
              setAddressLon(null);
              addrNominatim.fetchSuggestions(t);
            }}
            placeholderTextColor="#9ca3af"
          />
          {addrNominatim.suggestions.length > 0 && (
            <View style={s.suggestionBox}>
              {addrNominatim.suggestions.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={s2.suggestionItem}
                  onPress={() => {
                    setAddress(s.display_name);
                    setAddressLat(parseFloat(s.lat));
                    setAddressLon(parseFloat(s.lon));
                    addrNominatim.clear();
                  }}
                >
                  <Text style={s2.suggestionText} numberOfLines={2}>{s.display_name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── Địa điểm nhận hàng ── */}
        <Text style={s.label}>🏢 Địa điểm nhận hàng</Text>
        <View style={s.autocompleteWrap}>
          <TextInput
            style={s.input}
            placeholder="Ví dụ: Grab Collection Point cổng chính..."
            value={pickupPoint}
            onChangeText={t => {
              setPickupPoint(t);
              pickupNominatim.fetchSuggestions(t);
            }}
            placeholderTextColor="#9ca3af"
          />
          {pickupNominatim.suggestions.length > 0 && (
            <View style={s.suggestionBox}>
              {pickupNominatim.suggestions.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={s2.suggestionItem}
                  onPress={() => {
                    setPickupPoint(s.display_name);
                    pickupNominatim.clear();
                  }}
                >
                  <Text style={s2.suggestionText} numberOfLines={2}>{s.display_name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Preset chips cho pickup point */}
        <View style={s.chipRow}>
          {PICKUP_PRESETS.map(preset => (
            <TouchableOpacity
              key={preset}
              style={[s.chip, pickupPoint === preset && s.chipActive]}
              onPress={() => { setPickupPoint(preset); pickupNominatim.clear(); }}
            >
              <Text style={[s.chipText, pickupPoint === preset && s.chipTextActive]}>{preset}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Giới hạn thời gian chốt đơn ── */}
        <Text style={s.label}>⏰ Giới hạn chốt đơn</Text>
        <TouchableOpacity style={s.deadlineBtn} onPress={() => setDeadlineModalOpen(true)}>
          <Text style={[s.deadlineBtnText, !deadlineOption && s.deadlinePlaceholder]}>
            {deadlineOption ? deadlineOption.label : 'Chọn thời gian chốt đơn...'}
          </Text>
          <Text style={s.deadlineArrow}>▾</Text>
        </TouchableOpacity>

        {/* ── Thêm thành viên ── */}
        <Text style={s.label}>Thêm thành viên</Text>
        <View style={s.memberInputRow}>
          <TextInput
            style={s.memberInput}
            placeholder="Nhập email hoặc username"
            value={memberInput}
            onChangeText={setMemberInput}
            onSubmitEditing={addMember}
            placeholderTextColor="#9ca3af"
            returnKeyType="done"
          />
          <TouchableOpacity style={s.addBtn} onPress={addMember}>
            <Text style={s.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        {members.length > 0 && (
          <View style={s.memberTags}>
            {members.map(m => (
              <View key={m} style={s.memberTag}>
                <Text style={s.memberTagText}>{m}</Text>
                <TouchableOpacity onPress={() => removeMember(m)}>
                  <Text style={s.memberTagX}> ✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ── Preview ── */}
        <View style={s.preview}>
          <Text style={s.previewLabel}>XEM TRƯỚC NHÓM</Text>
          <View style={s.previewCard}>
            <View style={s.previewIcon}><Text style={s.previewIconText}>👥</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.previewName} numberOfLines={1}>
                {name.trim() || 'Chưa đặt tên nhóm'}
              </Text>
              <View style={s.previewBadge}>
                <Text style={s.previewBadgeText}>
                  {type === 'private' ? 'Nhóm riêng' : 'Nhóm công khai'}
                </Text>
              </View>
            </View>
          </View>
          {(address || pickupPoint || deadlineOption) ? (
            <View style={s.previewDetails}>
              {address ? <Text style={s.previewDetailText}>📍 {address}</Text> : null}
              {pickupPoint ? <Text style={s.previewDetailText}>🏢 {pickupPoint}</Text> : null}
              {deadlineOption ? <Text style={s.previewDetailText}>⏰ Chốt: {deadlineOption.label}</Text> : null}
            </View>
          ) : null}
          <View style={s.previewStats}>
            <View style={s.previewStat}>
              <Text style={s.previewStatLabel}>Thành viên</Text>
              <Text style={s.previewStatValue}>{members.length}</Text>
            </View>
            <View style={s.previewStatDivider} />
            <View style={s.previewStat}>
              <Text style={s.previewStatLabel}>Trạng thái</Text>
              <Text style={[s.previewStatValue, { color: GREEN }]}>Sẵn sàng</Text>
            </View>
          </View>
        </View>

        {/* ── Create button ── */}
        <TouchableOpacity
          style={[s.createBtn, (!name.trim() || creating) && s.createBtnDisabled]}
          onPress={createGroup}
          disabled={!name.trim() || creating}
        >
          {creating
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.createBtnText}>Tạo nhóm</Text>
          }
        </TouchableOpacity>
      </ScrollView>

      {/* ── Deadline modal ── */}
      <Modal
        visible={deadlineModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDeadlineModalOpen(false)}
      >
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setDeadlineModalOpen(false)}>
          <View style={s.modalSheet}>
            <Text style={s.modalTitle}>Chọn thời gian chốt đơn</Text>
            {DEADLINE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.minutes}
                style={[s.modalOption, deadlineOption?.minutes === opt.minutes && s.modalOptionActive]}
                onPress={() => { setDeadlineOption(opt); setDeadlineModalOpen(false); }}
              >
                <Text style={[s.modalOptionText, deadlineOption?.minutes === opt.minutes && s.modalOptionTextActive]}>
                  {opt.label}
                </Text>
                {deadlineOption?.minutes === opt.minutes && <Text style={s.modalCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={s.modalCancel}
              onPress={() => { setDeadlineOption(null); setDeadlineModalOpen(false); }}
            >
              <Text style={s.modalCancelText}>Không giới hạn</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const GREEN = '#16a34a';

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 22, color: '#111', lineHeight: 28 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  headerSub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  scroll: { padding: 20, paddingBottom: 48 },

  iconWrap: { alignItems: 'center', marginBottom: 24 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 36 },

  label: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 4 },
  input: { backgroundColor: '#f3f4f6', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 14, color: '#111827', marginBottom: 0 },

  autocompleteWrap: { marginBottom: 12, zIndex: 10 },
  suggestionBox: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden', marginTop: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  chipActive: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeCard: { flex: 1, borderRadius: 14, borderWidth: 2, borderColor: '#e5e7eb', padding: 14, backgroundColor: '#fff' },
  typeCardActive: { borderColor: GREEN, backgroundColor: '#f0fdf4' },
  typeName: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 4 },
  typeNameActive: { color: GREEN },
  typeDesc: { fontSize: 11, color: '#9ca3af', lineHeight: 16 },

  deadlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f3f4f6', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, marginBottom: 20 },
  deadlineBtnText: { fontSize: 14, color: '#111827', fontWeight: '600' },
  deadlinePlaceholder: { color: '#9ca3af', fontWeight: '400' },
  deadlineArrow: { fontSize: 16, color: '#6b7280' },

  memberInputRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  memberInput: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#111827' },
  addBtn: { width: 46, height: 46, borderRadius: 14, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: '300', lineHeight: 28 },

  memberTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  memberTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  memberTagText: { fontSize: 13, color: GREEN, fontWeight: '600' },
  memberTagX: { fontSize: 12, color: '#ef4444' },

  preview: { backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, marginBottom: 24 },
  previewLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '700', letterSpacing: 0.5, marginBottom: 12 },
  previewCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  previewIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  previewIconText: { fontSize: 20 },
  previewName: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 6 },
  previewBadge: { alignSelf: 'flex-start', backgroundColor: '#dcfce7', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  previewBadgeText: { fontSize: 11, color: GREEN, fontWeight: '700' },
  previewDetails: { gap: 4, marginBottom: 12 },
  previewDetailText: { fontSize: 12, color: '#6b7280', lineHeight: 18 },
  previewStats: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  previewStat: { flex: 1, alignItems: 'center', padding: 12 },
  previewStatDivider: { width: 1, backgroundColor: '#f3f4f6' },
  previewStatLabel: { fontSize: 11, color: '#9ca3af', marginBottom: 4 },
  previewStatValue: { fontSize: 18, fontWeight: '800', color: '#111827' },

  createBtn: { backgroundColor: GREEN, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  createBtnDisabled: { opacity: 0.5 },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 16, textAlign: 'center' },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalOptionActive: { },
  modalOptionText: { fontSize: 15, color: '#374151' },
  modalOptionTextActive: { color: GREEN, fontWeight: '700' },
  modalCheck: { fontSize: 16, color: GREEN, fontWeight: '700' },
  modalCancel: { marginTop: 12, alignItems: 'center', paddingVertical: 12 },
  modalCancelText: { fontSize: 14, color: '#9ca3af' },
});

// Separate style for suggestion items to avoid circular reference
const s2 = StyleSheet.create({
  suggestionItem: { paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  suggestionText: { fontSize: 13, color: '#374151', lineHeight: 18 },
});
