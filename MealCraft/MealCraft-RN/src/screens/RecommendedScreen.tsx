import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFetch } from '../api';
import { useAuth } from '../contexts/AuthContext';

interface Recipe {
  _id: string;
  title: string;
  category: string;
  cuisine?: string;
  image_url: string;
  cook_time_min: number;
  calories_per_serving: number;
  tags: string[];
}

function diversify2(list: Recipe[]): Recipe[] {
  const buckets = new Map<string, Recipe[]>();
  for (const r of list) {
    const k = r.category || 'other';
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k)!.push(r);
  }
  const result: Recipe[] = [];
  for (let i = 0; i < 2; i++) {
    for (const bucket of buckets.values()) {
      if (bucket[i]) result.push(bucket[i]);
    }
  }
  return result;
}

export function RecommendedScreen() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<{ recipes: Recipe[] }>('/api/recipes/recommended', token)
      .then(d => setRecipes(diversify2(d.recipes ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>‹ Quay lại</Text>
        </TouchableOpacity>
        <Text style={s.title}>Gợi ý cho bạn</Text>
        <Text style={s.sub}>Dựa trên sở thích và hồ sơ của bạn</Text>
      </View>

      {recipes.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>🍽️</Text>
          <Text style={s.emptyTitle}>Chưa có gợi ý cá nhân hoá</Text>
          <Text style={s.emptySub}>Cập nhật sở thích trong hồ sơ để nhận gợi ý phù hợp hơn.</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={s.row}
          contentContainerStyle={s.list}
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
              <Image source={{ uri: item.image_url }} style={s.image} resizeMode="cover" />
              {item.category ? (
                <View style={s.badge}>
                  <Text style={s.badgeText} numberOfLines={1}>{item.category}</Text>
                </View>
              ) : null}
              <View style={s.body}>
                <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
                <View style={s.meta}>
                  <Text style={s.metaText}>⏱ {item.cook_time_min || '--'} phút</Text>
                  <Text style={s.metaText}>🔥 {item.calories_per_serving || '--'} kcal</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const GREEN = '#16a34a';

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: '#111827', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  backBtn: { marginBottom: 8 },
  backText: { color: '#9ca3af', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  sub: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  list: { padding: 12 },
  row: { justifyContent: 'space-between' },
  card: {
    width: '48.5%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  image: { width: '100%', height: 130 },
  badge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(22,163,74,0.9)', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2, maxWidth: 100,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  body: { padding: 10, minHeight: 72 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 6, lineHeight: 18 },
  meta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  metaText: { fontSize: 11, color: '#6b7280' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
});
