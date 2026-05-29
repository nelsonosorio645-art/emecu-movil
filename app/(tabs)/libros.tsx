import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
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
import { db, VERCEL_BASE } from "@/config/firebase";
import { useColors } from "@/hooks/useColors";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  downloadUrl?: string;
  vercelDownloadPath?: string;
  category: string;
  pages?: number;
  fileSize?: string;
}

const FALLBACK_BOOKS: Book[] = [
  {
    id: "b1",
    title: "Ciencia y Filosofía",
    author: "Maestro Joaquín Trincado",
    description: "Fundamentos filosóficos de la Magna Fraternidad Universal",
    vercelDownloadPath: "/descargas/ciencia-filosofia",
    category: "Doctrina",
    pages: 320,
    fileSize: "4.2 MB",
  },
  {
    id: "b2",
    title: "El Libro del Ser",
    author: "Maestro Joaquín Trincado",
    description: "La naturaleza del ser humano y su destino espiritual",
    vercelDownloadPath: "/descargas/libro-del-ser",
    category: "Espiritualidad",
    pages: 248,
    fileSize: "3.1 MB",
  },
  {
    id: "b3",
    title: "Tratado de Ética Universal",
    author: "Maestro Joaquín Trincado",
    description: "Principios éticos para la convivencia armoniosa",
    vercelDownloadPath: "/descargas/etica-universal",
    category: "Ética",
    pages: 196,
    fileSize: "2.5 MB",
  },
  {
    id: "b4",
    title: "Metafísica Práctica",
    author: "Maestro Joaquín Trincado",
    description: "Las leyes del universo aplicadas a la vida cotidiana",
    vercelDownloadPath: "/descargas/metafisica-practica",
    category: "Metafísica",
    pages: 280,
    fileSize: "3.8 MB",
  },
];

export default function LibrosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [opening, setOpening] = useState<string | null>(null);

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

  const downloadBook = async (book: Book) => {
    setOpening(book.id);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Use Firebase Storage URL if available, else Vercel download path
    const url =
      book.downloadUrl ??
      `${VERCEL_BASE}${book.vercelDownloadPath ?? `/descargas/${book.id}`}`;
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
    setOpening(null);
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
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 22, fontWeight: "700" as const, color: colors.foreground },
    headerSub: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
    list: { flex: 1 },
    listContent: { padding: 16, gap: 14, paddingBottom: botPad + 90 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTop: { flexDirection: "row", gap: 14 },
    bookCover: {
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
    cardFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 14,
    },
    meta: { fontSize: 12, color: colors.mutedForeground, gap: 8 },
    metaRow: { flexDirection: "row", gap: 12 },
    downloadBtn: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 9,
      gap: 6,
    },
    downloadText: { fontSize: 13, fontWeight: "600" as const },
    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  });

  if (loading) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Biblioteca</Text>
        <Text style={s.headerSub}>Obras del Maestro Joaquín Trincado</Text>
      </View>

      <FlatList
        style={s.list}
        data={books}
        keyExtractor={(b) => b.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: book }) => {
          const catColor = CATEGORY_COLORS[book.category] ?? colors.primary;
          return (
            <View style={s.card}>
              <View style={s.cardTop}>
                <View style={s.bookCover}>
                  <Feather name="book-open" size={26} color={catColor} />
                </View>
                <View style={s.cardMeta}>
                  <Text style={[s.badge, { color: catColor }]}>{book.category}</Text>
                  <Text style={s.cardTitle}>{book.title}</Text>
                  <Text style={s.cardAuthor}>{book.author}</Text>
                </View>
              </View>
              <Text style={s.cardDesc}>{book.description}</Text>
              <View style={s.cardFooter}>
                <View style={s.metaRow}>
                  {book.pages && (
                    <Text style={s.meta}>{book.pages} págs.</Text>
                  )}
                  {book.fileSize && (
                    <Text style={s.meta}>{book.fileSize}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[s.downloadBtn, { backgroundColor: catColor }]}
                  onPress={() => downloadBook(book)}
                  activeOpacity={0.8}
                  disabled={opening === book.id}
                >
                  {opening === book.id ? (
                    <ActivityIndicator size="small" color="#020617" />
                  ) : (
                    <>
                      <Feather name="download" size={14} color="#020617" />
                      <Text style={[s.downloadText, { color: "#020617" }]}>Descargar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
