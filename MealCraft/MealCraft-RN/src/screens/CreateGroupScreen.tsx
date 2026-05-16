import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFetch } from '../api';
import { useAuth } from '../contexts/AuthContext';

type GroupType = 'private' | 'public';

export function CreateGroupScreen() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();

  const [name, setName] = useState('');
  const [type, setType] = useState<GroupType>('private');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

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
      const data = await apiFetch<{ group_id: string }>('/api/group/create', token, {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description: type === 'private' ? 'Nhóm riêng' : 'Nhóm công khai',
          address: '',
          latitude: 10.7769,
          longitude: 106.7009,
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
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Tạo nhóm mới</Text>
          <Text style={s.headerSub}>Tạo group chat để cùng nấu ăn hoặc đặt món</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Icon */}
        <View style={s.iconWrap}>
          <View style={s.iconCircle}>
            <Text style={s.iconEmoji}>👥</Text>
          </View>
        </View>

        {/* Name */}
        <Text style={s.label}>Tên nhóm</Text>
        <TextInput
          style={s.input}
          placeholder="Ví dụ: Team ăn trưa, Hội mê đồ Việt..."
          value={name}
          onChangeText={setName}
          placeholderTextColor="#9ca3af"
        />

        {/* Type */}
        <Text style={s.label}>Loại nhóm</Text>
        <View style={s.typeRow}>
          <TouchableOpacity
            style={[s.typeCard, type === 'private' && s.typeCardActive]}
            onPress={() => setType('private')}
          >
            <Text style={[s.typeName, type === 'private' && s.typeNameActive]}>Nhóm riêng</Text>
            <Text style={s.typeDesc}>Chỉ thành viên được mời mới tham gia</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.typeCard, type === 'public' && s.typeCardActive]}
            onPress={() => setType('public')}
          >
            <Text style={[s.typeName, type === 'public' && s.typeNameActive]}>Nhóm công khai</Text>
            <Text style={s.typeDesc}>Người dùng khác có thể tìm và tham gia</Text>
          </TouchableOpacity>
        </View>

        {/* Add members */}
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

        {/* Preview */}
        <View style={s.preview}>
          <Text style={s.previewLabel}>Xem trước nhóm</Text>
          <View style={s.previewCard}>
            <View style={s.previewLeft}>
              <View style={s.previewIcon}><Text style={s.previewIconText}>👥</Text></View>
            </View>
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
          <View style={s.previewStats}>
            <View style={s.previewStat}>
              <Text style={s.previewStatLabel}>Số thành viên</Text>
              <Text style={s.previewStatValue}>{members.length}</Text>
            </View>
            <View style={s.previewStatDivider} />
            <View style={s.previewStat}>
              <Text style={s.previewStatLabel}>Trạng thái</Text>
              <Text style={[s.previewStatValue, { color: GREEN }]}>Sẵn sàng</Text>
            </View>
          </View>
        </View>

        {/* Create button */}
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

  scroll: { padding: 20, paddingBottom: 40 },

  iconWrap: { alignItems: 'center', marginBottom: 24 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 36 },

  label: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 4 },
  input: { backgroundColor: '#f3f4f6', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 14, color: '#111827', marginBottom: 20 },

  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeCard: { flex: 1, borderRadius: 14, borderWidth: 2, borderColor: '#e5e7eb', padding: 14, backgroundColor: '#fff' },
  typeCardActive: { borderColor: GREEN, backgroundColor: '#f0fdf4' },
  typeName: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 4 },
  typeNameActive: { color: GREEN },
  typeDesc: { fontSize: 11, color: '#9ca3af', lineHeight: 16 },

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
  previewLeft: {},
  previewIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  previewIconText: { fontSize: 20 },
  previewName: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 6 },
  previewBadge: { alignSelf: 'flex-start', backgroundColor: '#dcfce7', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  previewBadgeText: { fontSize: 11, color: GREEN, fontWeight: '700' },
  previewStats: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  previewStat: { flex: 1, alignItems: 'center', padding: 12 },
  previewStatDivider: { width: 1, backgroundColor: '#f3f4f6' },
  previewStatLabel: { fontSize: 11, color: '#9ca3af', marginBottom: 4 },
  previewStatValue: { fontSize: 18, fontWeight: '800', color: '#111827' },

  createBtn: { backgroundColor: GREEN, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  createBtnDisabled: { opacity: 0.5 },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
