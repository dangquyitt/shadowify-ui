import DictionaryModal from "@/components/dictionary-modal";
import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function DictionaryDemo() {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [customWord, setCustomWord] = useState("");

  const testWords = [
    "trust", // Rich example with synonyms and antonyms
    "love", // Common word with multiple meanings
    "run", // Multiple parts of speech
    "beautiful", // Adjective with synonyms
    "freedom", // Abstract concept
    "science", // Academic term
  ];

  const handleWordPress = (word: string) => {
    setSelectedWord(word);
  };

  const handleCustomWordLookup = () => {
    if (customWord.trim()) {
      setSelectedWord(customWord.trim());
      setCustomWord("");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dictionary Demo</Text>
        <Text style={styles.subtitle}>
          Test the enhanced dictionary with synonyms, antonyms, and audio
          pronunciation
        </Text>

        {/* Custom word input */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Look up any word:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={customWord}
              onChangeText={setCustomWord}
              placeholder="Enter a word to look up..."
              placeholderTextColor={Colors.softText}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.lookupButton}
              onPress={handleCustomWordLookup}
            >
              <Text style={styles.lookupButtonText}>Lookup</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Test words */}
        <View style={styles.testWordsSection}>
          <Text style={styles.sectionTitle}>Quick test words:</Text>
          <View style={styles.wordsGrid}>
            {testWords.map((word) => (
              <TouchableOpacity
                key={word}
                style={styles.wordButton}
                onPress={() => handleWordPress(word)}
              >
                <Text style={styles.wordButtonText}>{word}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.instructions}>
          Tap any word above to see the enhanced dictionary with:
          {"\n"}• Audio pronunciation
          {"\n"}• Synonyms and antonyms
          {"\n"}• Multiple definitions
          {"\n"}• Examples and more!
        </Text>
      </View>

      {/* Dictionary Modal */}
      {selectedWord && (
        <DictionaryModal
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.tint,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.softText,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.tint,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.black,
    backgroundColor: Colors.white,
  },
  lookupButton: {
    backgroundColor: Colors.tint,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
  },
  lookupButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  testWordsSection: {
    marginBottom: 30,
  },
  wordsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  wordButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.tint,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 80,
  },
  wordButtonText: {
    color: Colors.tint,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  instructions: {
    fontSize: 14,
    color: Colors.softText,
    lineHeight: 20,
    textAlign: "center",
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.background,
  },
});
