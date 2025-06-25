import DictionaryModal from "@/components/dictionary-modal";
import { Header } from "@/components/header";
import { Colors } from "@/constants/colors";
import { videoApi } from "@/services/api";
import { Feather } from "@expo/vector-icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RectButton } from "react-native-gesture-handler";
// Using the most current version of Swipeable from React Native Gesture Handler
// which internally uses Reanimated v2 for better performance
import Swipeable from "react-native-gesture-handler/Swipeable";

interface Sentence {
  id: string;
  en: string;
  vi: string;
}
interface Word {
  id: string;
  created_at: string;
  updated_at: string;
  meaning_vi: string;
  meaning_en: string;
  user_id: string;
  segment_id: string;
}

const mockSentences: Sentence[] = [
  { id: "1", en: "How are you today?", vi: "Bạn hôm nay thế nào?" },
  { id: "2", en: "I like learning English.", vi: "Tôi thích học tiếng Anh." },
  {
    id: "3",
    en: "Practice makes perfect.",
    vi: "Có công mài sắt có ngày nên kim.",
  },
];

const TABS = [
  { key: "sentences", label: "Sentences" },
  { key: "words", label: "Words" },
];

type TabKey = "sentences" | "words";

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.searchBar}>
      <Feather
        name="search"
        size={18}
        color={Colors.lightGrey}
        style={{ marginRight: 6 }}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        placeholderTextColor={Colors.lightGrey}
        value={value}
        onChangeText={onChange}
        accessibilityLabel="Search saved items"
      />
    </View>
  );
}

function TabSwitch({
  tab,
  onTabChange,
}: {
  tab: TabKey;
  onTabChange: (tab: TabKey) => void;
}) {
  return (
    <View style={styles.tabRow}>
      {TABS.map((t) => (
        <TouchableOpacity
          key={t.key}
          style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
          onPress={() => onTabChange(t.key as TabKey)}
          accessibilityRole="button"
        >
          <Text
            style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}
          >
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function SentenceItem({ en, vi }: Sentence) {
  return (
    <View style={styles.sentenceItem}>
      <Text style={styles.sentenceEn}>{en}</Text>
      <Text style={styles.sentenceVi}>{vi}</Text>
    </View>
  );
}

function WordItem({
  meaning_en,
  meaning_vi,
  onPress,
}: {
  meaning_en: string;
  meaning_vi: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.wordItem} onPress={onPress}>
      <Text style={styles.word} numberOfLines={1}>
        {meaning_en}
      </Text>
      <Text style={styles.meaning} numberOfLines={2}>
        {meaning_vi}
      </Text>
    </TouchableOpacity>
  );
}

function SwipeableWordItem({
  item,
  onDelete,
  onPress,
}: {
  item: Word;
  onDelete: (word: Word) => void;
  onPress: (word: Word) => void;
}) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0],
    });

    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    });

    return (
      <View style={{ flexDirection: "row", width: 80 }}>
        <Animated.View
          style={{
            flex: 1,
            transform: [{ translateX: trans }],
            opacity: opacity,
          }}
        >
          <RectButton
            style={styles.deleteButton}
            onPress={() => {
              swipeableRef.current?.close();
              onDelete(item);
            }}
          >
            <Feather name="trash-2" size={22} color={Colors.white} />
          </RectButton>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={1.5}
      rightThreshold={40}
      overshootRight={false}
      containerStyle={{ marginBottom: 10 }}
      childrenContainerStyle={{ marginBottom: 0 }}
    >
      <WordItem
        meaning_en={item.meaning_en}
        meaning_vi={item.meaning_vi}
        onPress={() => onPress(item)}
      />
    </Swipeable>
  );
}

