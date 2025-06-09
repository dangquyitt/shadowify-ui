import { Colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MarkedTextProps {
  markedWords: Array<{ word: string; isCorrect: boolean }>;
  onWordPress?: (word: string) => void;
}

/**
 * Component to display text with only incorrect words highlighted
 */
export const MarkedText: React.FC<MarkedTextProps> = ({
  markedWords,
  onWordPress,
}) => {
  return (
    <View style={styles.container}>
      {markedWords.map((item, index) => (
        <Text
          key={`word-${index}`}
          style={[
            styles.word,
            // Only apply highlighting styles to incorrect words
            !item.isCorrect ? styles.incorrectWord : styles.correctWord,
          ]}
        >
          <Text
            onPress={() => onWordPress?.(item.word)}
            style={!item.isCorrect ? styles.underline : undefined}
          >
            {item.word}
          </Text>
          {index < markedWords.length - 1 ? " " : ""}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  word: {
    fontSize: 16,
    lineHeight: 24,
  },
  correctWord: {
    color: Colors.black,
  },
  incorrectWord: {
    color: Colors.tint,
    fontWeight: "500",
  },
  underline: {
    textDecorationLine: "underline",
  },
});
