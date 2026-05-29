import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { db, VERCEL_BASE } from "@/config/firebase";
import { useColors } from "@/hooks/useColors";

interface Chapter {
  id: string;
  title: string;
  order: number;
  vercelPath?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  vercelPath?: string;
  chapters?: Chapter[];
  chaptersCount?: number;
}

const FALLBACK_BOOKS: Book[] = [
  {
    id: "b1",
    title: "Ciencia y Filosofía",
    author: "Maestro Joaquín Trincado",
    description: "Fundamentos filosóficos de la Magna Fraternidad Universal",
    category: "Doctrina",
    vercelPath: "/libros/ciencia-filosofia",
    chapters: [
      { id: "c1", title: "Prefacio", order: 1 },
      { id: "c2", title: "El Conocimiento Universal", order: 2 },
      { id: "c3", title: "Ciencia y Espiritualidad", order: 3 },
      { id: "c4", title: "Conclusiones", order: 4 },
    ],
  },
  {
    id: "b2",
    title: "El Libro del Ser",
    author: "Maestro Joaquín Trincado",
    description: "La naturaleza del ser humano y su destino espiritual",
    category: "Espiritualidad",
    vercelPath: "/libros/libro-del-ser",
    chapters: [
      { id: "c1", title: "El Ser y su Origen", order: 1 },
      { id: "c2", title: "El Alma y su Evolución", order: 2 },
      { id: "c3", title: "La Conciencia Universal", order: 3 },
    ],
  },
  {
    id: "b3",
    title: "Tratado de Ética Universal",
    author: "Maestro Joaquín Trincado",
    description: "Principios éticos para la convivencia armoniosa",
    category: "Ética",
    vercelPath: "/libros/etica-universal",
    chapters: [
      { id: "c1", title: "Fundamentos Éticos", order: 1 },
      { id: "c2", title: "La Moral Colectiva", order: 2 },
      { id: "c3", title: "Aplicación Práctica", order: 3 },
    ],
  },
  {
    id: "b4",
    title: "Metafísica Práctica",
    author: "Maestro Joaquín Trincado",
    description: "Las leyes del universo aplicadas a la vida cotidiana",
    category: "Metafísica",
    vercelPath: "/libros/metafisica-practica",
    chapters: [
      { id: "c1", title: "Las Leyes Universales", order: 1 },
      { id: "c2", title: "Energía y Materia", order: 2 },
      { id: "c3", title: "El Karma y la Ley", order: 3 },
      { id: "c4", title: "Práctica Diaria", order: 4 },
    ],
  },
];

export default function LibreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    const q = query(collection(db, "books"), orderBy("title", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Book));
        setBooks(data.length > 0 ? data : FALLBACK_BOOKS);
        setLoading(false);
      },
      () => {
        setBooks(FALLBACK_BOOKS);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q)
    );
  }, [books, search]);

  const openChapter = async (book: Book, chapter: Chapter) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const path =
      chapter.vercelPath ??
      book.vercelPath ??
      `/libros/${book.id}`;
    await WebBrowser.openBrowserAsync(`${VERCEL_BASE}${path}`, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
    setSelectedBook(null);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  const CATEGORY_COLORS: Record<string, string> = {
    Doctrina: "#f59e0b",
    Filosofía: "#8b5cf6",
    Ética: "#10b981",
    Historia: "#3b82f6",
    Metafísica: "#ec4899",
    Espiritualidad: "#f97316",
    Ciencia: "#06b6d4",
  };

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
    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      margin: 16,
      marginBottom: 8,
      height: 46,
      gap: 10,
    },
    searchInput: { flex: 1, color: colors.foreground, fontSize: 15 },
    list: { flex: 1 },
    listContent: { padding: 16, gap: 14, paddingBottom: botPad + 90 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardRow: { flexDirection: "row", gap: 14 },
    bookIcon: {
      width: 56, height: 72, borderRadius: 10,
      backgroundColor: colors.secondary,
      alignItems: "center", justifyContent: "center",
      borderWidth: 1, borderColor: colors.border,
    },
    cardMeta: { flex: 1 },
    badge: { fontSize: 11, fontWeight: "600" as const, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 },
    cardTitle: { fontSize: 16, fontWeight: "700" as const, color: colors.foreground, lineHeight: 22 },
    cardAuthor: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
    cardDesc: { fontSize: 13, color: colors.mutedForeground, marginTop: 10, lineHeight: 20 },
    indexBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 9,
      marginTop: 14,
      gap: 6,
      alignSelf: "flex-start",
    },
    indexBtnText: { color: colors.primaryForeground, fontSize: 13, fontWeight: "600" as const },
    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
    // Modal
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: Math.max(botPad + 20, 32),
      maxHeight: "80%",
    },
    sheetHandle: {
      width: 40, height: 4, borderRadius: 2,
      backgroundColor: colors.mutedForeground,
      alignSelf: "center", marginTop: 12, marginBottom: 8,
    },
    sheetHeader: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sheetTitle: { fontSize: 18, fontWeight: "700" as const, color: colors.foreground },
    sheetSub: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
    chapterRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 14,
    },
    chapterNum: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: colors.secondary,
      alignItems: "center", justifyContent: "center",
    },
    chapterNumText: { fontSize: 13, fontWeight: "700" as const, color: colors.primary },
    chapterTitle: { flex: 1, fontSize: 15, color: colors.foreground },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Estudio Libre</Text>
        <Text style={s.headerSub}>Todos los libros de la cátedra</Text>
      </View>

      <View style={s.searchWrap}>
        <Feather name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar libro..."
          placeholderTextColor={colors.mutedForeground}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Feather name="x" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          style={s.list}
          data={filtered}
          keyExtractor={(b) => b.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: book }) => {
            const catColor = CATEGORY_COLORS[book.category] ?? colors.primary;
            return (
              <View style={s.card}>
                <View style={s.cardRow}>
                  <View style={s.bookIcon}>
                    <Feather name="book-open" size={26} color={catColor} />
                  </View>
                  <View style={s.cardMeta}>
                    <Text style={[s.badge, { color: catColor }]}>{book.category}</Text>
                    <Text style={s.cardTitle}>{book.title}</Text>
                    <Text style={s.cardAuthor}>{book.author}</Text>
                  </View>
                </View>
                <Text style={s.cardDesc}>{book.description}</Text>
                <TouchableOpacity
                  style={[s.indexBtn, { backgroundColor: catColor }]}
                  onPress={() => {
                    setSelectedBook(book);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.8}
                >
                  <Feather name="list" size={14} color="#020617" />
                  <Text style={[s.indexBtnText, { color: "#020617" }]}>Ver índice</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {/* Chapter Index Modal */}
      <Modal
        visible={selectedBook !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBook(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedBook(null)}>
          <View style={s.overlay}>
            <TouchableWithoutFeedback>
              <View style={s.sheet}>
                <View style={s.sheetHandle} />
                <View style={s.sheetHeader}>
                  <Text style={s.sheetTitle}>{selectedBook?.title}</Text>
                  <Text style={s.sheetSub}>Selecciona un capítulo para estudiar</Text>
                </View>
                <ScrollView>
                  {(selectedBook?.chapters ?? []).map((ch) => (
                    <TouchableOpacity
                      key={ch.id}
                      style={s.chapterRow}
                      onPress={() => selectedBook && openChapter(selectedBook, ch)}
                      activeOpacity={0.7}
                    >
                      <View style={s.chapterNum}>
                        <Text style={s.chapterNumText}>{ch.order}</Text>
                      </View>
                      <Text style={s.chapterTitle}>{ch.title}</Text>
                      <Feather name="external-link" size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
