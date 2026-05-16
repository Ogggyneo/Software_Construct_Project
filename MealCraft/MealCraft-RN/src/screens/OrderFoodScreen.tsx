import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, SafeAreaView, TextInput, ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { apiFetch } from '../api';
import { useAuth } from '../contexts/AuthContext';

interface Group {
  _id: string; name: string; description: string; address: string;
  members: { user_id: string; name: string; is_ready: boolean }[];
  status: string;
}

const HCMC = { latitude: 10.7769, longitude: 106.7009 };

export function OrderFoodScreen() {
  const navigation = useNavigation<any>();
  const { token, userId } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [preference, setPreference] = useState('');

  const fetchGroups = useCallback(async (lat = HCMC.latitude, lng = HCMC.longitude) => {
    if (!token) return;
    try {
      const data = await apiFetch<{ groups: Group[] }>(
        `/api/group/nearby?latitude=${lat}&longitude=${lng}&maxDistance=50000`, token,
      );
      setGroups(data.groups ?? []);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, [token]);

  useEffect(() => {
    fetchGroups();
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status === Location.PermissionStatus.GRANTED) {
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          .then(pos => fetchGroups(pos.coords.latitude, pos.coords.longitude))
          .catch(() => {});
      }
    });
  }, [fetchGroups]);

  const joinGroup = async (group: Group) => {
    if (!token) return;
    setJoining(group._id);
    try {
      await apiFetch(`/api/group/${group._id}/join`, token, { method: 'POST' });
      await fetchGroups();
      navigation.navigate('GroupChat', { groupId: group._id, groupName: group.name });
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không tham gia được nhóm');
    } finally { setJoining(null); }
  };

  const openGroup = (group: Group) => {
    navigation.navigate('GroupChat', { groupId: group._id, groupName: group.name });
  };

  const isAlreadyMember = (group: Group) =>
    group.members.some(m => String(m.user_id) === String(userId));

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerIcon}><Text style={{ fontSize: 16, color: '#fff' }}>⚡</Text></View>
          <Text style={s.headerTitle}>Đặt món nhóm</Text>
        </View>
        <TouchableOpacity style={s.createBtn} onPress={() => Alert.alert('Tạo nhóm', 'Tính năng sẽ sớm ra mắt!')}>
          <Text style={s.createBtnText}>+ Tạo nhóm mới</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Search form */}
        <View style={s.formBox}>
          <Text style={s.formTitle}>Tìm nhóm quanh bạn</Text>
          <Text style={s.formSub}>Nhập thông tin để tìm những người đang cùng đặt món tại khu vực của bạn.</Text>

          <Text style={s.fieldLabel}>Vị trí của bạn</Text>
          <View style={s.fieldRow}>
            <Text style={s.fieldIcon}>📍</Text>
            <TextInput style={s.fieldInput} placeholder="VD: 191 Bà Triệu, Hai Bà Trưng" value={location} onChangeText={setLocation} placeholderTextColor="#9ca3af" />
          </View>

          <View style={s.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Thời gian</Text>
              <View style={s.fieldRow}>
                <Text style={s.fieldIcon}>🕐</Text>
                <TextInput style={s.fieldInput} placeholder="12:00 PM" value={time} onChangeText={setTime} placeholderTextColor="#9ca3af" />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Sở thích</Text>
              <TextInput style={[s.fieldInput, { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb' }]} placeholder="Cơm, Phở..." value={preference} onChangeText={setPreference} placeholderTextColor="#9ca3af" />
            </View>
          </View>

          <TouchableOpacity style={s.searchBtn} onPress={() => fetchGroups()}>
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
            <View style={s.center}><ActivityIndicator size="large" color="#16a34a" /></View>
          ) : groups.length === 0 ? (
            <View style={s.center}>
              <Text style={s.emptyEmoji}>🍽️</Text>
              <Text style={s.emptyText}>Chưa có nhóm nào gần đây</Text>
            </View>
          ) : (
            groups.map(item => {
              const isMember = isAlreadyMember(item);
              const isJoining = joining === item._id;
              return (
                <View key={item._id} style={s.card}>
                  <View style={s.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.groupName}>{item.name}</Text>
                      {!!item.description && <Text style={s.groupDesc} numberOfLines={2}>{item.description}</Text>}
                      {!!item.address && <Text style={s.groupAddr}>📌 {item.address}</Text>}
                    </View>
                    <View style={s.memberBadge}><Text style={s.memberBadgeText}>{item.members.length} người</Text></View>
                  </View>

                  <View style={s.avatarRow}>
                    {item.members.slice(0, 5).map((m, i) => (
                      <View key={i} style={s.avatar}>
                        <Text style={s.avatarText}>{m.name.charAt(0).toUpperCase()}</Text>
                      </View>
                    ))}
                    {item.members.length > 5 && <Text style={s.moreMembers}>+{item.members.length - 5}</Text>}
                  </View>

                  {isMember ? (
                    <TouchableOpacity style={[s.joinBtn, s.joinBtnMember]} onPress={() => openGroup(item)}>
                      <Text style={[s.joinBtnText, { color: '#16a34a' }]}>💬 Vào nhóm chat</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={[s.joinBtn, isJoining && s.joinBtnDisabled]} onPress={() => joinGroup(item)} disabled={isJoining}>
                      {isJoining ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.joinBtnText}>Tham gia →</Text>}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
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
  formSub: { fontSize: 12, color: '#6b7280', marginBottom: 16, lineHeight: 18 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 10, marginBottom: 12 },
  fieldIcon: { fontSize: 16, marginRight: 8 },
  fieldInput: { flex: 1, fontSize: 13, color: '#111827', paddingVertical: 10 },
  twoCol: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  searchBtn: { backgroundColor: GREEN, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  listSection: { padding: 16 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  listCount: { fontSize: 13, color: GREEN, fontWeight: '600' },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  groupName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  groupDesc: { fontSize: 12, color: '#6b7280', lineHeight: 17, marginBottom: 4 },
  groupAddr: { fontSize: 11, color: '#9ca3af' },
  memberBadge: { backgroundColor: '#dcfce7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  memberBadgeText: { color: GREEN, fontSize: 11, fontWeight: '600' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 11, fontWeight: '700', color: GREEN },
  moreMembers: { fontSize: 12, color: '#9ca3af', marginLeft: 2 },
  joinBtn: { backgroundColor: GREEN, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  joinBtnMember: { backgroundColor: '#d1fae5' },
  joinBtnDisabled: { opacity: 0.6 },
  joinBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
