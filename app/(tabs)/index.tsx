import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  Timestamp,
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth, db } from "@/config/firebase";
import { useColors } from "@/hooks/useColors";

interface Message {
  id: string;
  text: string;
  uid: string;
  displayName: string;
  createdAt: Timestamp | null;
  isVoice?: boolean;
}

interface Topic {
  id: string;
  title: string;
  category: string;
}

const DEFAULT_TOPICS: Topic[] = [
  { id: "general", title: "General", category: "Chat" },
  { id: "doctrina", title: "Introducción a la Doctrina", category: "Doctrina" },
  { id: "ser-humano", title: "El Ser Humano Integral", category: "Filosofía" },
  { id: "etica", title: "La Ética Universal", category: "Ética" },
  { id: "historia", title: "Historia de la Humanidad", category: "Historia" },
  { id: "metafisica", title: "Metafísica Práctica", category: "Metafísica" },
  { id: "amor", title: "El Amor Universal", category: "Espiritualidad" },
  { id: "ciencia", title: "Ciencia y Espiritualidad", category: "Ciencia" },
  { id: "fraternidad", title: "Fraternidad Universal", category: "Doctrina" },
];

function formatTime(ts: Timestamp | null): string {
  if (!ts) return "";
  try {
    const d = ts.toDate();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

// Web Speech API voice recognition hook
function useVoiceRecognition(onResult: (text: string) => void) {
  const [listening, setListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  const start = () => {
    if (Platform.OS !== "web") {
      // Native: not supported in Expo Go without native build
      return false;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return false;

    const r = new SpeechRecognition();
    r.lang = "es-ES";
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript ?? "";
      if (text) onResult(text);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
    return true;
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return { listening, start, stop };
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;

  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTopic, setActiveTopic] = useState<Topic>(DEFAULT_TOPICS[0]);
  const [text, setText] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [showPanel, setShowPanel] = useState<boolean>(false);

  const slideAnim = useRef(new Animated.Value(-300)).current;

  const { listening, start: startVoice, stop: stopVoice } = useVoiceRecognition((t) => {
    setText((prev) => (prev ? prev + " " + t : t));
  });

  useEffect(() => {
    const q = query(
      collection(db, "topics", activeTopic.id, "messages"),
      orderBy("createdAt", "desc"),
      limit(60)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)));
      },
      () => setMessages([])
    );
    return unsub;
  }, [activeTopic.id]);

  const openPanel = () => {
    setShowPanel(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const closePanel = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setShowPanel(false));
  };

  const selectTopic = (topic: Topic) => {
    setActiveTopic(topic);
    setMessages([]);
    closePanel();
    Haptics.selectionAsync();
  };

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || !user) return;
    setText("");
    setSending(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await addDoc(
        collection(db, "topics", activeTopic.id, "messages"),
        {
          text: trimmed,
          uid: user.uid,
          displayName: user.displayName ?? user.email?.split("@")[0] ?? "Estudiante",
          createdAt: serverTimestamp(),
        }
      );
    } catch {
      setText(trimmed);
    } finally {
      setSending(false);
    }
  };

  const handleMic = () => {
    if (listening) {
      stopVoice();
    } else {
      const started = startVoice();
      if (!started) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: topPad + 10,
      paddingBottom: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
      gap: 12,
    },
    menuBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: colors.card,
      alignItems: "center", justifyContent: "center",
      borderWidth: 1, borderColor: colors.border,
    },
    topicInfo: { flex: 1 },
    topicName: { fontSize: 16, fontWeight: "700" as const, color: colors.foreground },
    topicCat: { fontSize: 12, color: colors.primary, marginTop: 1 },
    onlineDot: {
      width: 10, height: 10, borderRadius: 5,
      backgroundColor: "#22c55e",
      borderWidth: 2, borderColor: colors.background,
    },
    msgList: { flex: 1 },
    msgContent: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8 },
    bubbleWrap: { marginBottom: 6, flexDirection: "row" },
    bubbleSent: { justifyContent: "flex-end" },
    bubbleReceived: { justifyContent: "flex-start" },
    bubble: {
      maxWidth: "78%",
      paddingHorizontal: 14, paddingVertical: 9,
      borderRadius: 18,
    },
    bubbleSentInner: { backgroundColor: colors.sent, borderBottomRightRadius: 4 },
    bubbleRecvInner: { backgroundColor: colors.received, borderBottomLeftRadius: 4 },
    senderName: { fontSize: 11, fontWeight: "600" as const, color: colors.primary, marginBottom: 3 },
    msgText: { fontSize: 15, lineHeight: 20 },
    msgTextSent: { color: colors.primaryForeground },
    msgTextRecv: { color: colors.foreground },
    msgTime: { fontSize: 10, marginTop: 3, textAlign: "right" },
    msgTimeSent: { color: "rgba(2,6,23,0.6)" },
    msgTimeRecv: { color: colors.mutedForeground },
    inputBar: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: Math.max(botPad + 8, 12),
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
      gap: 8,
    },
    micBtn: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: colors.card,
      alignItems: "center", justifyContent: "center",
      borderWidth: 1, borderColor: colors.border,
    },
    micBtnActive: { backgroundColor: "#dc2626", borderColor: "#dc2626" },
    inputWrap: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1, borderColor: colors.border,
      paddingHorizontal: 16, paddingVertical: 10,
      minHeight: 44, maxHeight: 120,
    },
    textInput: { color: colors.foreground, fontSize: 15, lineHeight: 20 },
    sendBtn: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: "center", justifyContent: "center",
    },
    sendBtnDisabled: { opacity: 0.4 },
    emptyWrap: {
      flex: 1, alignItems: "center", justifyContent: "center",
      gap: 10, paddingHorizontal: 40,
    },
    emptyText: { color: colors.mutedForeground, fontSize: 15, textAlign: "center" },
    listeningBadge: {
      backgroundColor: "#dc2626",
      paddingHorizontal: 12, paddingVertical: 4,
      borderRadius: 12, alignSelf: "center",
      marginBottom: 6,
    },
    listeningText: { color: "#fff", fontSize: 12, fontWeight: "600" as const },
    // Drawer
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", flexDirection: "row" },
    drawer: { width: 280, backgroundColor: colors.card, height: "100%" },
    drawerHeader: {
      paddingTop: topPad + 16, paddingHorizontal: 20,
      paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    drawerTitle: { fontSize: 18, fontWeight: "700" as const, color: colors.foreground },
    drawerSub: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
    topicRow: {
      flexDirection: "row", alignItems: "center",
      paddingVertical: 13, paddingHorizontal: 20,
      borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12,
    },
    topicRowActive: { backgroundColor: colors.secondary },
    topicRowIcon: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.muted,
      alignItems: "center", justifyContent: "center",
    },
    topicRowIconActive: { backgroundColor: colors.primary },
    topicRowMeta: { flex: 1 },
    topicRowTitle: { fontSize: 14, fontWeight: "600" as const, color: colors.foreground },
    topicRowCat: { fontSize: 11, color: colors.mutedForeground, marginTop: 1 },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.menuBtn} onPress={openPanel} activeOpacity={0.7}>
          <Feather name="menu" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <View style={s.topicInfo}>
          <Text style={s.topicName} numberOfLines={1}>{activeTopic.title}</Text>
          <Text style={s.topicCat}>{activeTopic.category}</Text>
        </View>
        <View style={s.onlineDot} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        {messages.length === 0 ? (
          <View style={s.emptyWrap}>
            <Feather name="message-circle" size={44} color={colors.mutedForeground} />
            <Text style={s.emptyText}>
              Inicia la conversación en {"\n"}{activeTopic.title}
            </Text>
          </View>
        ) : (
          <FlatList
            style={s.msgList}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={s.msgContent}
            inverted
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            renderItem={({ item: msg }) => {
              const mine = msg.uid === user?.uid;
              return (
                <View style={[s.bubbleWrap, mine ? s.bubbleSent : s.bubbleReceived]}>
                  <View style={[s.bubble, mine ? s.bubbleSentInner : s.bubbleRecvInner]}>
                    {!mine && <Text style={s.senderName}>{msg.displayName}</Text>}
                    <Text style={[s.msgText, mine ? s.msgTextSent : s.msgTextRecv]}>
                      {msg.isVoice ? "🎙 " : ""}{msg.text}
                    </Text>
                    <Text style={[s.msgTime, mine ? s.msgTimeSent : s.msgTimeRecv]}>
                      {formatTime(msg.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {listening && (
          <View style={s.listeningBadge}>
            <Text style={s.listeningText}>🔴 Escuchando...</Text>
          </View>
        )}

        <View style={s.inputBar}>
          <TouchableOpacity
            style={[s.micBtn, listening && s.micBtnActive]}
            onPress={handleMic}
            activeOpacity={0.7}
          >
            <Feather
              name={listening ? "mic-off" : "mic"}
              size={20}
              color={listening ? "#fff" : colors.mutedForeground}
            />
          </TouchableOpacity>
          <View style={s.inputWrap}>
            <TextInput
              style={s.textInput}
              value={text}
              onChangeText={setText}
              placeholder={listening ? "Habla ahora..." : "Escribe un mensaje..."}
              placeholderTextColor={colors.mutedForeground}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity
            style={[s.sendBtn, (!text.trim() || sending) && s.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!text.trim() || sending}
            activeOpacity={0.8}
          >
            <Feather name="send" size={18} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showPanel} transparent animationType="none" onRequestClose={closePanel}>
        <TouchableWithoutFeedback onPress={closePanel}>
          <View style={s.overlay}>
            <Animated.View style={[s.drawer, { transform: [{ translateX: slideAnim }] }]}>
              <TouchableWithoutFeedback>
                <View style={{ flex: 1 }}>
                  <View style={s.drawerHeader}>
                    <Text style={s.drawerTitle}>Índice de Temas</Text>
                    <Text style={s.drawerSub}>Selecciona un canal de estudio</Text>
                  </View>
                  <FlatList
                    data={DEFAULT_TOPICS}
                    keyExtractor={(t) => t.id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item: topic }) => {
                      const active = topic.id === activeTopic.id;
                      return (
                        <TouchableOpacity
                          style={[s.topicRow, active && s.topicRowActive]}
                          onPress={() => selectTopic(topic)}
                          activeOpacity={0.7}
                        >
                          <View style={[s.topicRowIcon, active && s.topicRowIconActive]}>
                            <Feather
                              name={active ? "message-square" : "hash"}
                              size={16}
                              color={active ? colors.primaryForeground : colors.mutedForeground}
                            />
                          </View>
                          <View style={s.topicRowMeta}>
                            <Text style={s.topicRowTitle}>{topic.title}</Text>
                            <Text style={s.topicRowCat}>{topic.category}</Text>
                          </View>
                          {active && <Feather name="check" size={16} color={colors.primary} />}
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
