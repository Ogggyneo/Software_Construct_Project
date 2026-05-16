import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { apiFetch } from '../api';
import { useAuth } from '../contexts/AuthContext';

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) return Alert.alert('Lỗi', 'Nhập email và mật khẩu');
    setLoading(true);
    try {
      if (isRegister) {
        if (!name) return Alert.alert('Lỗi', 'Nhập tên của bạn');
        await apiFetch('/api/auth/register', null, {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        });
        Alert.alert('Thành công', 'Đăng ký thành công! Hãy đăng nhập.');
        setIsRegister(false);
      } else {
        const data = await apiFetch<{ token: string; user_id: string; name: string }>(
          '/api/auth/login', null, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          }
        );
        await login(data.token, String(data.user_id), data.name);
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.card}>
        <Text style={s.logo}>🍳 MealCraft</Text>
        <Text style={s.subtitle}>{isRegister ? 'Tạo tài khoản' : 'Chào mừng trở lại!'}</Text>

        {isRegister && (
          <TextInput
            style={s.input} placeholder="Tên của bạn"
            value={name} onChangeText={setName} autoCapitalize="words"
          />
        )}
        <TextInput
          style={s.input} placeholder="Email"
          value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none"
        />
        <TextInput
          style={s.input} placeholder="Mật khẩu"
          value={password} onChangeText={setPassword} secureTextEntry
        />

        <TouchableOpacity style={s.btn} onPress={handleSubmit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>{isRegister ? 'Đăng ký' : 'Đăng nhập'}</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegister(r => !r)}>
          <Text style={s.toggle}>
            {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0fdf4', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 28, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  logo: { fontSize: 28, fontWeight: '800', color: '#16a34a', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, marginBottom: 12, backgroundColor: '#f9fafb' },
  btn: { backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  toggle: { color: '#16a34a', textAlign: 'center', marginTop: 16, fontSize: 14 },
});
