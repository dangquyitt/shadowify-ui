// TranscriptLine.tsx
import { Colors } from "@/constants/colors";
import { Segment } from "@/types/segment";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { forwardRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type TranscriptLineProps = {
  youtubeId: string;
  text: string;
  isActive?: boolean;
  onPressLine?: () => void;
  onWordPress?: (word: string) => void;
  onTranslate?: (segment: Segment) => void; // Update type to accept Segment
  segment?: Segment;
  onMicPress?: (segment: Segment) => void;
  cefrColor?: string; // Add cefrColor for CEFR level color
};

const TranscriptLine = forwardRef<View, TranscriptLineProps>(
  (
    {
      youtubeId,
      text,
      isActive,
      onPressLine,
      onWordPress,
      onTranslate,
      segment,
      onMicPress,
      cefrColor, // Destructure cefrColor
    },
    ref
  ) => {
    const words = text.split(" ");

    const formatTime = (seconds: number | undefined): string => {
      if (typeof seconds !== "number") return "";
      const m = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
      const s = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");
      return `${m}:${s}`;
    };

    const startTime = formatTime(segment?.start_sec);

    return (
      <TouchableOpacity
        ref={ref}
        style={[styles.transcriptLine, isActive && styles.transcriptLineActive]}
        onPress={onPressLine}
        activeOpacity={0.7}
      >
        <View style={styles.lineInfoContainer}>
          {segment?.start_sec !== undefined && (
            <View style={styles.segmentTimeContainer}>
              <Text style={styles.segmentTimeText}>{startTime}</Text>
            </View>
          )}
          {segment?.cefr && (
            <View
              style={[
                styles.cefrBadge,
                { backgroundColor: cefrColor || Colors.primary },
              ]}
            >
              <Text style={styles.cefrText}>{segment.cefr}</Text>
            </View>
          )}
        </View>
        <Text style={styles.transcriptText}>
          {words.map((word, idx) => (
            <Text
              key={idx}
              style={styles.wordText}
              onPress={() =>
                onWordPress && onWordPress(word.replace(/[^a-zA-Z']/g, ""))
              }
              suppressHighlighting
            >
              <Text style={isActive ? styles.underlineWord : undefined}>
                {word}
              </Text>
              {idx < words.length - 1 && " "}
            </Text>
          ))}
        </Text>
        <View style={styles.translateBox}>
          <TouchableOpacity
            style={styles.translateIcon}
            onPress={() => onTranslate?.(segment!)}
          >
            <Ionicons name="language-outline" size={18} color={Colors.tint} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shadowingIcon}
            onPress={() => {
              if (segment) {
                router.push({
                  pathname: "/(screens)/shadowing-practice",
                  params: {
                    youtubeId: youtubeId,
                    transcript: text,
                    startSec: segment.start_sec,
                    endSec: segment.end_sec,
                    cefr: segment.cefr, // Pass the CEFR level
                  },
                });
              }
            }}
          >
            <Ionicons name="mic-outline" size={18} color={Colors.tint} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }
);

export default TranscriptLine;

const styles = StyleSheet.create({
  transcriptLine: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 10,
    marginBottom: 4,
    borderRadius: 8,
    position: "relative", // Added to position the time badge
  },
  transcriptLineActive: {
    // Remove background color, add shadow for active transcript
    backgroundColor: Colors.white,
    shadowColor: Colors.tint,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    borderWidth: 1.5,
    borderColor: Colors.tint,
  },
  lineInfoContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginRight: 8,
  },
  segmentTimeContainer: {
    backgroundColor: Colors.background,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 4,
    minWidth: 40,
    alignItems: "center",
    marginBottom: 4,
  },
  segmentTimeText: {
    fontSize: 12,
    color: Colors.softText,
    fontWeight: "500",
  },
  cefrBadge: {
    backgroundColor: Colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 4,
    minWidth: 40,
    alignItems: "center",
  },
  cefrText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: "700",
  },
  transcriptText: { flex: 1, color: Colors.black, fontSize: 15 },
  wordText: {
    // New style for individual words
    flexDirection: "row",
  },
  underlineWord: {
    textDecorationLine: "underline",
    color: Colors.tint,
    fontWeight: "600",
  },
  translateBox: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  translateIcon: { marginVertical: 6 },
  shadowingIcon: { marginVertical: 6 },
});
