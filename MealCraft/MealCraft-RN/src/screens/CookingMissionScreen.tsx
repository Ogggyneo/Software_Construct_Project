import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

interface Step { order: number; description: string }
interface Recipe {
  _id: string; title: string; steps: Step[];
  cook_time_min: number; calories_per_serving: number;
}

type Params = { CookingMission: { recipe: Recipe } };

export function CookingMissionScreen() {
  const route = useRoute<RouteProp<Params, 'CookingMission'>>();
  const navigation = useNavigation<any>();
  const { recipe } = route.params;

  const steps = recipe.steps ?? [];
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);

  const progress = steps.length ? Math.round((done.size / steps.length) * 100) : 0;

  const completeStep = () => {
    const next = new Set(done).add(current);
    setDone(next);
    if (current < steps.length - 1) {
      setCurrent(current + 1);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.center}>
          <Text style={s.trophyEmoji}>🏆</Text>
          <Text style={s.finishTitle}>Hoàn thành!</Text>
          <Text style={s.finishSub}>Bạn đã nấu xong {recipe.title} thành công 🎉</Text>
          <TouchableOpacity style={s.doneBtn} onPress={() => navigation.popToTop()}>
            <Text style={s.doneBtnText}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!steps.length) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.center}>
          <Text style={s.finishSub}>Công thức này chưa có hướng dẫn.</Text>
          <TouchableOpacity style={s.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={s.doneBtnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const step = steps[current];

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle} numberOfLines={1}>{recipe.title}</Text>
          <Text style={s.headerSub}>Bước {current + 1} / {steps.length}</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* Progress bar */}
      <View style={s.progressBg}>
        <View style={[s.progressFill, { width: `${progress}%` as any }]} />
      </View>

      {/* Step dots */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dotRow}>
        {steps.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => setCurrent(i)}>
            <View style={[s.stepDot, i === current && s.stepDotActive, done.has(i) && s.stepDotDone]}>
              <Text style={[s.stepDotText, (i === current || done.has(i)) && s.stepDotTextActive]}>
                {done.has(i) ? '✓' : i + 1}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Current step card */}
      <View style={s.stepCard}>
        <View style={s.stepBadge}>
          <Text style={s.stepBadgeText}>Bước {current + 1}</Text>
        </View>
        <Text style={s.stepText}>{step.description}</Text>
        {step.order > 0 && (
          <View style={s.timeBadge}>
            <Text style={s.timeBadgeText}>⏱ ~{Math.ceil(recipe.cook_time_min / steps.length)} phút</Text>
          </View>
        )}
      </View>

      {/* Nav buttons */}
      <View style={s.navRow}>
        <TouchableOpacity
          style={[s.navBtn, current === 0 && s.navBtnDisabled]}
          onPress={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
        >
          <Text style={s.navBtnText}>‹ Trước</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.completeBtn} onPress={completeStep}>
          <Text style={s.completeBtnText}>
            {current === steps.length - 1 ? '🏁 Hoàn thành' : 'Xong ✓'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const GREEN = '#16a34a';
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  trophyEmoji: { fontSize: 64, marginBottom: 16 },
  finishTitle: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8 },
  finishSub: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 28 },
  doneBtn: { backgroundColor: GREEN, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 24, color: '#111', lineHeight: 30 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  headerSub: { fontSize: 12, color: '#9ca3af' },
  progressBg: { height: 4, backgroundColor: '#e5e7eb' },
  progressFill: { height: 4, backgroundColor: GREEN },
  dotRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  stepDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: GREEN },
  stepDotDone: { backgroundColor: '#bbf7d0' },
  stepDotText: { fontSize: 13, fontWeight: '700', color: '#9ca3af' },
  stepDotTextActive: { color: '#fff' },
  stepCard: { flex: 1, margin: 16, backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  stepBadge: { alignSelf: 'flex-start', backgroundColor: '#dcfce7', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 16 },
  stepBadgeText: { fontSize: 13, fontWeight: '700', color: GREEN },
  stepText: { fontSize: 16, color: '#374151', lineHeight: 26, flex: 1 },
  timeBadge: { marginTop: 16, alignSelf: 'flex-start', backgroundColor: '#fef3c7', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  timeBadgeText: { fontSize: 13, color: '#92400e', fontWeight: '600' },
  navRow: { flexDirection: 'row', gap: 12, padding: 16 },
  navBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#f3f4f6', alignItems: 'center' },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontWeight: '700', color: '#374151', fontSize: 15 },
  completeBtn: { flex: 2, paddingVertical: 14, borderRadius: 14, backgroundColor: GREEN, alignItems: 'center' },
  completeBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
