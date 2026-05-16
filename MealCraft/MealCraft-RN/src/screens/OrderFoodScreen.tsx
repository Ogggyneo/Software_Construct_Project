import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, SafeAreaView,
} from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { apiFetch } from '../api';
import { useAuth } from '../contexts/AuthContext';

interface Group {
  _id: string;
  name: string;
  description: string;
  address: string;
  members: { user_id: string; name: string; is_ready: boolean }[];
  status: string;
}

type LocationState =
  | { phase: 'idle' }
  | { phase: 'locating' }
  | { phase: 'denied' }
  | { phase: 'done'; latitude: number; longitude: number };

export function OrderFoodScreen() {
  const navigation = useNavigation<any>();
  const { token, userId } = useAuth();
  const [locState, setLocState] = useState<LocationState>({ phase: 'idle' });
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);

  const fetchNearbyGroups = useCallback(async (lat: number, lng: number) => {
    if (!token) return;
    setLoadingGroups(true);
    try {
      const data = await apiFetch<{ groups: Group[] }>(
        `/api/group/nearby?latitude=${lat}&longitude=${lng}`,
        token,
      );
      setGroups(data.groups ?? []);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không tải được danh sách nhóm');
    } finally {
      setLoadingGroups(false);
    }
  }, [token]);

  const requestLocation = useCallback(async () => {
    setLocState({ phase: 'locating' });

    // Ask for permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== Location.PermissionStatus.GRANTED) {
      setLocState({ phase: 'denied' });
      Alert.alert(
        'Cần quyền vị trí',
        'MealCraft cần vị trí để tìm nhóm gần bạn. Vui lòng bật trong Cài đặt.',
        [{ text: 'OK' }],
      );
      return;
    }

    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;
      setLocState({ phase: 'done', latitude, longitude });
      await fetchNearbyGroups(latitude, longitude);
    } catch {
      setLocState({ phase: 'idle' });
      Alert.alert('Lỗi', 'Không lấy được vị trí, thử lại nhé.');
    }
  }, [fetchNearbyGroups]);

  const joinGroup = async (group: Group) => {
    if (!token) return;
    setJoining(group._id);
    try {
      await apiFetch(`/api/group/${group._id}/join`, token, { method: 'POST' });
      if (locState.phase === 'done') {
        await fetchNearbyGroups(locState.latitude, locState.longitude);
      }
      navigation.navigate('GroupChat', { groupId: group._id, groupName: group.name });
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không tham gia được nhóm');
    } finally {
      setJoining(null);
    }
  };

  const openGroup = (group: Group) => {
    navigation.navigate('GroupChat', { groupId: group._id, groupName: group.name });
  };

  const isAlreadyMember = (group: Group) =>
    group.members.some(m => String(m.user_id) === String(userId));

  // ── Idle / permission denied state ──────────────────────────────────────────
  if (locState.phase !== 'done') {
    return (
      <SafeAreaView style={s.center}>
        <Text style={s.emoji}>📍</Text>
        <Text style={s.title}>Tìm nhóm đặt món gần bạn</Text>
        <Text style={s.sub}>
          {locState.phase === 'denied'
            ? 'Quyền vị trí bị từ chối. Bật lại trong Cài đặt → MealCraft → Vị trí.'
            : 'Cho phép MealCraft biết vị trí của bạn để hiển thị các nhóm đang mở gần đây.'}
        </Text>

        <TouchableOpacity
          style={[s.btn, locState.phase === 'locating' && s.btnDisabled]}
          onPress={requestLocation}
          disabled={locState.phase === 'locating'}
        >
          {locState.phase === 'locating' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.btnText}>
              {locState.phase === 'denied' ? '🔄 Thử lại' : '📍 Dùng vị trí của tôi'}
            </Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Groups list ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Nhóm gần bạn</Text>
          <Text style={s.headerSub}>
            {locState.latitude.toFixed(4)}, {locState.longitude.toFixed(4)}
          </Text>
        </View>
        <TouchableOpacity
          style={s.createBtn}
          onPress={() => Alert.alert('Tạo nhóm', 'Tính năng tạo nhóm sẽ sớm ra mắt!')}
        >
          <Text style={s.createBtnText}>+ Tạo nhóm</Text>
        </TouchableOpacity>
      </View>

      {loadingGroups ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={s.loadingText}>Đang tải nhóm...</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={item => item._id}
          contentContainerStyle={groups.length === 0 ? s.emptyContainer : { padding: 16, gap: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={loadingGroups}
              onRefresh={() => fetchNearbyGroups(locState.latitude, locState.longitude)}
              tintColor="#16a34a"
            />
          }
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={s.emoji}>🍽️</Text>
              <Text style={s.title}>Chưa có nhóm nào gần đây</Text>
              <Text style={s.sub}>Kéo xuống để tải lại hoặc tạo nhóm mới!</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMember = isAlreadyMember(item);
            const isJoining = joining === item._id;
            return (
              <View style={s.card}>
                <View style={s.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.groupName}>{item.name}</Text>
                    {!!item.description && (
                      <Text style={s.groupDesc} numberOfLines={2}>{item.description}</Text>
                    )}
                    {!!item.address && (
                      <Text style={s.groupAddr}>📌 {item.address}</Text>
                    )}
                  </View>
                  <View style={s.badge}>
                    <Text style={s.badgeText}>{item.members.length} người</Text>
                  </View>
                </View>

                {/* Member avatars */}
                <View style={s.members}>
                  {item.members.slice(0, 5).map((m, i) => (
                    <View key={i} style={s.avatar}>
                      <Text style={s.avatarText}>{m.name.charAt(0).toUpperCase()}</Text>
                    </View>
                  ))}
                  {item.members.length > 5 && (
                    <Text style={s.moreMembers}>+{item.members.length - 5}</Text>
                  )}
                </View>

                <View style={s.actionRow}>
                  {isMember ? (
                    <TouchableOpacity style={[s.joinBtn, s.joinBtnMember]} onPress={() => openGroup(item)}>
                      <Text style={[s.joinBtnText, { color: GREEN }]}>💬 Vào nhóm chat</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[s.joinBtn, isJoining && s.joinBtnDisabled]}
                      onPress={() => joinGroup(item)}
                      disabled={isJoining}
                    >
                      {isJoining
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Text style={s.joinBtnText}>Tham gia nhóm</Text>
                      }
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const GREEN = '#16a34a';

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  btn: { backgroundColor: GREEN, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center', minWidth: 220 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  headerSub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  createBtn: { backgroundColor: GREEN, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  loadingText: { marginTop: 12, color: '#6b7280', fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  groupName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
  groupDesc: { fontSize: 13, color: '#6b7280', lineHeight: 18, marginBottom: 4 },
  groupAddr: { fontSize: 12, color: '#9ca3af' },
  badge: { backgroundColor: '#dcfce7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { color: GREEN, fontSize: 12, fontWeight: '600' },
  members: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '700', color: GREEN },
  moreMembers: { fontSize: 12, color: '#9ca3af', marginLeft: 2 },
  actionRow: { },
  joinBtn: { backgroundColor: GREEN, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  joinBtnMember: { backgroundColor: '#d1fae5' },
  joinBtnDisabled: { opacity: 0.6 },
  joinBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
