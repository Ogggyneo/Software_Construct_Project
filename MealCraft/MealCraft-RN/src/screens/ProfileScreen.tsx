import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const COOKING_LEVELS = [
  { id: 'beginner', title: 'Mới bắt đầu', desc: 'Ít kinh nghiệm, cần hướng dẫn rõ' },
  { id: 'home-cook', title: 'Nấu cơ bản', desc: 'Có thể nấu món quen thuộc' },
  { id: 'advanced', title: 'Thành thạo', desc: 'Tự tin thử món mới' },
];

const PREFERENCE_OPTIONS = [
  'Món Việt', 'Món Hàn', 'Món Nhật', 'Món Ý',
  'Healthy', 'Ăn chay', 'Ít cay', 'Nhiều protein', 'Món nhanh', 'Đồ ngọt',
];

const MEAL_HABITS = [
  { value: 'balanced', label: 'Cân bằng' },
  { value: 'healthy', label: 'Ưu tiên healthy' },
  { value: 'quick', label: 'Ưu tiên món nhanh' },
  { value: 'high-protein', label: 'Nhiều protein' },
  { value: 'vegetarian', label: 'Ăn chay' },
];

const COOK_FREQ = [
  { value: 'daily', label: 'Hằng ngày' },
  { value: 'weekly', label: 'Vài lần mỗi tuần' },
  { value: 'rarely', label: 'Hiếm khi nấu' },
  { value: 'learning', label: 'Đang tập nấu' },
];

const STORAGE_KEY = 'mealcraftUserProfile';

