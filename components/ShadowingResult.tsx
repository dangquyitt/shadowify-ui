import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ShadowingResultProps {
  originalText: string;
  spokenText: string;
  accuracy: number;
  onRecordAgain: () => void;
  onPlayRecording: () => void;
}

export function ShadowingResult({
  originalText,
  spokenText,
  accuracy,
  onRecordAgain,
  onPlayRecording,
}: ShadowingResultProps) {
  // Function to highlight mismatched words
  const renderHighlightedText = () => {
    const originalWords = originalText.split(" ");
    const spokenWords = spokenText.split(" ");

    return spokenWords.map((word, index) => {
      const isCorrect =
        index < originalWords.length &&
        originalWords[index].toLowerCase() === word.toLowerCase();

      return (
        <Text
          key={index}
          style={[styles.wordText, !isCorrect && styles.incorrectWord]}
        >
          {word}{" "}
        </Text>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.textSection}>
        <Text style={styles.sectionTitle}>Original Transcript</Text>
        <View style={styles.textBox}>
          <Text style={styles.originalText}>{originalText}</Text>
        </View>

        <Text style={styles.sectionTitle}>Your Speech</Text>
        <View style={styles.textBox}>
          <Text style={styles.spokenTextContainer}>
            {renderHighlightedText()}
          </Text>
        </View>
      </View>

      <View style={styles.accuracyCircle}>
        <Text style={styles.accuracyText}>{accuracy}%</Text>
        <Text style={styles.accuracyLabel}>Accuracy</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onRecordAgain}
          accessibilityLabel="Record again"
        >
          <Ionicons name="mic" size={24} color="#2ecc71" />
          <Text style={styles.actionText}>Record again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onPlayRecording}
          accessibilityLabel="Play my recording"
        >
          <Ionicons name="play" size={24} color="#3498db" />
          <Text style={styles.actionText}>My Record</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  textSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#444",
  },
  textBox: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  originalText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  spokenTextContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  wordText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  incorrectWord: {
    color: "#e74c3c",
    textDecorationLine: "underline",
  },
  accuracyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginVertical: 16,
    borderWidth: 4,
    borderColor: "#ddd",
  },
  accuracyText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2ecc71",
  },
  accuracyLabel: {
    fontSize: 14,
    color: "#777",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  actionButton: {
    alignItems: "center",
    padding: 10,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
});
