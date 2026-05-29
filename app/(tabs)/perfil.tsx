import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

interface StatItem {
  label: string;
  value: string;
  icon: string;
}

export default function PerfilScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const stats: StatItem[] = [
    { label: "Grado", value: "1°", icon: "award" },
    { label: "Temas", value: "—", icon: "book-open" },
    { label: "Mensajes", value: "—", icon: "message-circle" },
  ];

  const handleLogout = () => {
    if (Platform.OS === "web") {
      doLogout();
      return;
    }
    Alert.alert("Cerrar sesión", "¿Deseas salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: doLogout },
    ]);
  };

  const doLogout = async () => {
    try {
      setLoggingOut(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await logout();
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "Estudiante";
  const email = user?.email ?? "";
  const initial = displayName.charAt(0).toUpperCase();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1 },
    hero: {
      alignItems: "center",
      paddingTop: topPad + 24,
      paddingBottom: 28,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    avatarRing: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 2.5,
      borderColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      marginBottom: 14,
    },
    avatarText: {
      fontSize: 36,
      fontWeight: "700" as const,
      color: colors.primary,
    },
    name: {
      fontSize: 22,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    email: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginTop: 4,
    },
    statsRow: {
      flexDirection: "row",
      margin: 20,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    statValue: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    statLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    section: {
      marginHorizontal: 20,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "600" as const,
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 10,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
      gap: 12,
    },
    rowText: {
      flex: 1,
      fontSize: 15,
      color: colors.foreground,
    },
    logoutRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: "#7f1d1d",
      marginBottom: 8,
      gap: 12,
    },
    logoutText: {
      flex: 1,
      fontSize: 15,
      color: colors.destructive,
    },
    version: {
      textAlign: "center",
      fontSize: 12,
      color: colors.mutedForeground,
      paddingBottom: botPad + 24,
      marginTop: 8,
    },
  });

  return (
    <View style={s.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.hero}>
          <View style={s.avatarRing}>
            <Text style={s.avatarText}>{initial}</Text>
          </View>
          <Text style={s.name}>{displayName}</Text>
          <Text style={s.email}>{email}</Text>
        </View>

        <View style={s.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={s.statCard}>
              <Feather name={stat.icon as any} size={22} color={colors.primary} />
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Cuenta</Text>
          <TouchableOpacity style={s.row} activeOpacity={0.75}>
            <Feather name="user" size={20} color={colors.mutedForeground} />
            <Text style={s.rowText}>{displayName}</Text>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity style={s.row} activeOpacity={0.75}>
            <Feather name="mail" size={20} color={colors.mutedForeground} />
            <Text style={s.rowText}>{email}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>General</Text>
          <TouchableOpacity style={s.row} activeOpacity={0.75}>
            <Feather name="bell" size={20} color={colors.mutedForeground} />
            <Text style={s.rowText}>Notificaciones</Text>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity style={s.row} activeOpacity={0.75}>
            <Feather name="globe" size={20} color={colors.mutedForeground} />
            <Text style={s.rowText}>maestro-trincado-jet.vercel.app</Text>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <View style={s.section}>
          <TouchableOpacity
            style={s.logoutRow}
            onPress={handleLogout}
            disabled={loggingOut}
            activeOpacity={0.75}
          >
            <Feather name="log-out" size={20} color={colors.destructive} />
            <Text style={s.logoutText}>
              {loggingOut ? "Saliendo..." : "Cerrar sesión"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={s.version}>EMECU Móvil v1.0.0 · Cátedra Maestro Trincado</Text>
      </ScrollView>
    </View>
  );
}
