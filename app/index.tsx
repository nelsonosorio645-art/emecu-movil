import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const colors = useColors();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace("/(tabs)");
    } else {
      router.replace("/login");
    }
  }, [user, loading]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}
