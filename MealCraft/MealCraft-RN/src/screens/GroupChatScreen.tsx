import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { io, Socket } from 'socket.io-client';
import { BASE_URL, apiFetch } from '../api';
import { useAuth } from '../contexts/AuthContext';

type Params = { GroupChat: { groupId: string; groupName: string } };

interface Msg {
  id: string; sender_name: string; text: string; isMe: boolean; time: string;
}

export function GroupChatScreen() {
  const route = useRoute<RouteProp<Params, 'GroupChat'>>();
  const navigation = useNavigation<any>();
  const { token, userId } = useAuth();
  const { groupId, groupName } = route.params;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<FlatList>(null);

  const toMsg = useCallback((m: any): Msg => ({
    id: String(m._id ?? m.id ?? Date.now()),
    sender_name: m.sender_name ?? m.user ?? 'Unknown',
    text: m.text,
    isMe: String(m.user_id) === String(userId),
    time: new Date(m.createdAt ?? Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }), [userId]);

  useEffect(() => {
    if (!token) return;

    // Load history
    apiFetch<{ messages: any[] }>(`/api/group/${groupId}/messages`, token)
      .then(d => setMessages((d.messages ?? []).map(toMsg)))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Socket
    const socket = io(BASE_URL, { auth: { token } });
    socketRef.current = socket;
    socket.emit('join-group', groupId);
    socket.on('message', (m: any) => {
      setMessages(prev => [...prev, toMsg(m)]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return () => {
      socket.emit('leave-group', groupId);
      socket.disconnect();
    };
  }, [groupId, token, toMsg]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !socketRef.current) return;
    socketRef.current.emit('send-message', { group_id: groupId, text });
    setInput('');
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
          <Text style={s.groupSub}>Nhóm đặt món · realtime</Text>
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
          />
          <TouchableOpacity
            style={[s.sendBtn, !input.trim() && s.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim()}
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
  groupSub: { fontSize: 11, color: '#9ca3af' },
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
  inputRow: { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  input: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#111827' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#fff', fontSize: 16 },
});
