// TranscriptLine.tsx
import { Colors } from "@/constants/Colors";
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
  onTranslate?: (text: string) => void;
  segment?: Segment;
  onMicPress?: (segment: Segment) => void;
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
        {segment?.start_sec !== undefined && (
          <View style={styles.segmentTimeContainer}>
            <Text style={styles.segmentTimeText}>{startTime}</Text>
          </View>
        )}
        <Text style={styles.transcriptText}>
          {words.map((word, idx) => (
            <Text
              key={idx}
              style={isActive ? styles.underlineWord : undefined}
              onPress={() =>
                onWordPress && onWordPress(word.replace(/[^a-zA-Z']/g, ""))
              }
              suppressHighlighting
            >
              {word + (idx < words.length - 1 ? " " : "")}
            </Text>
          ))}
        </Text>
        <View style={styles.translateBox}>
          <TouchableOpacity
            style={styles.translateIcon}
            onPress={() => onTranslate?.(text)}
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
  segmentTimeContainer: {
    marginRight: 8,
    backgroundColor: Colors.background,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 4,
    minWidth: 40,
    alignItems: "center",
  },
  segmentTimeText: {
    fontSize: 12,
    color: Colors.softText,
    fontWeight: "500",
  },
  transcriptText: { flex: 1, color: Colors.black, fontSize: 15 },
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
