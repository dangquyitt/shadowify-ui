import { AppHeader } from "@/components/AppHeader";
import { Colors } from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Sentence {
  id: string;
  en: string;
  vi: string;
}
interface Word {
  id: string;
  word: string;
  meaning: string;
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
const mockWords: Word[] = [
  { id: "1", word: "shadowing", meaning: "bắt chước phát âm" },
  { id: "2", word: "vocabulary", meaning: "từ vựng" },
  { id: "3", word: "sentence", meaning: "câu" },
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

function WordItem({ word, meaning }: Word) {
  return (
    <View style={styles.wordItem}>
      <Text style={styles.word}>{word}</Text>
      <Text style={styles.meaning}>{meaning}</Text>
    </View>
  );
}

const Page = () => {
  const [tab, setTab] = useState<TabKey>("sentences");
  const [search, setSearch] = useState("");

  const filteredSentences = useMemo(
    () =>
      mockSentences.filter(
        (s) =>
          s.en.toLowerCase().includes(search.toLowerCase()) ||
          s.vi.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );
  const filteredWords = useMemo(
    () =>
      mockWords.filter(
        (w) =>
          w.word.toLowerCase().includes(search.toLowerCase()) ||
          w.meaning.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />

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
          data={filteredWords}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <WordItem {...item} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No saved words.</Text>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

export default Page;

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
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  word: {
    fontSize: 16,
    color: Colors.tint,
    fontWeight: "600",
    marginRight: 10,
  },
  meaning: {
    fontSize: 15,
    color: Colors.softText,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.lightGrey,
    marginTop: 30,
    fontSize: 15,
  },
});
