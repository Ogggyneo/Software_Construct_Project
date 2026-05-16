import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, RefreshControl, SafeAreaView, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFetch } from '../api';
import { useAuth } from '../contexts/AuthContext';

interface Recipe {
  _id: string;
  title: string;
  category: string;
  image_url: string;
  cook_time_min: number;
  calories_per_serving: number;
  tags: string[];
}

const CATEGORIES = ['Tất cả', 'Vietnamese', 'Italian', 'Asian', 'Healthy', 'Street Food', 'Japanese', 'Korean', 'Chinese', 'Mexican'];

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { token, userName } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tất cả');

  const fetchRecipes = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<{ recipes: Recipe[] }>('/api/recipes', token);
      setRecipes(data.recipes ?? []);
    } catch {
      // keep empty on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const filtered = recipes.filter(r => {
    const matchCat = category === 'Tất cả' || r.category === category;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={s.loadingText}>Đang tải công thức...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Xin chào, {userName} 👋</Text>
          <Text style={s.subtitle}>Hôm nay bạn muốn nấu gì?</Text>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchRow}>
        <TextInput
          style={s.search}
          placeholder="🔍  Tìm công thức..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chips}
      >
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c}
            style={[s.chip, category === c && s.chipActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[s.chipText, category === c && s.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recipe grid */}
      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        numColumns={2}
        columnWrapperStyle={s.row}
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRecipes(); }} tintColor="#16a34a" />
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🍽️</Text>
            <Text style={s.emptyText}>Không tìm thấy công thức nào</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('MealDetail', {
              recipeId: item._id,
              title: item.title,
              image_url: item.image_url,
              cook_time_min: item.cook_time_min,
              calories_per_serving: item.calories_per_serving,
              category: item.category,
              tags: item.tags,
            })}
          >
            <Image
              source={{ uri: item.image_url }}
              style={s.cardImage}
              resizeMode="cover"
            />
            {item.tags?.[0] && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{item.tags[0]}</Text>
              </View>
            )}
            <View style={s.cardBody}>
              <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
              <View style={s.cardMeta}>
                <Text style={s.metaText}>⏱ {item.cook_time_min} phút</Text>
                <Text style={s.metaText}>🔥 {item.calories_per_serving} kcal</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const GREEN = '#16a34a';

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#6b7280', fontSize: 14 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: '#fff' },
  greeting: { fontSize: 20, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  searchRow: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff' },
  search: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827' },
  chips: { paddingHorizontal: 12, paddingVertical: 8, gap: 8, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center' },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', alignSelf: 'flex-start' },
  chipActive: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: { width: '48.5%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardImage: { width: '100%', height: 130 },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(22,163,74,0.9)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  cardBody: { padding: 10 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 6, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  metaText: { fontSize: 11, color: '#6b7280' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#9ca3af' },
});
