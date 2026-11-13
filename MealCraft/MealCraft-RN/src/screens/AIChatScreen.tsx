import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../api';
import { useAuth } from '../contexts/AuthContext';

interface Msg { role: 'user' | 'model'; text: string }

const SUGGESTIONS = [
  'Hôm nay nên ăn gì?',
  'Món ăn ít calo nhất?',
  'Gợi ý món từ trứng và cà chua',
  'Ăn gì để tăng cơ?',
];

export function AIChatScreen() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'model', text: 'Xin chào! Mình là MealCraft AI 👨‍🍳 Bạn muốn mình gợi ý món ăn gì hôm nay?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);
  const profileRef = useRef<Record<string, any> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('mealcraftUserProfile').then(raw => {
      if (raw) try { profileRef.current = JSON.parse(raw); } catch {}
    });
  }, []);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading || !token) return;
    const next: Msg[] = [...messages, { role: 'user', text }];
    setMessages(next);
    setInput('');
    setLoading(true);

    const history = next.slice(1, -1).map(m => ({ role: m.role, text: m.text }));
    try {
      const data = await apiFetch<{ reply: string }>('/api/ai/chat', token, {
        method: 'POST',
        body: JSON.stringify({ message: text, history, profile: profileRef.current }),
      });
      setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
    } catch (err: any) {
      const reason = err?.message || '';
      console.error('[AI Chat] error:', reason);
      const display = reason.includes('not configured')
        ? 'Chatbot chưa được cấu hình API key.'
        : reason.includes('429')
        ? 'Mình đang bận quá, thử lại sau nhé!'
        : `Mình đang gặp sự cố kết nối. Thử lại sau nhé!\n(${reason || 'unknown error'})`;
      setMessages(prev => [...prev, { role: 'model', text: display }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerIcon}><Text style={{ fontSize: 20 }}>👨‍🍳</Text></View>
        <View>
          <Text style={s.headerTitle}>MealCraft AI</Text>
          <Text style={s.headerSub}>Trợ lý ẩm thực thông minh</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={s.msgList}
        ListFooterComponent={
          loading ? (
            <View style={[s.bubble, s.bubbleModel]}>
              <View style={s.typingRow}>
                {[0, 150, 300].map(d => (
                  <View key={d} style={s.dot} />
                ))}
              </View>
            </View>
          ) : null
        }
        renderItem={({ item: m }) => (
          <View style={[s.msgRow, m.role === 'user' && s.msgRowUser]}>
            <View style={[s.bubble, m.role === 'user' ? s.bubbleUser : s.bubbleModel]}>
              <Text style={[s.bubbleText, m.role === 'user' && s.bubbleTextUser]}>
                {m.text}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Suggestions — first message only */}
      {messages.length === 1 && (
        <View style={s.suggestions}>
          {SUGGESTIONS.map((s2, i) => (
            <TouchableOpacity key={i} style={s.chip} onPress={() => send(s2)}>
              <Text style={s.chipText}>{s2}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Hỏi gì đó về món ăn..."
            placeholderTextColor="#9ca3af"
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnDisabled]}
            onPress={() => send(input)}
            disabled={!input.trim() || loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={s.sendBtnText}>➤</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const GREEN = '#16a34a';
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: GREEN },
  headerIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  msgList: { padding: 14, gap: 10, paddingBottom: 10 },
  msgRow: { alignItems: 'flex-start' },
  msgRowUser: { alignItems: 'flex-end' },
  bubble: { maxWidth: '82%', borderRadius: 18, padding: 12 },
  bubbleModel: { backgroundColor: '#fff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  bubbleUser: { backgroundColor: GREEN, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, color: '#111827', lineHeight: 21 },
  bubbleTextUser: { color: '#fff' },
  typingRow: { flexDirection: 'row', gap: 5, padding: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#d1d5db' },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 14, paddingBottom: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#dcfce7', borderRadius: 14, borderWidth: 1, borderColor: '#bbf7d0' },
  chipText: { fontSize: 12, color: GREEN, fontWeight: '600' },
  inputRow: { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  input: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#111827', maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#fff', fontSize: 16 },
});
