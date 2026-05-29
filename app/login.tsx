import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();
  const router = useRouter();

  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Completa todos los campos");
      return;
    }
    if (isRegister && !displayName.trim()) {
      setError("Ingresa tu nombre");
      return;
    }
    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (isRegister) {
        await register(email.trim(), password, displayName.trim());
      } else {
        await login(email.trim(), password);
      }
      router.replace("/(tabs)");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al autenticar";
      if (msg.includes("user-not-found") || msg.includes("wrong-password")) {
        setError("Correo o contraseña incorrectos");
      } else if (msg.includes("email-already-in-use")) {
        setError("Este correo ya está registrado");
      } else if (msg.includes("invalid-email")) {
        setError("Correo inválido");
      } else {
        setError("Verifica tu conexión e intenta de nuevo");
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const s = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 28,
      paddingTop: insets.top + 20,
      paddingBottom: insets.bottom + 40,
    },
    logoArea: {
      alignItems: "center",
      marginBottom: 48,
    },
    logoCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.primary,
      marginBottom: 20,
    },
    title: {
      fontSize: 26,
      fontWeight: "700" as const,
      color: colors.foreground,
      textAlign: "center",
      letterSpacing: 0.4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 8,
      lineHeight: 20,
    },
    gold: {
      color: colors.primary,
    },
    form: {
      gap: 14,
    },
    label: {
      fontSize: 12,
      fontWeight: "600" as const,
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 4,
    },
    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
    },
    input: {
      flex: 1,
      height: 52,
      color: colors.foreground,
      fontSize: 16,
    },
    eye: {
      padding: 4,
    },
    error: {
      backgroundColor: "#1f0a0a",
      borderRadius: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: "#7f1d1d",
    },
    errorText: {
      color: "#fca5a5",
      fontSize: 13,
      textAlign: "center",
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      height: 54,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: colors.primaryForeground,
      fontSize: 17,
      fontWeight: "700" as const,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 20,
      gap: 10,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      color: colors.mutedForeground,
      fontSize: 13,
    },
    toggle: {
      alignItems: "center",
    },
    toggleText: {
      color: colors.mutedForeground,
      fontSize: 15,
    },
    toggleBold: {
      color: colors.primary,
      fontWeight: "600" as const,
    },
  });

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.logoArea}>
          <View style={s.logoCircle}>
            <Feather name="star" size={40} color={colors.primary} />
          </View>
          <Text style={s.title}>
            EMECU <Text style={s.gold}>Móvil</Text>
          </Text>
          <Text style={s.subtitle}>
            Cátedra Maestro Joaquín Trincado{"\n"}Magna Fraternidad Universal
          </Text>
        </View>

        <View style={s.form}>
          {isRegister && (
            <View>
              <Text style={s.label}>Nombre completo</Text>
              <View style={s.inputWrap}>
                <TextInput
                  style={s.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Tu nombre"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}
          <View>
            <Text style={s.label}>Correo electrónico</Text>
            <View style={s.inputWrap}>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>
          <View>
            <Text style={s.label}>Contraseña</Text>
            <View style={s.inputWrap}>
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
              <TouchableOpacity
                style={s.eye}
                onPress={() => setShowPassword((v) => !v)}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>
          </View>

          {error !== "" && (
            <View style={s.error}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[s.button, loading && s.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={s.buttonText}>
                {isRegister ? "Crear cuenta" : "Iniciar sesión"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={s.divider}>
          <View style={s.line} />
          <Text style={s.dividerText}>o</Text>
          <View style={s.line} />
        </View>

        <TouchableOpacity
          style={s.toggle}
          onPress={() => {
            setIsRegister((v) => !v);
            setError("");
          }}
        >
          <Text style={s.toggleText}>
            {isRegister ? "¿Ya tienes cuenta? " : "¿Nuevo estudiante? "}
            <Text style={s.toggleBold}>
              {isRegister ? "Inicia sesión" : "Regístrate"}
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
