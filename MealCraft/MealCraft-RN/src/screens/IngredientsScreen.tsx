import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFetch } from '../api';
import { useAuth } from '../contexts/AuthContext';

interface FridgeItem {
  _id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface MatchedRecipe {
  _id: string;
  title: string;
  category: string;
  image_url: string;
  cook_time_min: number;
  calories_per_serving: number;
  tags: string[];
  match_count: number;
}

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
    } catch {
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchMatches = useCallback(async () => {
    if (!token) return;
    setMatchLoading(true);
    try {
      const data = await apiFetch<{ recipes: MatchedRecipe[] }>('/api/recipes/matching', token);
      setMatches(data.recipes ?? []);
    } catch {
    } finally {
      setMatchLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchFridge(); }, [fetchFridge]);
  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const addIngredient = async () => {
    const name = input.trim();
    if (!name || !token) return;
    setAdding(true);
    try {
      await apiFetch('/api/fridge', token, {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      setInput('');
      await fetchFridge();
      await fetchMatches();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thêm được nguyên liệu');
    } finally {
      setAdding(false);
    }
  };

  const removeItem = async (id: string) => {
    if (!token) return;
    try {
      await apiFetch(`/api/fridge/${id}`, token, { method: 'DELETE' });
      setFridge(prev => prev.filter(f => f._id !== id));
      await fetchMatches();
    } catch {
      Alert.alert('Lỗi', 'Không xoá được nguyên liệu');
    }
  };

  const clearAll = () => {
    Alert.alert('Xoá tủ lạnh', 'Xoá hết nguyên liệu?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá hết', style: 'destructive', onPress: async () => {
          if (!token) return;
          try {
            await apiFetch('/api/fridge/clear', token, { method: 'DELETE' });
            setFridge([]);
            setMatches([]);
          } catch {
            Alert.alert('Lỗi', 'Không xoá được');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>🧊 Tủ lạnh của tôi</Text>
        {fridge.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={s.clearBtn}>Xoá hết</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color="#16a34a" />
          </View>
        ) : fridge.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyEmoji}>🥬</Text>
            <Text style={s.emptyTitle}>Tủ lạnh trống</Text>
            <Text style={s.emptySub}>Thêm nguyên liệu bên dưới để MealCraft gợi ý món phù hợp!</Text>
          </View>
        ) : (
          <View style={s.fridgeList}>
            {fridge.map(item => (
              <View key={item._id} style={s.item}>
                <View style={s.itemIcon}>
                  <Text style={s.itemIconText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={s.itemName}>{item.name}</Text>
                <TouchableOpacity onPress={() => removeItem(item._id)} style={s.removeBtn}>
                  <Text style={s.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Recipe matching section */}
        {fridge.length > 0 && (
          <View style={s.matchSection}>
            <View style={s.matchHeader}>
              <Text style={s.matchTitle}>🍽️ Công thức phù hợp</Text>
              <TouchableOpacity onPress={fetchMatches}>
                <Text style={s.refreshText}>Làm mới</Text>
              </TouchableOpacity>
            </View>

            {matchLoading ? (
              <ActivityIndicator color="#16a34a" style={{ marginTop: 16 }} />
            ) : matches.length === 0 ? (
              <Text style={s.noMatch}>Chưa có công thức phù hợp với nguyên liệu hiện tại.</Text>
            ) : (
              matches.map(recipe => (
                <TouchableOpacity
                  key={recipe._id}
                  style={s.matchCard}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('Home', {
                    screen: 'MealDetail',
                    params: {
                      recipeId: recipe._id,
                      title: recipe.title,
                      image_url: recipe.image_url,
                      cook_time_min: recipe.cook_time_min,
                      calories_per_serving: recipe.calories_per_serving,
                      category: recipe.category,
                      tags: recipe.tags,
                    },
                  })}
                >
                  <View style={s.matchInfo}>
                    <Text style={s.matchRecipeTitle} numberOfLines={1}>{recipe.title}</Text>
                    <Text style={s.matchMeta}>⏱ {recipe.cook_time_min} phút · 🔥 {recipe.calories_per_serving} kcal</Text>
                  </View>
                  <View style={s.matchBadge}>
                    <Text style={s.matchBadgeText}>{recipe.match_count} NL</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Add ingredient input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            placeholder="Thêm nguyên liệu (vd: cà chua, trứng...)"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={addIngredient}
            returnKeyType="done"
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            style={[s.addBtn, (!input.trim() || adding) && s.addBtnDisabled]}
            onPress={addIngredient}
            disabled={!input.trim() || adding}
          >
            {adding
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={s.addBtnText}>+</Text>
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
  scroll: { paddingBottom: 24 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  clearBtn: { fontSize: 14, color: '#ef4444', fontWeight: '600' },
  emptyBox: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  fridgeList: { padding: 16, gap: 10 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 12, gap: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  itemIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  itemIconText: { fontSize: 14, fontWeight: '700', color: GREEN },
  itemName: { flex: 1, fontSize: 15, color: '#111827', fontWeight: '500' },
  removeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: '#ef4444', fontSize: 12, fontWeight: '700' },
  matchSection: { marginHorizontal: 16, marginTop: 8 },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  matchTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  refreshText: { fontSize: 13, color: GREEN, fontWeight: '600' },
  noMatch: { fontSize: 13, color: '#9ca3af', textAlign: 'center', paddingVertical: 16 },
  matchCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1, gap: 12 },
  matchInfo: { flex: 1 },
  matchRecipeTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  matchMeta: { fontSize: 12, color: '#6b7280' },
  matchBadge: { backgroundColor: '#dcfce7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  matchBadgeText: { color: GREEN, fontSize: 12, fontWeight: '700' },
  inputRow: { flexDirection: 'row', gap: 10, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  input: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#111827' },
  addBtn: { width: 46, height: 46, borderRadius: 12, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  addBtnDisabled: { opacity: 0.5 },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: '300', lineHeight: 28 },
});
