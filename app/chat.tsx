import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCheck,
  Loader2,
  MessageSquare,
  MessageSquarePlus,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Send,
  Smile,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Theme Colors
const COLORS = {
  primary: "#118A7E", // Brand Teal
  secondary: "#0E7490", // Brand Cyan
  secondaryDark: "#0e7066",
  backgroundLight: "#F8FAFC",
  surfaceLight: "#ffffff",
  surfaceDark: "#1E293B",
  borderLight: "#e2e8f0",
  textMain: "#1e293b",
  textSub: "#64748b",
  white: "#FFFFFF",
  chatBubbleReceiver: "#ffffff",
  chatBubbleSender: "#118A7E",
};

const SCREEN_WIDTH = Dimensions.get("window").width;

import { BottomNavbar } from "../components/BottomNavbar";
import {
  Conversation,
  listenToConversations,
  listenToMessages,
  Message,
  sendMessage,
} from "../services/chatService";
import { auth } from "../utils/firebaseConfig";

export default function ChatScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null); // Selected chat
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  // Effect to listen to conversations list
  useEffect(() => {
    const unsubscribe = listenToConversations((updatedConversations) => {
      setConversations(updatedConversations);
    });
    return () => unsubscribe();
  }, []);

  // --- Chat List Component ---
  const ChatList = () => {
    // Filter logic can be added here based on activeTab
    const filteredChats = conversations.filter((c) => {
      if (activeTab === "Unread") return c.unreadCount > 0;
      return true;
    });

    return (
      <View style={{ flex: 1 }}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#9ca3af" />
            <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
              style={styles.searchInput}
              placeholder="Search conversations..."
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabScrollContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {["All", "Unread", "Active"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.filterTab,
                  activeTab === tab
                    ? styles.filterTabActive
                    : styles.filterTabInactive,
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeTab === tab
                      ? styles.filterTextActive
                      : styles.filterTextInactive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* List */}
        <ScrollView contentContainerStyle={styles.listContainer}>
          {filteredChats.length === 0 ? (
            <View
              style={{
                padding: 40,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 40,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: "#f0fdfa",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <MessageSquare size={32} color={COLORS.primary} />
              </View>
              <Text
                style={{
                  color: COLORS.textMain,
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                No messages yet
              </Text>
              <Text
                style={{
                  color: COLORS.textSub,
                  textAlign: "center",
                  paddingHorizontal: 40,
                  lineHeight: 20,
                }}
              >
                When you request a service, you can chat with your worker here.
              </Text>
            </View>
          ) : (
            filteredChats.map((chat) => {
              // Determine the "other" participant
              const otherUserId =
                chat.participants.find((uid) => uid !== currentUser?.uid) || "";
              const details = chat.participantDetails[otherUserId] || {
                name: "Unknown",
                role: "",
              };

              // Format time safely
              let timeString = "";
              if (chat.lastMessageTime) {
                const date = chat.lastMessageTime?.toDate
                  ? chat.lastMessageTime.toDate()
                  : new Date();
                timeString = date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              }

              return (
                <TouchableOpacity
                  key={chat.id}
                  style={styles.chatItem}
                  onPress={() => setCurrentConversation(chat)}
                >
                  <View style={styles.avatarContainer}>
                    <Image
                      source={{
                        uri:
                          details.avatar ||
                          "https://ui-avatars.com/api/?name=" + details.name,
                      }}
                      style={styles.avatar}
                    />
                    {/* You can add online status logic here if available */}
                  </View>

                  <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Text style={styles.chatName} numberOfLines={1}>
                          {details.name}
                        </Text>
                        {/* <MaterialIcons name="verified" size={14} color={COLORS.primary} /> */}
                      </View>
                      <Text
                        style={[
                          styles.timeText,
                          chat.unreadCount > 0 && {
                            color: COLORS.primary,
                            fontWeight: "600",
                          },
                        ]}
                      >
                        {timeString}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.chatMsg,
                        chat.unreadCount > 0 && {
                          color: COLORS.textMain,
                          fontWeight: "600",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {/* {chat.attachment && <Paperclip size={14} color={COLORS.textSub} style={{ marginRight: 4 }} />} */}
                      {chat.lastMessage || "Start created"}
                    </Text>

                    <Text style={styles.chatRole}>{details.role}</Text>
                  </View>

                  {chat.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* New Chat FAB - For now just goes to Home or specific flow */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/client-home")}
        >
          <MessageSquarePlus size={24} color="white" />
        </TouchableOpacity>

        {/* Main Bottom Nav */}
        <BottomNavbar />
      </View>
    );
  };

  // --- Detail Chat Component ---
  const ChatDetail = ({ conversation }: { conversation: Conversation }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [sending, setSending] = useState(false);

    // Identify other user
    const otherUserId =
      conversation.participants.find((uid) => uid !== currentUser?.uid) || "";
    const details = conversation.participantDetails[otherUserId] || {
      name: "Unknown",
    };

    useEffect(() => {
      const unsubscribe = listenToMessages(conversation.id, (msgs) => {
        setMessages(msgs);
      });
      return () => unsubscribe();
    }, [conversation.id]);

    const handleSend = async () => {
      if (!inputText.trim()) return;
      setSending(true);
      try {
        await sendMessage(conversation.id, inputText.trim());
        setInputText("");
      } catch (error) {
        console.error("Error sending message", error);
      } finally {
        setSending(false);
      }
    };

    return (
      <View style={{ flex: 1, backgroundColor: COLORS.backgroundLight }}>
        {/* Detail Header */}
        <View style={styles.detailHeader}>
          <TouchableOpacity
            onPress={() => setCurrentConversation(null)}
            style={styles.backBtn}
          >
            <ArrowLeft size={24} color={COLORS.textSub} />
          </TouchableOpacity>{" "}
          <View style={styles.headerAvatarContainer}>
            <Image
              source={{
                uri:
                  details.avatar ||
                  "https://ui-avatars.com/api/?name=" + details.name,
              }}
              style={styles.headerAvatar}
            />
            <View style={styles.headerOnlineDot} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Text style={styles.headerName}>{details.name}</Text>
              {/* <MaterialIcons name="verified" size={14} color={COLORS.primary} /> */}
            </View>
            <Text style={styles.headerStatus}>{details.role}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.headerIconBtn,
                { backgroundColor: "rgba(17,138,126,0.1)" },
              ]}
            >
              <Phone size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn}>
              <MoreVertical size={20} color={COLORS.textSub} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            // ref={ref => ref?.scrollToEnd({ animated: true })} // Simple auto-scroll
          >
            {messages.map((msg, idx) => {
              const isMine = msg.senderId === currentUser?.uid;

              // System message, Date separators etc can be implemented here based on msg.type or comparison

              if (isMine) {
                return (
                  <View key={msg.id} style={styles.msgRowSend}>
                    <View style={styles.bubbleSendContainer}>
                      <LinearGradient
                        colors={[COLORS.primary, COLORS.secondaryDark]}
                        style={styles.bubbleSend}
                      >
                        {msg.image && (
                          <View style={styles.sentImageContainer}>
                            <Image
                              source={{ uri: msg.image }}
                              style={styles.sentImage}
                            />
                          </View>
                        )}
                        {msg.text && (
                          <Text style={styles.msgTextSend}>{msg.text}</Text>
                        )}
                      </LinearGradient>
                    </View>
                    <View style={styles.statusRow}>
                      <Text style={styles.msgTime}>
                        {msg.createdAt?.toDate
                          ? msg.createdAt.toDate().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </Text>
                      {msg.read && (
                        <CheckCheck size={14} color={COLORS.secondary} />
                      )}
                    </View>
                  </View>
                );
              } else {
                return (
                  <View key={msg.id} style={styles.msgRowReceive}>
                    <Image
                      source={{
                        uri:
                          "https://ui-avatars.com/api/?name=" +
                          (msg.senderName || "U"),
                      }}
                      style={styles.msgAvatar}
                    />
                    <View>
                      <View style={styles.bubbleReceive}>
                        <Text style={styles.msgTextReceive}>{msg.text}</Text>
                      </View>
                      <Text style={styles.msgTime}>
                        {msg.createdAt?.toDate
                          ? msg.createdAt.toDate().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </Text>
                    </View>
                  </View>
                );
              }
            })}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputArea}>
            <View style={styles.inputRow}>
              <TouchableOpacity style={styles.attachBtn}>
                <Plus size={24} color={COLORS.primary} />
              </TouchableOpacity>

              <View style={styles.textInputWrapper}>
                <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                  style={styles.textInput}
                  placeholder="Type a message..."
                  placeholderTextColor="#9ca3af"
                  value={inputText}
                  onChangeText={setInputText}
                />
                <TouchableOpacity>
                  <Smile size={24} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.micBtn}
                onPress={handleSend}
                disabled={sending}
              >
                {sending ? (
                  <Loader2 size={24} color={COLORS.primary} />
                ) : (
                  <Send size={24} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      {!currentConversation ? (
        <>
          <ChatList />
        </>
      ) : (
        <ChatDetail conversation={currentConversation} />
      )}
      {!currentConversation && <BottomNavbar />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  // --- Main Header ---
  mainHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.backgroundLight,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textSub,
  },
  notifBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1.5,
    borderColor: COLORS.backgroundLight,
  },
  headerBackBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  // --- Chat List Component ---
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: COLORS.textMain,
  },
  tabScrollContainer: {
    paddingVertical: 12,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabInactive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  filterTextActive: {
    color: "white",
  },
  filterTextInactive: {
    color: COLORS.textSub,
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 100, // Fab + Nav space
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
    backgroundColor: "transparent",
    // Hover effect simulated by TouchOpacity
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  supportAvatar: {
    backgroundColor: "rgba(17,138,126,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.backgroundLight,
    borderRadius: 7,
  },
  chatInfo: {
    flex: 1,
    marginRight: 8,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textMain,
    flexShrink: 1,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textSub,
    fontWeight: "500",
  },
  chatMsg: {
    fontSize: 14,
    color: COLORS.textSub,
    marginBottom: 4,
  },
  chatRole: {
    fontSize: 12,
    color: "#94a3b8", // lighter gray
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    bottom: 90, // Above bottom nav
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: COLORS.textSub,
  },
  // --- Detail Styles ---
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    padding: 8,
    marginRight: 4,
  },
  headerAvatarContainer: {
    position: "relative",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerOnlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  headerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  headerStatus: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc", // fallback
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 16,
  },
  systemMsgContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  systemMsg: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fefce8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fef9c3",
  },
  systemMsgText: {
    fontSize: 11,
    color: "#a16207",
  },
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#cbd5e1",
    opacity: 0.5,
  },
  dateText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#9ca3af",
    textTransform: "uppercase",
  },
  msgRowReceive: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
    gap: 8,
  },
  msgRowSend: {
    flexDirection: "row-reverse",
    marginBottom: 16,
    alignItems: "flex-end",
    gap: 8,
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  bubbleReceive: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 2,
    maxWidth: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleSendContainer: {
    maxWidth: "75%",
  },
  bubbleSend: {
    padding: 12,
    borderRadius: 16,
    borderBottomRightRadius: 2,
  },
  msgTextReceive: {
    color: COLORS.textMain,
    fontSize: 15,
  },
  msgTextSend: {
    color: "white",
    fontSize: 15,
  },
  sentImageContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 2,
  },
  sentImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    paddingRight: 16,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  audioWave: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: 24,
  },
  bar: {
    width: 3,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 1.5,
  },
  audioDuration: {
    fontSize: 12,
    color: "white",
    marginLeft: 4,
    fontWeight: "500",
  },
  msgTime: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 4,
    marginLeft: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    justifyContent: "flex-end",
    marginRight: 4,
  },
  typingDots: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9ca3af",
  },
  inputArea: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
  },
  quickActions: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textSub,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    gap: 8,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMain,
    paddingVertical: 10,
  },
  micBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
