import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { io, Socket } from 'socket.io-client';
import { BASE_URL, apiFetch } from '../api';
import { useAuth } from '../contexts/AuthContext';

type Params = { GroupChat: { groupId: string; groupName: string } };

interface Msg {
  id: string;
  sender_name: string;
  text: string;
  isMe: boolean;
  time: string;
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
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<FlatList>(null);
  // Keep userId in a ref so socket callbacks don't create stale closures
  const userIdRef = useRef(userId);
  const userNameRef = useRef(userName);
  useEffect(() => { userIdRef.current = userId; }, [userId]);
  useEffect(() => { userNameRef.current = userName; }, [userName]);

  // Track texts we sent optimistically so we can skip the server echo
  const pendingSent = useRef<string[]>([]);

  const rawToMsg = (m: any): Msg => ({
    id: String(m._id ?? m.id ?? Date.now()),
    sender_name: m.sender_name ?? 'Unknown',
    text: m.text,
    isMe: String(m.user_id) === String(userIdRef.current),
    time: new Date(m.createdAt ?? Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const scrollToBottom = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

  useEffect(() => {
    if (!token) return;

    // Load message history via REST
    apiFetch<{ messages: any[] }>(`/api/group/${groupId}/messages`, token)
      .then(d => setMessages((d.messages ?? []).map(rawToMsg)))
      .catch(() => {})
      .finally(() => { setLoading(false); scrollToBottom(); });

    // Open socket — force WebSocket transport to skip slow polling handshake
    const socket = io(BASE_URL, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    // Join the room only after the connection is established (fixes race condition)
    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-group', groupId);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('connect_error', (err) => {
      setConnected(false);
      console.warn('Socket connect_error:', err.message);
    });

    socket.on('message', (m: any) => {
      const isMine = String(m.user_id) === String(userIdRef.current);

      // If this is an echo of a message we sent optimistically, skip it
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
  }, [groupId, token]); // stable deps only — toMsg is a plain fn using refs

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    if (!socketRef.current?.connected) {
      Alert.alert('Mất kết nối', 'Đang kết nối lại, vui lòng thử lại sau giây lát.');
      return;
    }

    setInput('');

    // Add the message immediately for instant feedback (optimistic)
    const optimistic: Msg = {
      id: `opt-${Date.now()}`,
      sender_name: userNameRef.current ?? '',
      text,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    pendingSent.current.push(text);
    setMessages(prev => [...prev, optimistic]);
    scrollToBottom();

    socketRef.current.emit('send-message', { group_id: groupId, text });
  };

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerInfo}>
          <Text style={s.groupName}>{groupName}</Text>
          <View style={s.statusRow}>
            <View style={[s.statusDot, connected ? s.dotGreen : s.dotGray]} />
            <Text style={s.statusText}>{connected ? 'Đã kết nối' : 'Đang kết nối...'}</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color="#16a34a" /></View>
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
              <View style={[s.bubble, m.isMe && s.bubbleMe]}>
                {!m.isMe && <Text style={s.senderName}>{m.sender_name}</Text>}
                <Text style={[s.bubbleText, m.isMe && s.bubbleTextMe]}>{m.text}</Text>
                <Text style={[s.msgTime, m.isMe && s.msgTimeMe]}>{m.time}</Text>
              </View>
            </View>
          )}
        />
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#9ca3af"
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || !connected) && s.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || !connected}
          >
            <Text style={s.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const GREEN = '#16a34a';
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 22, color: '#111', lineHeight: 28 },
  headerInfo: { flex: 1 },
  groupName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  dotGreen: { backgroundColor: GREEN },
  dotGray: { backgroundColor: '#d1d5db' },
  statusText: { fontSize: 11, color: '#9ca3af' },
  msgList: { padding: 14, gap: 10, paddingBottom: 8 },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: '#9ca3af', fontSize: 14 },
  msgRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  msgRowMe: { justifyContent: 'flex-end' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700', color: GREEN },
  bubble: { maxWidth: '75%', backgroundColor: '#fff', borderRadius: 18, borderBottomLeftRadius: 4, padding: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  bubbleMe: { backgroundColor: GREEN, borderBottomLeftRadius: 18, borderBottomRightRadius: 4 },
  senderName: { fontSize: 11, fontWeight: '700', color: GREEN, marginBottom: 3 },
  bubbleText: { fontSize: 14, color: '#111827', lineHeight: 20 },
  bubbleTextMe: { color: '#fff' },
  msgTime: { fontSize: 10, color: '#9ca3af', marginTop: 4, textAlign: 'right' },
  msgTimeMe: { color: 'rgba(255,255,255,0.7)' },
  inputRow: { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#111827', maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#fff', fontSize: 16 },
});