const Saved = () => {
  const [tab, setTab] = useState<TabKey>("sentences");
  const [search, setSearch] = useState("");
  const [words, setWords] = useState<Word[]>([]);
  const [page, setPage] = useState(1);
  const [hasMoreWords, setHasMoreWords] = useState(true);
  const [loadingWords, setLoadingWords] = useState(false);
  const [refreshingWords, setRefreshingWords] = useState(false);

  // Add state for dictionary modal
  const [isDictionaryModalVisible, setIsDictionaryModalVisible] =
    useState(false);
  const [selectedWord, setSelectedWord] = useState("");

  // Handle word item press
  const handleWordPress = (word: Word) => {
    setSelectedWord(word.meaning_en);
    setIsDictionaryModalVisible(true);
  };

  // Handle dictionary modal close
  const handleDictionaryModalClose = () => {
    setIsDictionaryModalVisible(false);
  };

  // Handle deleting a word
  const handleDeleteWord = useCallback(async (word: Word) => {
    Alert.alert(
      "Delete Word",
      `Are you sure you want to delete "${word.meaning_en}" from your saved words?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await videoApi.deleteWord(word.meaning_en);
              if (success) {
                // Remove word from the local state
                setWords((prev) => prev.filter((w) => w.id !== word.id));
              }
            } catch (error) {
              console.error("Failed to delete word:", error);
              Alert.alert("Error", "Failed to delete word. Please try again.");
            }
          },
        },
      ]
    );
  }, []);

  const fetchWords = useCallback(
    async (reset = false) => {
      const currentPage = reset ? 1 : page;
      if (loadingWords || (!reset && !hasMoreWords)) return;

      try {
        setLoadingWords(true);
        const { words: fetchedWords, hasMore } = await videoApi.getWords(
          currentPage,
          10,
          search.length > 0 ? search : undefined
        );

        setWords((prev) => (reset ? fetchedWords : [...prev, ...fetchedWords]));
        setHasMoreWords(hasMore);
        if (!reset) setPage(currentPage + 1);
        else setPage(2);
      } catch (error) {
        console.error("Error fetching words:", error);
      } finally {
        setLoadingWords(false);
        setRefreshingWords(false);
      }
    },
    [page, hasMoreWords, loadingWords, search]
  );

  useEffect(() => {
    if (tab === "words") {
      fetchWords(true);
    }
  }, [tab]);

  const handleRefreshWords = () => {
    setRefreshingWords(true);
    fetchWords(true);
  };

  const filteredSentences = useMemo(
    () =>
      mockSentences.filter(
        (s) =>
          s.en.toLowerCase().includes(search.toLowerCase()) ||
          s.vi.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  // Thêm effect mới để cập nhật search debounced
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (tab === "words") {
        fetchWords(true);
      }
    }, 500); // debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <TabSwitch tab={tab} onTabChange={setTab} />
      <SearchBar value={search} onChange={setSearch} />
      {tab === "sentences" ? (
        <FlatList
          data={filteredSentences}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SentenceItem {...item} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No saved sentences.</Text>
          }
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SwipeableWordItem
              item={item}
              onPress={() => handleWordPress(item)}
              onDelete={(word) => {
                Alert.alert(
                  "Delete Word",
                  "Are you sure you want to delete this word?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await videoApi.deleteWord(word.meaning_en);
                          setWords((prev) =>
                            prev.filter((w) => w.id !== word.id)
                          );
                        } catch (error) {
                          console.error("Error deleting word:", error);
                        }
                      },
                    },
                  ]
                );
              }}
            />
          )}
          ListEmptyComponent={
            loadingWords && page === 1 ? (
              <ActivityIndicator
                style={{ marginTop: 30 }}
                color={Colors.tint}
              />
            ) : (
              <Text style={styles.emptyText}>No saved words.</Text>
            )
          }
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (!loadingWords && hasMoreWords) {
              fetchWords();
            }
          }}
          onEndReachedThreshold={0.3}
          onRefresh={handleRefreshWords}
          refreshing={refreshingWords}
          ListFooterComponent={
            loadingWords && words.length > 0 ? (
              <ActivityIndicator
                style={{ marginVertical: 20 }}
                color={Colors.tint}
              />
            ) : null
          }
        />
      )}

      {/* Dictionary Modal */}
      {isDictionaryModalVisible && (
        <DictionaryModal
          word={selectedWord}
          onClose={handleDictionaryModalClose}
        />
      )}
    </SafeAreaView>
  );
};

export default Saved;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.black,
    marginTop: 16,
    marginBottom: 4,
    marginLeft: 18,
  },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: "hidden",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  tabBtnActive: {
    backgroundColor: Colors.background,
  },
  tabLabel: {
    color: Colors.softText,
    fontWeight: "500",
    fontSize: 15,
  },
  tabLabelActive: {
    color: Colors.tint,
    fontWeight: "700",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginHorizontal: 14,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.background,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.black,
    paddingVertical: 2,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  sentenceItem: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: Colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  sentenceEn: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: "500",
    marginBottom: 2,
  },
  sentenceVi: {
    fontSize: 14,
    color: Colors.softText,
  },
  wordItem: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 14,
    flexDirection: "column",
    alignItems: "flex-start",
    minHeight: 70, // Ensure consistent height for better swipe experience
  },
  word: {
    fontSize: 16,
    color: Colors.tint,
    fontWeight: "600",
    marginBottom: 6,
    flexShrink: 1,
  },
  meaning: {
    fontSize: 15,
    color: Colors.softText,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  emptyText: {
    textAlign: "center",
    color: Colors.lightGrey,
    marginTop: 30,
    fontSize: 15,
  },
  deleteButton: {
    width: 80,
    height: "100%",
    backgroundColor: Colors.tint,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    shadowColor: Colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
