import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { apiFetch } from '../api';
import { useAuth } from '../contexts/AuthContext';

type Params = {
  MealDetail: {
    recipeId: string;
    title: string;
    image_url: string;
    cook_time_min: number;
    calories_per_serving: number;
    category: string;
    tags: string[];
    badge?: string;
  };
};

interface FullRecipe {
  _id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  cook_time_min: number;
  prep_time_min: number;
  calories_per_serving: number;
  servings: number;
  tags: string[];
  ingredients: { name: string; quantity: string; unit: string }[];
  steps: { order: number; description: string }[];
}

export function MealDetailScreen() {
  const route = useRoute<RouteProp<Params, 'MealDetail'>>();
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const params = route.params;

  const [recipe, setRecipe] = useState<FullRecipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<FullRecipe>(`/api/recipes/${params.recipeId}`, token)
      .then(setRecipe)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.recipeId, token]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  const badge = params.tags?.[0] ?? params.category;

  return (
    <SafeAreaView style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={s.hero}>
          <Image source={{ uri: params.image_url }} style={s.heroImage} resizeMode="cover" />
          <View style={s.heroOverlay} />

          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backBtnText}>‹</Text>
          </TouchableOpacity>

          {badge ? (
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>{badge}</Text>
            </View>
          ) : null}

          <View style={s.heroBottom}>
            <Text style={s.heroTitle}>{params.title}</Text>
            {recipe?.description ? (
              <Text style={s.heroDesc}>{recipe.description}</Text>
            ) : null}
          </View>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={s.stat}>
            <Text style={s.statIcon}>⏱</Text>
            <Text style={s.statLabel}>Thời gian</Text>
            <Text style={s.statValue}>{params.cook_time_min} phút</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.stat}>
            <Text style={s.statIcon}>🔥</Text>
            <Text style={s.statLabel}>Calories</Text>
            <Text style={s.statValue}>{params.calories_per_serving} kcal</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.stat}>
            <Text style={s.statIcon}>👥</Text>
            <Text style={s.statLabel}>Khẩu phần</Text>
            <Text style={s.statValue}>{recipe?.servings ?? 2} người</Text>
          </View>
        </View>

        <View style={s.body}>
          {/* Ingredients */}
          {recipe?.ingredients?.length ? (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Nguyên liệu</Text>
              <View style={s.ingredientBox}>
                {recipe.ingredients.map((ing, i) => (
                  <View key={i} style={s.ingredientRow}>
                    <View style={s.dot} />
                    <Text style={s.ingredientText}>
                      {[ing.quantity, ing.unit, ing.name].filter(Boolean).join(' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Steps */}
          {recipe?.steps?.length ? (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Các bước thực hiện</Text>
              {recipe.steps.map((step, i) => (
                <View key={i} style={s.stepCard}>
                  <View style={s.stepNum}>
                    <Text style={s.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={s.stepText}>{step.description}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Bắt đầu nấu CTA */}
      {recipe ? (
        <View style={s.ctaBar}>
          <TouchableOpacity
            style={s.ctaBtn}
            onPress={() => navigation.navigate('CookingMission', { recipe })}
          >
            <Text style={s.ctaBtnText}>▶  Bắt đầu nấu</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const GREEN = '#16a34a';
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { height: 280, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  backBtn: { position: 'absolute', top: 16, left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 24, color: '#111', lineHeight: 30 },
  heroBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  heroBadgeText: { fontSize: 12, fontWeight: '700', color: '#111' },
  heroBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statIcon: { fontSize: 20 },
  statLabel: { fontSize: 11, color: '#9ca3af' },
  statValue: { fontSize: 13, fontWeight: '700', color: '#111827' },
  statDivider: { width: 1, backgroundColor: '#e5e7eb', marginVertical: 4 },
  body: { padding: 16, paddingBottom: 100 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 12 },
  ingredientBox: { backgroundColor: '#f9fafb', borderRadius: 16, padding: 14, gap: 10 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN },
  ingredientText: { fontSize: 14, color: '#374151', flex: 1 },
  stepCard: { flexDirection: 'row', gap: 14, backgroundColor: '#f9fafb', borderRadius: 16, padding: 14, marginBottom: 10 },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  stepText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 22 },
  ctaBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  ctaBtn: { backgroundColor: GREEN, borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  ctaBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
