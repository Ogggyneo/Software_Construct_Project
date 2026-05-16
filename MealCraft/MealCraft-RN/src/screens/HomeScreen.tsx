import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
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
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const goToRecipe = (item: Recipe) => {
    navigation.navigate('MealDetail', {
      recipeId: item._id,
      title: item.title,
      image_url: item.image_url,
      cook_time_min: item.cook_time_min,
      calories_per_serving: item.calories_per_serving,
      category: item.category,
      tags: item.tags,
    });
  };

  const featured = recipes.slice(0, 6);
  const filtered = recipes.filter(r => {
    const matchCat = category === 'Tất cả' || r.category === category;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const initials = (userName || '?').charAt(0).toUpperCase();

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchRecipes(); }}
            tintColor="#16a34a"
          />
        }
      >
        {/* Dark Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.logoBox}>
              <Text style={{ fontSize: 16, color: '#fff' }}>⚡</Text>
            </View>
            <View>
              <Text style={s.greeting}>Xin chào, {userName} 👋</Text>
              <Text style={s.subtitle}>
                Bạn muốn ăn gì <Text style={s.subtitleGreen}>hôm nay</Text>?
              </Text>
            </View>
          </View>
          <View style={s.headerRight}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
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

        {/* Gợi ý cho bạn */}
        {featured.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Gợi ý cho bạn</Text>
              <TouchableOpacity><Text style={s.seeMore}>Xem thêm ›</Text></TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.featuredRow}
            >
              {featured.map(item => (
                <TouchableOpacity
                  key={item._id}
                  style={s.featuredCard}
                  activeOpacity={0.85}
                  onPress={() => goToRecipe(item)}
                >
                  <Image source={{ uri: item.image_url }} style={s.featuredImage} resizeMode="cover" />
                  <View style={s.featuredOverlay}>
                    {item.tags?.[0] && (
                      <View style={s.featuredTag}>
                        <Text style={s.featuredTagText}>{item.tags[0]}</Text>
                      </View>
                    )}
                    <Text style={s.featuredTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={s.featuredMeta}>⏱ {item.cook_time_min} phút  🔥 {item.calories_per_serving} kcal</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Khám phá món ăn */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Khám phá món ăn</Text>

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
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🍽️</Text>
              <Text style={s.emptyText}>Không tìm thấy công thức nào</Text>
            </View>
          ) : (
            <View style={s.grid}>
              {filtered.map(item => (
                <TouchableOpacity
                  key={item._id}
                  style={s.card}
                  activeOpacity={0.85}
                  onPress={() => goToRecipe(item)}
                >
                  <Image source={{ uri: item.image_url }} style={s.cardImage} resizeMode="cover" />
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
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const GREEN = '#16a34a';

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#6b7280', fontSize: 14 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16,
    backgroundColor: '#111827',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  logoBox: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: '#374151',
    alignItems: 'center', justifyContent: 'center',
  },
  greeting: { fontSize: 12, color: '#9ca3af' },
  subtitle: { fontSize: 15, fontWeight: '800', color: '#fff', marginTop: 2 },
  subtitleGreen: { color: GREEN },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: GREEN,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  searchRow: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff' },
  search: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827' },

  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 12 },
  seeMore: { fontSize: 13, color: GREEN, fontWeight: '600' },

  featuredRow: { gap: 12, paddingRight: 4 },
  featuredCard: { width: 220, height: 160, borderRadius: 18, overflow: 'hidden' },
  featuredImage: { width: '100%', height: '100%' },
  featuredOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.52)',
    borderBottomLeftRadius: 18, borderBottomRightRadius: 18,
  },
  featuredTag: {
    alignSelf: 'flex-start', backgroundColor: GREEN, borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2, marginBottom: 5,
  },
  featuredTagText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  featuredTitle: { fontSize: 13, fontWeight: '700', color: '#fff', marginBottom: 3 },
  featuredMeta: { fontSize: 10, color: 'rgba(255,255,255,0.85)' },

  chips: { gap: 8, paddingVertical: 8, paddingRight: 4, flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', alignSelf: 'flex-start' },
  chipActive: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  chipTextActive: { color: '#fff' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48.5%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardImage: { width: '100%', height: 130 },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(22,163,74,0.9)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  cardBody: { padding: 10 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 6, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  metaText: { fontSize: 11, color: '#6b7280' },

  empty: { alignItems: 'center', marginTop: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#9ca3af' },
});
