import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth, db, VERCEL_BASE } from "@/config/firebase";
import { useColors } from "@/hooks/useColors";

interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  grade: number;
  vercelPath?: string;
}

const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

const FALLBACK: Topic[] = [
  { id: "t1", title: "Introducción a la Doctrina", description: "Fundamentos del pensamiento trincadista", category: "Doctrina", grade: 1 },
  { id: "t2", title: "El Ser Humano Integral", description: "Cuerpo, mente y espíritu en armonía", category: "Filosofía", grade: 2 },
  { id: "t3", title: "La Ética Universal", description: "Principios morales de la fraternidad", category: "Ética", grade: 3 },
  { id: "t4", title: "Historia de la Humanidad", description: "Evolución espiritual a través de los siglos", category: "Historia", grade: 4 },
  { id: "t5", title: "Metafísica Práctica", description: "Comprensión del universo y sus leyes", category: "Metafísica", grade: 5 },
];

export default function GradoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;

  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [unlockedGrades, setUnlockedGrades] = useState<number[]>([1]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user's unlocked grades from Firestore (same data Vercel uses)
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        const data = snap.data();
        const grades: number[] = data?.unlockedGrades ?? [1];
        setUnlockedGrades(grades);
        if (!grades.includes(selectedGrade)) {
          setSelectedGrade(grades[0] ?? 1);
        }
      },
      () => setUnlockedGrades([1])
    );
    return unsub;
  }, [user?.uid]);

  // Load topics for selected grade
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "topics"),
      where("grade", "==", selectedGrade),
      orderBy("order", "asc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Topic));
        setTopics(data.length > 0 ? data : FALLBACK.filter((t) => t.grade === selectedGrade));
        setLoading(false);
      },
      () => {
        setTopics(FALLBACK.filter((t) => t.grade === selectedGrade));
        setLoading(false);
      }
    );
    return unsub;
  }, [selectedGrade]);

  const openTopic = async (topic: Topic) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const path = topic.vercelPath ?? `/grado/${topic.grade}/tema/${topic.id}`;
    await WebBrowser.openBrowserAsync(`${VERCEL_BASE}${path}`, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 22, fontWeight: "700" as const, color: colors.foreground },
    headerSub: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
    gradeScroll: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
    pill: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    pillLocked: { opacity: 0.35 },
    pillText: { fontSize: 15, fontWeight: "600" as const, color: colors.mutedForeground },
    pillTextActive: { color: colors.primaryForeground },
    list: { flex: 1 },
    listContent: { padding: 16, gap: 12, paddingBottom: botPad + 90 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    iconCircle: {
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: colors.secondary,
      alignItems: "center", justifyContent: "center",
    },
    cardContent: { flex: 1 },
    badge: { fontSize: 11, color: colors.primary, fontWeight: "600" as const, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 },
    cardTitle: { fontSize: 16, fontWeight: "600" as const, color: colors.foreground },
    cardDesc: { fontSize: 13, color: colors.mutedForeground, marginTop: 3 },
    lockedWrap: {
      flex: 1, alignItems: "center", justifyContent: "center",
      gap: 10, paddingHorizontal: 40,
    },
    lockedTitle: { fontSize: 18, fontWeight: "700" as const, color: colors.foreground },
    lockedText: { fontSize: 14, color: colors.mutedForeground, textAlign: "center", lineHeight: 22 },
    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  });

  const isLocked = !unlockedGrades.includes(selectedGrade);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Estudio por Grado</Text>
        <Text style={s.headerSub}>Grados desbloqueados desde Vercel</Text>
      </View>

      <FlatList
        horizontal
        data={GRADES}
        keyExtractor={(g) => String(g)}
        contentContainerStyle={s.gradeScroll}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item: g }) => {
          const active = selectedGrade === g;
          const locked = !unlockedGrades.includes(g);
          return (
            <TouchableOpacity
              style={[s.pill, active && s.pillActive, locked && s.pillLocked]}
              onPress={() => { setSelectedGrade(g); Haptics.selectionAsync(); }}
              activeOpacity={0.7}
            >
              <Text style={[s.pillText, active && s.pillTextActive]}>{g}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {isLocked ? (
        <View style={s.lockedWrap}>
          <Feather name="lock" size={44} color={colors.mutedForeground} />
          <Text style={s.lockedTitle}>Grado {selectedGrade} bloqueado</Text>
          <Text style={s.lockedText}>
            Completa los requisitos en la plataforma web para desbloquear este grado.{"\n\n"}
            <Text style={{ color: colors.primary }}>maestro-trincado-jet.vercel.app</Text>
          </Text>
        </View>
      ) : loading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          style={s.list}
          data={topics}
          keyExtractor={(t) => t.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: topic }) => (
            <TouchableOpacity style={s.card} activeOpacity={0.75} onPress={() => openTopic(topic)}>
              <View style={s.iconCircle}>
                <Feather name="book" size={22} color={colors.primary} />
              </View>
              <View style={s.cardContent}>
                <Text style={s.badge}>{topic.category}</Text>
                <Text style={s.cardTitle}>{topic.title}</Text>
                <Text style={s.cardDesc}>{topic.description}</Text>
              </View>
              <Feather name="external-link" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
