import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, Modal, Image, ScrollView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { io, Socket } from 'socket.io-client';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL, apiFetch } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { FabContext } from '../contexts/FabContext';

type Params = { GroupChat: { groupId: string; groupName: string } };

interface Msg {
  id: string;
  sender_name: string;
  text: string;
  isMe: boolean;
  time: string;
  isImage?: boolean;
}

interface GroupDetail {
  _id: string; name: string; description: string; address: string;
  members: { user_id: string; name: string; is_ready: boolean }[];
}

export function GroupChatScreen() {
  const route = useRoute<RouteProp<Params, 'GroupChat'>>();
  const navigation = useNavigation<any>();
  const { token, userId, userName } = useAuth();
  const { groupId, groupName } = route.params;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [groupDetail, setGroupDetail] = useState<GroupDetail | null>(null);
  const [leaving, setLeaving] = useState(false);

  const { setFabVisible } = useContext(FabContext);

  // Hide the global floating AI button while this screen is focused
  useFocusEffect(useCallback(() => {
    setFabVisible(false);
    return () => setFabVisible(true);
  }, [setFabVisible]));

  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<FlatList>(null);
  const userIdRef = useRef(userId);
  const userNameRef = useRef(userName);
  useEffect(() => { userIdRef.current = userId; }, [userId]);
  useEffect(() => { userNameRef.current = userName; }, [userName]);
  const pendingSent = useRef<string[]>([]);

  const rawToMsg = (m: any): Msg => {
    const txt = String(m.text ?? '');
    return {
      id: String(m._id ?? m.id ?? Date.now()),
      sender_name: m.sender_name ?? 'Unknown',
      text: txt,
      isMe: String(m.user_id) === String(userIdRef.current),
      time: new Date(m.createdAt ?? Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isImage: txt.startsWith('data:image'),
    };
  };

  const scrollToBottom = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

  useEffect(() => {
    if (!token) return;

    apiFetch<{ messages: any[] }>(`/api/group/${groupId}/messages`, token)
      .then(d => setMessages((d.messages ?? []).map(rawToMsg)))
      .catch(() => {})
      .finally(() => { setLoading(false); scrollToBottom(); });

    const socket = io(BASE_URL, { auth: { token }, transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-group', groupId);
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    socket.on('message', (m: any) => {
      const isMine = String(m.user_id) === String(userIdRef.current);
      if (isMine && pendingSent.current.includes(m.text)) {
        const idx = pendingSent.current.indexOf(m.text);
        pendingSent.current.splice(idx, 1);
        return;
      }
      setMessages(prev => [...prev, rawToMsg(m)]);
      scrollToBottom();
    });

    return () => {
      socket.emit('leave-group', groupId);
      socket.disconnect();
    };
  }, [groupId, token]);

  const sendText = (text: string) => {
    if (!text.trim() || !socketRef.current?.connected) return;
    const optimistic: Msg = {
      id: `opt-${Date.now()}`,
      sender_name: userNameRef.current ?? '',
      text,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isImage: text.startsWith('data:image'),
    };
    pendingSent.current.push(text);
    setMessages(prev => [...prev, optimistic]);
    scrollToBottom();
    socketRef.current.emit('send-message', { group_id: groupId, text });
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    if (!socketRef.current?.connected) {
      Alert.alert('Mất kết nối', 'Đang kết nối lại, thử lại sau giây lát.');
      return;
    }
    setInput('');
    sendText(text);
  };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Cần quyền truy cập thư viện ảnh'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.35,
      base64: true,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      sendText(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('Cần quyền camera'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.35, base64: true });
    if (!result.canceled && result.assets[0]?.base64) {
      sendText(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const openInfo = async () => {
    setShowInfo(true);
    if (groupDetail) return;
    try {
      const d = await apiFetch<{ group: GroupDetail }>(`/api/group/${groupId}`, token!);
      setGroupDetail(d.group);
    } catch {}
  };

  const leaveGroup = async () => {
    if (!token) return;
    setLeaving(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      await apiFetch(`/api/group/${groupId}/leave`, token, {
        method: 'DELETE',
        signal: controller.signal,
      });
      clearTimeout(timer);
      navigation.navigate('OrderFood');
    } catch (err: any) {
      const msg = err.name === 'AbortError'
        ? 'Kết nối quá chậm, thử lại sau'
        : (err.message || 'Không rời được nhóm');
      if (Platform.OS === 'web') {
        (globalThis as any).alert?.(msg);
      } else {
        Alert.alert('Lỗi', msg);
      }
    } finally {
      setLeaving(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.headerInfo} onPress={openInfo} activeOpacity={0.7}>
          <View style={s.headerAvatar}><Text style={s.headerAvatarText}>{groupName.charAt(0).toUpperCase()}</Text></View>
          <View>
            <Text style={s.groupName}>{groupName}</Text>
            <Text style={s.groupSub}>Xem thông tin nhóm</Text>
          </View>
        </TouchableOpacity>
        <View style={s.headerRight}>
          <View style={[s.statusDot, connected ? s.dotGreen : s.dotGray]} />
          <TouchableOpacity onPress={openInfo} style={s.infoBtn}>
            <Text style={s.infoBtnText}>ⓘ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={s.center}><ActivityIndicator color={GREEN} /></View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={s.msgList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyText}>Chưa có tin nhắn. Hãy bắt đầu trò chuyện! 🍽️</Text>
            </View>
          }
          renderItem={({ item: m }) => (
            <View style={[s.msgRow, m.isMe && s.msgRowMe]}>
              {!m.isMe && (
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{m.sender_name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={[s.bubble, m.isMe && s.bubbleMe, m.isImage && s.bubbleImage]}>
                {!m.isMe && !m.isImage && <Text style={s.senderName}>{m.sender_name}</Text>}
                {m.isImage ? (
                  <Image source={{ uri: m.text }} style={s.msgImage} resizeMode="cover" />
                ) : (
                  <Text style={[s.bubbleText, m.isMe && s.bubbleTextMe]}>{m.text}</Text>
                )}
                <Text style={[s.msgTime, m.isMe && s.msgTimeMe]}>{m.time}</Text>
              </View>
            </View>
          )}
        />
      )}

      {/* Input row */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.inputRow}>
          <TouchableOpacity style={s.iconBtn} onPress={pickFromGallery}>
            <Text style={s.iconBtnText}>+</Text>
          </TouchableOpacity>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#9ca3af"
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity style={s.iconBtn} onPress={takePhoto}>
            <Text style={s.iconBtnText}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || !connected) && s.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || !connected}
          >
            <Text style={s.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Group Info Modal */}
      <Modal visible={showInfo} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowInfo(false)}>
        <SafeAreaView style={s.infoRoot}>
          <View style={s.infoHeader}>
            <TouchableOpacity onPress={() => setShowInfo(false)} style={s.backBtn}>
              <Text style={s.backText}>‹</Text>
            </TouchableOpacity>
            <Text style={s.infoTitle}>Thông tin nhóm</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={s.infoScroll}>
            {/* Group avatar + name */}
            <View style={s.infoAvatarWrap}>
              <View style={s.infoAvatar}><Text style={s.infoAvatarText}>{groupName.charAt(0).toUpperCase()}</Text></View>
              <Text style={s.infoGroupName}>{groupName}</Text>
              {groupDetail?.description ? (
                <Text style={s.infoGroupDesc}>{groupDetail.description}</Text>
              ) : null}
            </View>

            {/* Members */}
            <Text style={s.infoSectionTitle}>
              {groupDetail?.members.length ?? '—'} người
            </Text>
            <View style={s.infoMemberList}>
              {(groupDetail?.members ?? []).map((m, i) => {
                const isMe = String(m.user_id) === String(userId);
                return (
                  <View key={i} style={[s.infoMemberRow, i < (groupDetail?.members.length ?? 0) - 1 && s.infoMemberBorder]}>
                    <View style={s.infoMemberAvatar}>
                      <Text style={s.infoMemberAvatarText}>{m.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={s.infoMemberName}>{m.name}</Text>
                    {isMe && <View style={s.youBadge}><Text style={s.youBadgeText}>Bạn</Text></View>}
                  </View>
                );
              })}
            </View>

            {/* Leave group */}
            <TouchableOpacity
              style={s.leaveBtn}
              onPress={() => {
                if (Platform.OS === 'web') {
                  if ((globalThis as any).confirm?.(`Bạn muốn rời khỏi "${groupName}"?`)) leaveGroup();
                } else {
                  Alert.alert('Rời nhóm', `Bạn muốn rời khỏi "${groupName}"?`, [
                    { text: 'Huỷ', style: 'cancel' },
                    { text: 'Rời nhóm', style: 'destructive', onPress: leaveGroup },
                  ]);
                }
              }}
              disabled={leaving}
            >
              {leaving
                ? <ActivityIndicator color="#ef4444" />
                : <>
                    <Text style={s.leaveIcon}>←</Text>
                    <Text style={s.leaveBtnText}>Rời nhóm</Text>
                  </>
              }
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const GREEN = '#16a34a';
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', gap: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 22, color: '#111', lineHeight: 28 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  headerAvatarText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  groupName: { fontSize: 15, fontWeight: '800', color: '#111827' },
  groupSub: { fontSize: 11, color: '#9ca3af' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  dotGreen: { backgroundColor: GREEN },
  dotGray: { backgroundColor: '#d1d5db' },
  infoBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  infoBtnText: { fontSize: 16, color: '#374151' },

  msgList: { padding: 14, gap: 10, paddingBottom: 8 },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: '#9ca3af', fontSize: 14 },
  msgRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  msgRowMe: { justifyContent: 'flex-end' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700', color: GREEN },
  bubble: { maxWidth: '75%', backgroundColor: '#fff', borderRadius: 18, borderBottomLeftRadius: 4, padding: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  bubbleMe: { backgroundColor: GREEN, borderBottomLeftRadius: 18, borderBottomRightRadius: 4 },
  bubbleImage: { padding: 4, backgroundColor: '#fff' },
  senderName: { fontSize: 11, fontWeight: '700', color: GREEN, marginBottom: 3 },
  bubbleText: { fontSize: 14, color: '#111827', lineHeight: 20 },
  bubbleTextMe: { color: '#fff' },
  msgImage: { width: 200, height: 200, borderRadius: 14 },
  msgTime: { fontSize: 10, color: '#9ca3af', marginTop: 4, textAlign: 'right' },
  msgTimeMe: { color: 'rgba(255,255,255,0.7)' },

  inputRow: { flexDirection: 'row', gap: 6, padding: 10, paddingHorizontal: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', alignItems: 'flex-end' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 18 },
  input: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, color: '#111827', maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#fff', fontSize: 16 },

  // Group info modal
  infoRoot: { flex: 1, backgroundColor: '#fff' },
  infoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  infoScroll: { padding: 20, paddingBottom: 40 },
  infoAvatarWrap: { alignItems: 'center', marginBottom: 24 },
  infoAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  infoAvatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  infoGroupName: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  infoGroupDesc: { fontSize: 13, color: '#6b7280' },
  infoSectionTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 12 },
  infoMemberList: { backgroundColor: '#f9fafb', borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  infoMemberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  infoMemberBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoMemberAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  infoMemberAvatarText: { fontSize: 14, fontWeight: '700', color: GREEN },
  infoMemberName: { flex: 1, fontSize: 14, color: '#111827', fontWeight: '500' },
  youBadge: { backgroundColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  youBadgeText: { fontSize: 11, color: '#6b7280', fontWeight: '600' },
  leaveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fee2e2', borderRadius: 16, paddingVertical: 14 },
  leaveIcon: { fontSize: 18, color: '#ef4444' },
  leaveBtnText: { fontSize: 15, color: '#ef4444', fontWeight: '700' },
});
