import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';

function webConfirm(msg: string): boolean {
  if (Platform.OS === 'web') return (globalThis as any).confirm?.(msg) ?? false;
  return false;
}
import { useNavigation } from '@react-navigation/native';
import { apiFetch } from '../api';
import { useAuth } from '../contexts/AuthContext';

interface FridgeItem { _id: string; name: string; quantity: string; unit: string }

interface MatchedRecipe {
  _id: string; title: string; category: string; image_url: string;
  cook_time_min: number; calories_per_serving: number;
  total_ingredients: number; matched_ingredients: number;
  missing_ingredients: number; status: string;
}

const POPULAR = ['Ức gà', 'Thịt bò', 'Tôm', 'Cà chua', 'Trứng', 'Khoai tây', 'Hành tây', 'Tỏi'];

export function IngredientsScreen() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [fridge, setFridge] = useState<FridgeItem[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [matches, setMatches] = useState<MatchedRecipe[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);

  const fetchFridge = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<{ items: FridgeItem[] }>('/api/fridge', token);
      setFridge(data.items ?? []);
    } catch {} finally { setLoading(false); }
  }, [token]);

  const fetchMatches = useCallback(async () => {
    if (!token) return;
    setMatchLoading(true);
    try {
      const data = await apiFetch<{ recipes: MatchedRecipe[] }>('/api/recipes/matching', token);
      setMatches(data.recipes ?? []);
    } catch {} finally { setMatchLoading(false); }
  }, [token]);

  useEffect(() => { fetchFridge(); }, [fetchFridge]);
  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const addIngredient = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || !token) return;
    if (fridge.some(f => f.name.toLowerCase() === trimmed.toLowerCase())) return;
    setAdding(true);
    try {
      await apiFetch('/api/fridge', token, { method: 'POST', body: JSON.stringify({ name: trimmed }) });
      setInput('');
      await fetchFridge();
      await fetchMatches();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thêm được nguyên liệu');
    } finally { setAdding(false); }
  };

  const removeItem = async (id: string) => {
    if (!token) return;
    try {
      await apiFetch(`/api/fridge/${id}`, token, { method: 'DELETE' });
      setFridge(prev => prev.filter(f => f._id !== id));
      await fetchMatches();
    } catch { Alert.alert('Lỗi', 'Không xoá được nguyên liệu'); }
  };

  const doClearAll = async () => {
    if (!token) return;
    try {
      await apiFetch('/api/fridge/clear', token, { method: 'DELETE' });
      setFridge([]); setMatches([]);
    } catch { Alert.alert('Lỗi', 'Không xoá được'); }
  };

  const clearAll = () => {
    if (Platform.OS === 'web') {
      if (webConfirm('Xoá hết nguyên liệu trong tủ lạnh?')) doClearAll();
    } else {
      Alert.alert('Xoá tủ lạnh', 'Xoá hết nguyên liệu?', [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Xoá hết', style: 'destructive', onPress: doClearAll },
      ]);
    }
  };

  const goToMeal = (recipe: MatchedRecipe) => {
    navigation.navigate('Home', {
      screen: 'MealDetail',
      params: { recipeId: recipe._id, title: recipe.title, image_url: recipe.image_url, cook_time_min: recipe.cook_time_min, calories_per_serving: recipe.calories_per_serving, category: recipe.category, tags: [] },
    });
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>🧊 Tủ lạnh của tôi</Text>
        {fridge.length > 0 && <TouchableOpacity onPress={clearAll}><Text style={s.clearBtn}>Xoá hết</Text></TouchableOpacity>}
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {loading ? (
          <View style={s.center}><ActivityIndicator size="large" color="#16a34a" /></View>
        ) : (
          <>
            {fridge.length > 0 && (
              <View style={s.chipRow}>
                {fridge.map(item => (
                  <View key={item._id} style={s.fridgeChip}>
                    <Text style={s.fridgeChipText}>{item.name}</Text>
                    <TouchableOpacity onPress={() => removeItem(item._id)}>
                      <Text style={s.fridgeChipX}> ✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={s.section}>
              <Text style={s.sectionLabel}>GỢI Ý PHỔ BIẾN</Text>
              <View style={s.popularRow}>
                {POPULAR.map(p => {
                  const inFridge = fridge.some(f => f.name.toLowerCase() === p.toLowerCase());
                  return (
                    <TouchableOpacity key={p} style={[s.popularBtn, inFridge && s.popularBtnDisabled]} onPress={() => addIngredient(p)} disabled={inFridge || adding}>
                      <Text style={s.popularBtnText}>+ {p}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {fridge.length > 0 && (
              <View style={s.section}>
                <View style={s.matchHeader}>
                  <Text style={s.matchTitle}>
                    {matchLoading ? 'Đang tìm...' : matches.length > 0 ? `Tìm thấy ${matches.length} món phù hợp` : 'Chưa có công thức phù hợp'}
                  </Text>
                  <TouchableOpacity onPress={fetchMatches}><Text style={s.refreshText}>Làm mới</Text></TouchableOpacity>
                </View>
                {matchLoading ? (
                  <ActivityIndicator color="#16a34a" style={{ marginTop: 16 }} />
                ) : (
                  matches.map(recipe => (
                    <TouchableOpacity key={recipe._id} style={s.matchCard} activeOpacity={0.85} onPress={() => goToMeal(recipe)}>
                      <View style={s.matchImageWrap}>
                        <Image source={{ uri: recipe.image_url }} style={s.matchImage} resizeMode="cover" />
                        <View style={s.matchTimeBadge}><Text style={s.matchTimeBadgeText}>{recipe.cook_time_min} phút</Text></View>
                      </View>
                      <View style={s.matchInfo}>
                        <Text style={s.matchRecipeTitle} numberOfLines={1}>{recipe.title}</Text>
                        <View style={s.matchDots}>
                          {Array.from({ length: Math.min(recipe.matched_ingredients, 4) }).map((_, i) => (
                            <View key={i} style={s.dotGreen}><Text style={s.dotText}>✓</Text></View>
                          ))}
                          {recipe.missing_ingredients > 0 && <View style={s.dotGray}><Text style={s.dotText}>+</Text></View>}
                        </View>
                        <Text style={recipe.missing_ingredients === 0 ? s.statusGreen : s.statusRed}>
                          {recipe.missing_ingredients === 0 ? '✓ Đủ nguyên liệu' : `Thiếu ${recipe.missing_ingredients} nguyên liệu`}
                        </Text>
                      </View>
                      <View style={s.matchAction}>
                        <TouchableOpacity style={s.viewBtn} onPress={() => goToMeal(recipe)}>
                          <Text style={s.viewBtnText}>Xem ngay</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {fridge.length === 0 && (
              <View style={s.emptyBox}>
                <Text style={s.emptyEmoji}>🥬</Text>
                <Text style={s.emptyTitle}>Tủ lạnh trống</Text>
                <Text style={s.emptySub}>Thêm nguyên liệu để MealCraft gợi ý món phù hợp!</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.inputRow}>
          <TextInput style={s.input} placeholder="Thêm nguyên liệu (vd: cà chua, trứng...)" value={input} onChangeText={setInput} onSubmitEditing={() => addIngredient(input)} returnKeyType="done" placeholderTextColor="#9ca3af" />
          <TouchableOpacity style={[s.addBtn, (!input.trim() || adding) && s.addBtnDisabled]} onPress={() => addIngredient(input)} disabled={!input.trim() || adding}>
            {adding ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.addBtnText}>+</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const GREEN = '#16a34a';
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { paddingBottom: 24 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  clearBtn: { fontSize: 14, color: '#ef4444', fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  fridgeChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#bbf7d0' },
  fridgeChipText: { fontSize: 13, color: GREEN, fontWeight: '600' },
  fridgeChipX: { fontSize: 12, color: '#ef4444', fontWeight: '700' },
  section: { padding: 16 },
  sectionLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  popularRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  popularBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff' },
  popularBtnDisabled: { opacity: 0.4 },
  popularBtnText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  matchTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  refreshText: { fontSize: 13, color: GREEN, fontWeight: '600' },
  matchCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  matchImageWrap: { position: 'relative' },
  matchImage: { width: 90, height: 90 },
  matchTimeBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  matchTimeBadgeText: { fontSize: 10, fontWeight: '700', color: '#111' },
  matchInfo: { flex: 1, padding: 10, justifyContent: 'center' },
  matchRecipeTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 6 },
  matchDots: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  dotGreen: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  dotGray: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  dotText: { fontSize: 9, fontWeight: '700', color: '#374151' },
  statusGreen: { fontSize: 11, color: GREEN, fontWeight: '600' },
  statusRed: { fontSize: 11, color: '#ef4444', fontWeight: '600' },
  matchAction: { justifyContent: 'center', paddingRight: 10 },
  viewBtn: { backgroundColor: GREEN, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  viewBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  inputRow: { flexDirection: 'row', gap: 10, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  input: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#111827' },
  addBtn: { width: 46, height: 46, borderRadius: 12, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  addBtnDisabled: { opacity: 0.5 },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: '300', lineHeight: 28 },
});
