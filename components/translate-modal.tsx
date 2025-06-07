import { Colors } from "@/constants/Colors";
import { Segment } from "@/types/segment";
import { Video } from "@/types/video";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MockTranslateAPI } from "./mock-translate-api";

export default function TranslateModal({
  source,
  video,
  segment,
  onClose,
}: {
  source: string;
  segment: Segment;
  video: Video;
  onClose: () => void;
}) {
  const { router } = require("expo-router");
  const [result, setResult] = React.useState<string | null>(null);

  return (
    <View style={styles.dictModalOverlay}>
      <View style={styles.dictModalBox}>
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
          Dịch câu
        </Text>
        <Text style={{ color: Colors.softText, marginBottom: 8 }}>
          {source}
        </Text>
        {result ? (
          <>
            <Text
              style={{ fontSize: 15, color: Colors.black, marginBottom: 20 }}
            >
              {result}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  // Navigate to the shadowing-practice screen
                  if (segment) {
                    router.push({
                      pathname: "/(screens)/shadowing-practice",
                      params: {
                        youtubeId: video.youtube_id,
                        transcript: source,
                        startSec: segment.start_sec,
                        endSec: segment.end_sec,
                      },
                    });
                  }
                }}
                style={{ marginRight: 16 }}
                accessibilityLabel="Shadowing"
              >
                <Ionicons name="mic-outline" size={24} color={Colors.tint} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} accessibilityLabel="Đóng">
                <Text style={{ color: Colors.tint, fontWeight: "bold" }}>
                  Đóng
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <MockTranslateAPI text={source} onResult={setResult} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dictModalOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.darkGrey + "99", // semi-transparent overlay
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
  },
  dictModalBox: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    minWidth: 260,
    maxWidth: 340,
    alignItems: "flex-start",
    elevation: 10,
    shadowColor: Colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
});
