import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export function ProfileScreen() {
  const { userName, userId, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn chắc chắn muốn đăng xuất?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  const initial = userName?.charAt(0).toUpperCase() ?? '?';

  return (
    <SafeAreaView style={s.root}>
      {/* Avatar + name */}
      <View style={s.topSection}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initial}</Text>
        </View>
        <Text style={s.name}>{userName}</Text>
        <Text style={s.userId} numberOfLines={1}>ID: {userId}</Text>
      </View>

      {/* Menu items */}
      <View style={s.menu}>
        {[
          { icon: '❤️', label: 'Công thức đã lưu' },
          { icon: '🧊', label: 'Tủ lạnh của tôi' },
          { icon: '⚙️', label: 'Cài đặt' },
          { icon: '❓', label: 'Trợ giúp' },
        ].map(item => (
          <TouchableOpacity key={item.label} style={s.menuItem}>
            <Text style={s.menuIcon}>{item.icon}</Text>
            <Text style={s.menuLabel}>{item.label}</Text>
            <Text style={s.menuChevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },
  topSection: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  name: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  userId: { fontSize: 12, color: '#9ca3af', maxWidth: 240 },
  menu: { marginTop: 16, backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 14 },
  menuIcon: { fontSize: 20 },
  menuLabel: { flex: 1, fontSize: 15, color: '#111827', fontWeight: '500' },
  menuChevron: { fontSize: 20, color: '#d1d5db' },
  logoutBtn: { margin: 20, backgroundColor: '#fee2e2', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 16 },
});
