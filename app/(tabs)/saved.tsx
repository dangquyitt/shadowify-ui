import DictionaryModal from "@/components/dictionary-modal";
import { Header } from "@/components/header";
import { Colors } from "@/constants/colors";
import { sentencesApi, videoApi } from "@/services/api";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  created_at: string;
  updated_at: string;
  meaning_en: string;
  meaning_vi: string;
  user_id: string;
  segment_id: string;
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

// Remove mock sentences as we'll use real data from API

// Define tab keys as constants to ensure type safety
const SENTENCES_TAB = "sentences" as const;
const WORDS_TAB = "words" as const;

// Define the TabKey type
type TabKey = typeof SENTENCES_TAB | typeof WORDS_TAB;

// Define tabs array with proper typing
const TABS = [
  { key: SENTENCES_TAB, label: "Sentences" },
  { key: WORDS_TAB, label: "Words" },
];

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
          onPress={() => onTabChange(t.key)}
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

function SentenceItem({
  meaning_en,
  meaning_vi,
  onPress,
}: {
  meaning_en: string;
  meaning_vi: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.sentenceItem} onPress={onPress}>
      <Text style={styles.sentenceEn}>{meaning_en}</Text>
      <Text style={styles.sentenceVi}>{meaning_vi}</Text>
    </TouchableOpacity>
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
      <View style={styles.wordRow}>
        <Text style={styles.word} numberOfLines={1}>
          {meaning_en}
        </Text>
        <Text style={styles.meaning} numberOfLines={1}>
          {meaning_vi}
        </Text>
      </View>
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
      <View style={{ flexDirection: "row", width: 65 }}>
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

function SwipeableSentenceItem({
  item,
  onDelete,
  onPress,
}: {
  item: Sentence;
  onDelete: (sentence: Sentence) => void;
  onPress: (sentence: Sentence) => void;
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
      <View style={{ flexDirection: "row", width: 65 }}>
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
      <SentenceItem
        meaning_en={item.meaning_en}
        meaning_vi={item.meaning_vi}
        onPress={() => onPress(item)}
      />
    </Swipeable>
  );
}

const Saved = () => {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>(SENTENCES_TAB);
  const [search, setSearch] = useState("");

  // Sentences state
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [sentencesPage, setSentencesPage] = useState(1);
  const [hasMoreSentences, setHasMoreSentences] = useState(true);
  const [loadingSentences, setLoadingSentences] = useState(false);
  const [refreshingSentences, setRefreshingSentences] = useState(false);

  // Words state
  const [words, setWords] = useState<Word[]>([]);
  const [page, setPage] = useState(1);
  const [hasMoreWords, setHasMoreWords] = useState(true);
  const [loadingWords, setLoadingWords] = useState(false);
  const [refreshingWords, setRefreshingWords] = useState(false);

  // Add state for dictionary modal
  const [isDictionaryModalVisible, setIsDictionaryModalVisible] =
    useState(false);
  const [selectedWord, setSelectedWord] = useState("");

  // Add state for flashcard modal
  const [isFlashcardModalVisible, setIsFlashcardModalVisible] = useState(false);

  // Handle word item press
  const handleWordPress = (word: Word) => {
    setSelectedWord(word.meaning_en);
    setIsDictionaryModalVisible(true);
  };

  // Handle dictionary modal close
  const handleDictionaryModalClose = () => {
    setIsDictionaryModalVisible(false);
  };

  // Handle flashcard modal open/close
  const handleFlashcardOpen = () => {
    setIsFlashcardModalVisible(true);
  };

  const handleFlashcardClose = () => {
    setIsFlashcardModalVisible(false);
  };

  // Handle sentence item press - navigate to shadowing practice
  const handleSentencePress = (sentence: Sentence) => {
    if (!sentence.segment_id) {
      Alert.alert("Error", "No segment ID available for this sentence");
      return;
    }

    // Navigate to shadowing practice with segment ID
    router.push({
      pathname: "/(screens)/shadowing-practice",
      params: {
        segmentId: sentence.segment_id,
        // We don't have transcript, youtubeId, etc. directly here.
        // These would normally be fetched on the shadowing-practice screen using the segmentId
      },
    });
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

  // Handle deleting a sentence
  const handleDeleteSentence = useCallback(async (sentence: Sentence) => {
    Alert.alert(
      "Delete Sentence",
      `Are you sure you want to delete this sentence?`,
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
              const success = await sentencesApi.deleteSentencesBySegmentId(
                sentence.segment_id
              );
              if (success) {
                // Remove sentence from the local state
                setSentences((prev) =>
                  prev.filter((s) => s.id !== sentence.id)
                );
              }
            } catch (error) {
              console.error("Failed to delete sentence:", error);
              Alert.alert(
                "Error",
                "Failed to delete sentence. Please try again."
              );
            }
          },
        },
      ]
    );
  }, []);

  const fetchSentences = useCallback(
    async (reset = false) => {
      const currentPage = reset ? 1 : sentencesPage;
      if (loadingSentences || (!reset && !hasMoreSentences)) return;

      try {
        setLoadingSentences(true);
        const { sentences: fetchedSentences, hasMore } =
          await sentencesApi.getSentences(
            currentPage,
            10,
            search.length > 0 ? search : undefined
          );

        setSentences((prev) =>
          reset ? fetchedSentences : [...prev, ...fetchedSentences]
        );
        setHasMoreSentences(hasMore);
        if (!reset) setSentencesPage(currentPage + 1);
        else setSentencesPage(2);
      } catch (error) {
        console.error("Error fetching sentences:", error);
      } finally {
        setLoadingSentences(false);
        setRefreshingSentences(false);
      }
    },
    [sentencesPage, hasMoreSentences, loadingSentences, search]
  );

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
    if (tab === SENTENCES_TAB) {
      fetchSentences(true);
    } else {
      fetchWords(true);
    }
  }, [tab]);

  const handleRefreshSentences = () => {
    setRefreshingSentences(true);
    fetchSentences(true);
  };

  const handleRefreshWords = () => {
    setRefreshingWords(true);
    fetchWords(true);
  };

  // Thêm effect mới để cập nhật search debounced
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (tab === WORDS_TAB) {
        fetchWords(true);
      } else if (tab === SENTENCES_TAB) {
        fetchSentences(true);
      }
    }, 500); // debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <View style={styles.actionButtons}>
        <TabSwitch tab={tab} onTabChange={setTab} />
      </View>
      <SearchBar value={search} onChange={setSearch} />
      {tab === SENTENCES_TAB ? (
        <FlatList
          data={sentences}
          keyExtractor={(item, index) => `${item.id}-${index}`} // Ensure unique keys
          renderItem={({ item }) => (
            <SwipeableSentenceItem
              item={item}
              onPress={handleSentencePress}
              onDelete={handleDeleteSentence}
            />
          )}
          ListEmptyComponent={
            loadingSentences && sentencesPage === 1 ? (
              <ActivityIndicator
                style={{ marginTop: 30 }}
                color={Colors.tint}
              />
            ) : (
              <Text style={styles.emptyText}>No saved sentences.</Text>
            )
          }
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (!loadingSentences && hasMoreSentences) {
              fetchSentences();
            }
          }}
          onEndReachedThreshold={0.3}
          onRefresh={handleRefreshSentences}
          refreshing={refreshingSentences}
          ListFooterComponent={
            loadingSentences && sentences.length > 0 ? (
              <ActivityIndicator
                style={{ marginVertical: 20 }}
                color={Colors.tint}
              />
            ) : null
          }
        />
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item, index) => `${item.id}-${index}`} // Ensure unique keys
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

      {/* Floating Flashcard Button */}
      {tab === WORDS_TAB && words.length > 0 && (
        <TouchableOpacity
          style={styles.floatingFlashcardButton}
          onPress={handleFlashcardOpen}
          activeOpacity={0.8}
        >
          <MaterialIcons name="flash-on" size={24} color={Colors.white} />
        </TouchableOpacity>
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
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  tabRow: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 10,
  },
  flashcardButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.tint,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  flashcardButtonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 4,
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
    flexDirection: "column",
    alignItems: "flex-start",
    minHeight: 70, // Ensure consistent height for better swipe experience
  },
  sentenceEn: {
    fontSize: 16,
    color: Colors.tint,
    fontWeight: "600",
    marginBottom: 6,
    flexShrink: 1,
  },
  sentenceVi: {
    fontSize: 15,
    color: Colors.softText,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  wordItem: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 14,
    paddingVertical: 16,
    flexDirection: "column",
    alignItems: "flex-start",
    minHeight: 55, // Adjust height to match screenshot
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  word: {
    fontSize: 16,
    color: Colors.tint, // Red color shown in screenshot
    fontWeight: "600",
    marginRight: 10,
  },
  meaning: {
    fontSize: 16,
    color: Colors.softText,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.lightGrey,
    marginTop: 30,
    fontSize: 15,
  },
  deleteButton: {
    width: 65,
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
  floatingFlashcardButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.tint,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    zIndex: 100,
  },
});
