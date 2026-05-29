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
    "id": "alfaqui-vademecum",
    "title": "Alfaqui Vademecum",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Alfaqui Vademecum.",
    "vercelDownloadPath": "/biblioteca/Alfaqui-Vademecum.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "buscando-a-dios-joaquin-trincado",
    "title": "Buscando A Dios Joaquin Trincado",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Buscando A Dios Joaquin Trincado.",
    "vercelDownloadPath": "/biblioteca/Buscando-A-Dios-Joaquin-Trincado.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "codigo-de-amor-universal-tomo-2",
    "title": "Codigo De Amor Universal Tomo 2",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Codigo De Amor Universal Tomo 2.",
    "vercelDownloadPath": "/biblioteca/Codigo-De-Amor-Universal-Tomo2-1975.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "codigo-de-amor-universal-tomo-1",
    "title": "Codigo De Amor Universal Tomo 1",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Codigo De Amor Universal Tomo 1.",
    "vercelDownloadPath": "/biblioteca/CodigodeAmorUniversalTomoI-1.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "conocete-a-ti-mismo-1",
    "title": "Conocete A Ti Mismo 1",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Conocete A Ti Mismo 1.",
    "vercelDownloadPath": "/biblioteca/Conocete_a_Ti_Mismo-1.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "cuestionario-espirita-racional",
    "title": "Cuestionario Espirita Racional",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Cuestionario Espirita Racional.",
    "vercelDownloadPath": "/biblioteca/cuestionario espirita racional.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "el-espiritismo-estudiado",
    "title": "El Espiritismo Estudiado",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: El Espiritismo Estudiado.",
    "vercelDownloadPath": "/biblioteca/EL ESPIRITISMO ESTUDIADO.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "el-magnetismo-en-su-origen",
    "title": "El Magnetismo En Su Origen",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: El Magnetismo En Su Origen.",
    "vercelDownloadPath": "/biblioteca/el magnetismo en su origen.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "espiritismo-en-su-asiento",
    "title": "Espiritismo En Su Asiento",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Espiritismo En Su Asiento.",
    "vercelDownloadPath": "/biblioteca/ESPIRITISMO EN SU ASIENTO.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "estatutos-y-reglamentos",
    "title": "Estatutos Y Reglamentos",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Estatutos Y Reglamentos.",
    "vercelDownloadPath": "/biblioteca/estatutos y reglamentos.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "filosofia-enciclopedica-universal-tomo-1",
    "title": "Filosofia Enciclopedica Universal Tomo 1",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Filosofia Enciclopedica Universal Tomo 1.",
    "vercelDownloadPath": "/biblioteca/Filosofia-Enciclopedica-Universal-Tomo 1.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "filosofia-enciclopedica-universal-tomo-2",
    "title": "Filosofia Enciclopedica Universal Tomo 2",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Filosofia Enciclopedica Universal Tomo 2.",
    "vercelDownloadPath": "/biblioteca/Filosofia-Enciclopedica-Universal-Tomo 2.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "filosof-a-austera-racional",
    "title": "Filosofía Austera Racional",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Filosofía Austera Racional.",
    "vercelDownloadPath": "/biblioteca/FILOSOFÍA AUSTERA RACIONAL.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "jes-s-hombre-y-no-dios",
    "title": "Jesús Hombre Y No Dios",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Jesús Hombre Y No Dios.",
    "vercelDownloadPath": "/biblioteca/JESÚS HOMBREYNO DIOS.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "la-revolucion-de-mexico",
    "title": "La Revolución De México",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: La Revolución De México.",
    "vercelDownloadPath": "/biblioteca/LA REVOLUCIÓN DE MÉXICO.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "laudode-rigor",
    "title": "Laudode Rigor",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Laudode Rigor.",
    "vercelDownloadPath": "/biblioteca/laudode rigor.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "ley-de-las-mediumidades-en-general",
    "title": "Ley De Las Mediumidades En General",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Ley De Las Mediumidades En General.",
    "vercelDownloadPath": "/biblioteca/LEY DE LAS MEDIUMIDADES EN GENERAL.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "los-cinco-amores",
    "title": "Los Cinco Amores",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Los Cinco Amores.",
    "vercelDownloadPath": "/biblioteca/LOS CINCO AMORES.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "los-extremos-se-tocan",
    "title": "Los Extremos Se Tocan",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Los Extremos Se Tocan.",
    "vercelDownloadPath": "/biblioteca/los extremos se tocan.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "primer-rayo-de-luz",
    "title": "Primer Rayo De Luz",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Primer Rayo De Luz.",
    "vercelDownloadPath": "/biblioteca/PRIMER-RAYO-DE-LUZ.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "profilaxis-de-la-vida",
    "title": "Profilaxis De La Vida",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Profilaxis De La Vida.",
    "vercelDownloadPath": "/biblioteca/Profilaxis-de-la-vida.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "reglamento-interno-e-m-e-delac--u--1",
    "title": "Reglamento Interno E.m.e.delac .u. 1",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Reglamento Interno E.m.e.delac .u. 1.",
    "vercelDownloadPath": "/biblioteca/Reglamento-Interno-E.M.E.delaC_.U.-1.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "tercera-etapa",
    "title": "Tercera Etapa",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: Tercera Etapa.",
    "vercelDownloadPath": "/biblioteca/Tercera-Etapa.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "v-i-d-a---d-e----m-a-r-i-a",
    "title": "VIDA   D E    MARIA",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: VIDA   D E    MARIA.",
    "vercelDownloadPath": "/biblioteca/VIDA   D E    MARIA.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  },
  {
    "id": "discurso-obispo-strossmayer",
    "title": "[1library.co] Discurso Obispo Strossmayer",
    "author": "Maestro Joaquín Trincado",
    "description": "Obra doctrinal: [1library.co] Discurso Obispo Strossmayer.",
    "vercelDownloadPath": "/biblioteca/[1library.co] discurso obispo strossmayer.pdf",
    "category": "Doctrina",
    "pages": 150,
    "fileSize": "3.5 MB"
  }
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
