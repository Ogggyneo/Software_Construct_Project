import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, SafeAreaView, TextInput, ScrollView, Modal,
} from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { apiFetch } from '../api';
import { useAuth } from '../contexts/AuthContext';

interface Group {
  _id: string; name: string; description: string; address: string;
  members: { user_id: string; name: string; is_ready: boolean }[];
  status: string; createdAt?: string;
}

interface PlaceSuggestion { display_name: string; lat: string; lon: string }

const HCMC = { latitude: 10.7769, longitude: 106.7009 };

const FOOD_PREFS = [
  'Món Việt', 'Món Hàn', 'Món Nhật', 'Món Ý', 'Món Trung',
  'Đồ ăn nhanh', 'Healthy', 'Ăn chay', 'Hải sản', 'Đồ ngọt',
];

const TIME_SLOTS: string[] = [];
for (let h = 6; h <= 23; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 23) TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

function formatGroupTime(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function OrderFoodScreen() {
  const navigation = useNavigation<any>();
  const { token, userId } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [coords, setCoords] = useState({ lat: HCMC.latitude, lon: HCMC.longitude });
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [time, setTime] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [preferences, setPreferences] = useState<string[]>([]);

  const fetchGroups = useCallback(async (lat = HCMC.latitude, lng = HCMC.longitude) => {
    if (!token) return;
    try {
      const data = await apiFetch<{ groups: Group[] }>(
        `/api/group/nearby?latitude=${lat}&longitude=${lng}&maxDistance=50000`, token,
      );
      setGroups(data.groups ?? []);
    } catch {} finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    fetchGroups();
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status === Location.PermissionStatus.GRANTED) {
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          .then(pos => {
            setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            fetchGroups(pos.coords.latitude, pos.coords.longitude);
          }).catch(() => {});
      }
    });
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=vn&format=json&limit=5&addressdetails=0`,
        { headers: { 'User-Agent': 'MealCraft/1.0' } },
      );
      const data: PlaceSuggestion[] = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch {}
  };

  const handleLocationChange = (text: string) => {
    setLocation(text);
    setCoords({ lat: HCMC.latitude, lon: HCMC.longitude });
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchSuggestions(text), 500);
  };

  const selectSuggestion = (s: PlaceSuggestion) => {
    setLocation(s.display_name);
    setCoords({ lat: parseFloat(s.lat), lon: parseFloat(s.lon) });
    setSuggestions([]); setShowSuggestions(false);
  };

  const togglePref = (p: string) =>
    setPreferences(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const joinGroup = async (group: Group) => {
    if (!token) return;
    setJoining(group._id);
    try {
      await apiFetch(`/api/group/${group._id}/join`, token, { method: 'POST' });
      await fetchGroups(coords.lat, coords.lon);
      navigation.navigate('GroupChat', { groupId: group._id, groupName: group.name });
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không tham gia được nhóm');
    } finally { setJoining(null); }
  };

  const openGroup = (group: Group) =>
    navigation.navigate('GroupChat', { groupId: group._id, groupName: group.name });

  const isAlreadyMember = (group: Group) =>
    group.members.some(m => String(m.user_id) === String(userId));

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerIcon}><Text style={{ fontSize: 16, color: '#fff' }}>⚡</Text></View>
          <Text style={s.headerTitle}>Đặt món nhóm</Text>
        </View>
        <TouchableOpacity
          style={s.createBtn}
          onPress={() => navigation.navigate('CreateGroup')}
        >
          <Text style={s.createBtnText}>+ Tạo nhóm mới</Text>
        </TouchableOpacity>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        {/* Search form */}
        <View style={s.formBox}>
          <Text style={s.formTitle}>Tìm nhóm quanh bạn</Text>
          <Text style={s.formSub}>Nhập thông tin để tìm những người đang cùng đặt món tại khu vực của bạn.</Text>

          <Text style={s.fieldLabel}>📍 Vị trí của bạn</Text>
          <View style={s.fieldRow}>
            <TextInput
              style={s.fieldInput}
              placeholder="Nhập địa chỉ..."
              value={location}
              onChangeText={handleLocationChange}
              placeholderTextColor="#9ca3af"
            />
            {location.length > 0 && (
              <TouchableOpacity onPress={() => { setLocation(''); setSuggestions([]); setShowSuggestions(false); setCoords({ lat: HCMC.latitude, lon: HCMC.longitude }); }}>
                <Text style={s.clearX}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          {showSuggestions && (
            <View style={s.suggestionBox}>
              {suggestions.map((s2, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.suggestionItem, i < suggestions.length - 1 && s.suggestionBorder]}
                  onPress={() => selectSuggestion(s2)}
                >
                  <Text style={s.suggestionPin}>📍</Text>
                  <Text style={s.suggestionText} numberOfLines={2}>{s2.display_name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={s.fieldLabel}>🕐 Thời gian</Text>
          <TouchableOpacity style={s.timeBtn} onPress={() => setShowTimePicker(true)}>
            <Text style={[s.timeBtnText, !time && s.timePlaceholder]}>{time || 'Chọn giờ...'}</Text>
            <Text style={s.timeChevron}>▾</Text>
          </TouchableOpacity>

          <Text style={s.fieldLabel}>🍜 Sở thích món ăn</Text>
          <View style={s.prefRow}>
            {FOOD_PREFS.map(p => (
              <TouchableOpacity
                key={p}
                style={[s.prefChip, preferences.includes(p) && s.prefChipActive]}
                onPress={() => togglePref(p)}
              >
                <Text style={[s.prefChipText, preferences.includes(p) && s.prefChipTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={s.searchBtn} onPress={() => fetchGroups(coords.lat, coords.lon)}>
            <Text style={s.searchBtnText}>Tìm nhóm ngay</Text>
          </TouchableOpacity>
        </View>

        {/* Groups list */}
        <View style={s.listSection}>
          <View style={s.listHeader}>
            <Text style={s.listTitle}>Các nhóm đang chờ</Text>
            <Text style={s.listCount}>{groups.length} nhóm khả dụng</Text>
          </View>

          {loading ? (
            <View style={s.center}><ActivityIndicator size="large" color={GREEN} /></View>
          ) : groups.length === 0 ? (
            <View style={s.center}>
              <Text style={s.emptyEmoji}>🍽️</Text>
              <Text style={s.emptyText}>Chưa có nhóm nào gần đây</Text>
            </View>
          ) : (
            groups.map(item => {
              const isMember = isAlreadyMember(item);
              const isJoining = joining === item._id;
              const displayTime = formatGroupTime(item.createdAt);

              return (
                <View key={item._id} style={s.card}>
                  {/* Tag + time row */}
                  <View style={s.cardTopRow}>
                    {!!item.description && (
                      <View style={s.categoryTag}>
                        <Text style={s.categoryTagText}>{item.description}</Text>
                      </View>
                    )}
                    {!!displayTime && (
                      <Text style={s.timeTag}>🔔 {displayTime}</Text>
                    )}
                  </View>

                  {/* Name + address */}
                  <Text style={s.groupName}>{item.name}</Text>
                  {!!item.address && (
                    <View style={s.addrRow}>
                      <Text style={s.addrPin}>📍</Text>
                      <Text style={s.addrText} numberOfLines={1}>{item.address}</Text>
                    </View>
                  )}

                  {/* Avatars + join button */}
                  <View style={s.cardBottomRow}>
                    <View style={s.avatarGroup}>
                      {item.members.slice(0, 3).map((m, i) => (
                        <View key={i} style={[s.avatar, { marginLeft: i === 0 ? 0 : -10 }]}>
                          <Text style={s.avatarText}>{m.name.charAt(0).toUpperCase()}</Text>
                        </View>
                      ))}
                      <Text style={s.memberCountText}>
                        {item.members.length > 3 ? `+${item.members.length - 3}` : ''} {item.members.length} người tham gia
                      </Text>
                    </View>

                    {isMember ? (
                      <TouchableOpacity style={s.memberBtn} onPress={() => openGroup(item)}>
                        <Text style={s.memberBtnText}>Vào nhóm ›</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[s.joinBtn, isJoining && { opacity: 0.6 }]}
                        onPress={() => joinGroup(item)}
                        disabled={isJoining}
                      >
                        {isJoining
                          ? <ActivityIndicator color="#fff" size="small" />
                          : <Text style={s.joinBtnText}>Tham gia ›</Text>
                        }
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="slide" onRequestClose={() => setShowTimePicker(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowTimePicker(false)}>
          <View style={s.timeModal}>
            <View style={s.timeModalHeader}>
              <Text style={s.timeModalTitle}>Chọn giờ</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={s.timeModalClose}>Xong</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={s.timeList} showsVerticalScrollIndicator={false}>
              {TIME_SLOTS.map(slot => (
                <TouchableOpacity
                  key={slot}
                  style={[s.timeSlot, time === slot && s.timeSlotActive]}
                  onPress={() => { setTime(slot); setShowTimePicker(false); }}
                >
                  <Text style={[s.timeSlotText, time === slot && s.timeSlotTextActive]}>{slot}</Text>
                  {time === slot && <Text style={{ color: GREEN, fontWeight: '700' }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const GREEN = '#16a34a';
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },
  center: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: { width: 36, height: 36, backgroundColor: '#111', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  createBtn: { borderWidth: 1, borderColor: GREEN, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  createBtnText: { color: GREEN, fontSize: 12, fontWeight: '700' },

  formBox: { margin: 16, backgroundColor: '#f0fdf4', borderRadius: 20, padding: 16 },
  formTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },
  formSub: { fontSize: 12, color: '#6b7280', marginBottom: 12, lineHeight: 18 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 10 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12 },
  fieldInput: { flex: 1, fontSize: 13, color: '#111827', paddingVertical: 11 },
  clearX: { fontSize: 14, color: '#9ca3af', paddingLeft: 8 },
  suggestionBox: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', marginTop: 4, overflow: 'hidden' },
  suggestionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  suggestionPin: { fontSize: 13, marginTop: 1 },
  suggestionText: { flex: 1, fontSize: 12, color: '#374151', lineHeight: 18 },
  timeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 11 },
  timeBtnText: { fontSize: 13, color: '#111827', fontWeight: '600' },
  timePlaceholder: { color: '#9ca3af', fontWeight: '400' },
  timeChevron: { fontSize: 14, color: '#9ca3af' },
  prefRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  prefChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff' },
  prefChipActive: { backgroundColor: GREEN, borderColor: GREEN },
  prefChipText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  prefChipTextActive: { color: '#fff', fontWeight: '700' },
  searchBtn: { backgroundColor: GREEN, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 16 },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  listSection: { padding: 16 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  listCount: { fontSize: 13, color: GREEN, fontWeight: '600' },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9ca3af' },

  // Card — new design matching Image #3
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryTag: { backgroundColor: '#f0fdf4', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  categoryTagText: { fontSize: 12, color: GREEN, fontWeight: '600' },
  timeTag: { fontSize: 13, color: '#ef4444', fontWeight: '700' },
  groupName: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 6 },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  addrPin: { fontSize: 13 },
  addrText: { fontSize: 13, color: '#6b7280', flex: 1 },

  cardBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatarGroup: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  avatarText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  memberCountText: { fontSize: 12, color: '#6b7280', marginLeft: 8, fontWeight: '500' },
  joinBtn: { backgroundColor: GREEN, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 9 },
  joinBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  memberBtn: { backgroundColor: '#d1fae5', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 9 },
  memberBtnText: { color: GREEN, fontWeight: '700', fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  timeModal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%' },
  timeModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  timeModalTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  timeModalClose: { fontSize: 15, color: GREEN, fontWeight: '700' },
  timeList: { paddingVertical: 8 },
  timeSlot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  timeSlotActive: { backgroundColor: '#f0fdf4' },
  timeSlotText: { fontSize: 16, color: '#374151' },
  timeSlotTextActive: { color: GREEN, fontWeight: '700' },
});