export function ProfileScreen() {
  const { userName, logout } = useAuth();
  const [name, setName] = useState(userName ?? '');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [cookingLevel, setCookingLevel] = useState('beginner');
  const [mealHabit, setMealHabit] = useState('balanced');
  const [cookFreq, setCookFreq] = useState('weekly');
  const [preferences, setPreferences] = useState<string[]>(['Món Việt', 'Healthy']);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (!raw) return;
      try {
        const p = JSON.parse(raw);
        if (p.name) setName(p.name);
        if (p.email) setEmail(p.email);
        if (p.location) setLocation(p.location);
        if (p.cookingLevel) setCookingLevel(p.cookingLevel);
        if (p.mealHabit) setMealHabit(p.mealHabit);
        if (p.cookFreq) setCookFreq(p.cookFreq);
        if (p.preferences) setPreferences(p.preferences);
      } catch {}
    });
  }, []);

  const togglePreference = (item: string) => {
    setPreferences(prev =>
      prev.includes(item) ? prev.filter(p => p !== item) : [...prev, item]
    );
  };

  const saveProfile = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ name, email, location, cookingLevel, mealHabit, cookFreq, preferences }));
    Alert.alert('Đã lưu', 'Hồ sơ của bạn đã được cập nhật!');
  };

  const initials = (name || userName || '?').charAt(0).toUpperCase();
  const levelLabel = COOKING_LEVELS.find(l => l.id === cookingLevel)?.title ?? '';

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.pageHeader}>
          <Text style={s.pageTitle}>Hồ sơ cá nhân</Text>
          <Text style={s.pageSub}>Cập nhật thông tin để MealCraft gợi ý món ăn phù hợp hơn.</Text>
        </View>

        <View style={s.avatarRow}>
          <View style={s.avatar}><Text style={s.avatarInitial}>{initials}</Text></View>
          <View>
            <Text style={s.avatarName}>{name || userName}</Text>
            <Text style={s.avatarEmail}>{email || 'Chưa cập nhật email'}</Text>
            <Text style={s.avatarBadge}>MealCraft {levelLabel}</Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Thông tin cá nhân</Text>
          <View style={s.twoCol}>
            <View style={s.fieldBox}>
              <Text style={s.fieldLabel}>👤 Tên người dùng</Text>
              <TextInput style={s.input} value={name} onChangeText={setName} placeholderTextColor="#9ca3af" />
            </View>
            <View style={s.fieldBox}>
              <Text style={s.fieldLabel}>✉️ Email</Text>
              <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="email@example.com" placeholderTextColor="#9ca3af" keyboardType="email-address" />
            </View>
          </View>
          <View style={s.fieldBoxFull}>
            <Text style={s.fieldLabel}>📍 Khu vực sinh sống</Text>
            <TextInput style={s.input} value={location} onChangeText={setLocation} placeholder="105 Tôn Đất Tiên, TP.HCM" placeholderTextColor="#9ca3af" />
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Trình độ nấu ăn</Text>
          <View style={s.levelRow}>
            {COOKING_LEVELS.map(level => (
              <TouchableOpacity key={level.id} style={[s.levelCard, cookingLevel === level.id && s.levelCardActive]} onPress={() => setCookingLevel(level.id)}>
                <Text style={s.levelIcon}>👨‍🍳</Text>
                <Text style={[s.levelTitle, cookingLevel === level.id && s.levelTitleActive]}>{level.title}</Text>
                <Text style={s.levelDesc}>{level.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Sở thích món ăn</Text>
          <View style={s.prefRow}>
            {PREFERENCE_OPTIONS.map(item => (
              <TouchableOpacity key={item} style={[s.prefChip, preferences.includes(item) && s.prefChipActive]} onPress={() => togglePreference(item)}>
                <Text style={[s.prefChipText, preferences.includes(item) && s.prefChipTextActive]}>❤ {item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Thói quen ăn uống</Text>
          <View style={s.twoCol}>
            <View style={s.fieldBox}>
              <Text style={s.fieldLabel}>Phong cách ăn uống</Text>
              <View style={s.selectBox}>
                {MEAL_HABITS.map(h => (
                  <TouchableOpacity key={h.value} style={[s.selectItem, mealHabit === h.value && s.selectItemActive]} onPress={() => setMealHabit(h.value)}>
                    <Text style={[s.selectItemText, mealHabit === h.value && s.selectItemTextActive]}>{h.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={s.fieldBox}>
              <Text style={s.fieldLabel}>🕐 Tần suất nấu ăn</Text>
              <View style={s.selectBox}>
                {COOK_FREQ.map(f => (
                  <TouchableOpacity key={f.value} style={[s.selectItem, cookFreq === f.value && s.selectItemActive]} onPress={() => setCookFreq(f.value)}>
                    <Text style={[s.selectItemText, cookFreq === f.value && s.selectItemTextActive]}>{f.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={s.saveBtn} onPress={saveProfile}>
          <Text style={s.saveBtnText}>💾  Lưu hồ sơ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.logoutBtn} onPress={() => Alert.alert('Đăng xuất', 'Bạn chắc chắn muốn đăng xuất?', [{ text: 'Huỷ', style: 'cancel' }, { text: 'Đăng xuất', style: 'destructive', onPress: logout }])}>
          <Text style={s.logoutBtnText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const GREEN = '#16a34a';
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingBottom: 40 },
  pageHeader: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  pageSub: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 28, fontWeight: '800', color: GREEN },
  avatarName: { fontSize: 18, fontWeight: '800', color: '#111827' },
  avatarEmail: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  avatarBadge: { fontSize: 12, color: GREEN, fontWeight: '600', marginTop: 4 },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 14 },
  twoCol: { flexDirection: 'row', gap: 10 },
  fieldBox: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 14, padding: 12 },
  fieldBoxFull: { backgroundColor: '#f9fafb', borderRadius: 14, padding: 12, marginTop: 10 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, color: '#111827' },
  levelRow: { flexDirection: 'row', gap: 8 },
  levelCard: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, backgroundColor: '#fff' },
  levelCardActive: { borderColor: GREEN, backgroundColor: '#f0fdf4' },
  levelIcon: { fontSize: 20, marginBottom: 6 },
  levelTitle: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 4 },
  levelTitleActive: { color: GREEN },
  levelDesc: { fontSize: 10, color: '#9ca3af', lineHeight: 14 },
  prefRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  prefChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  prefChipActive: { backgroundColor: GREEN, borderColor: GREEN },
  prefChipText: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  prefChipTextActive: { color: '#fff' },
  selectBox: { gap: 4 },
  selectItem: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  selectItemActive: { backgroundColor: GREEN, borderColor: GREEN },
  selectItemText: { fontSize: 12, color: '#374151' },
  selectItemTextActive: { color: '#fff', fontWeight: '600' },
  saveBtn: { margin: 16, backgroundColor: GREEN, borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  logoutBtn: { marginHorizontal: 16, marginTop: 4, backgroundColor: '#fee2e2', borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  logoutBtnText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
});
