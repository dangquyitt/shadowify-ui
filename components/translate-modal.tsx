import { Colors } from "@/constants/colors";
import { translateApi } from "@/services/api"; // Use the translate API from api.ts
import { Segment } from "@/types/segment";
import { Video } from "@/types/video";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

  React.useEffect(() => {
    const fetchTranslation = async () => {
      try {
        const translatedText = await translateApi.translateText(source);
        setResult(translatedText);
      } catch (error) {
        console.error("Error fetching translation:", error);
        setResult("Error fetching translation");
      }
    };

    fetchTranslation();
  }, [source]);

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
                        cefr: segment.cefr, // Pass the CEFR level
                        segmentId: segment.id, // Pass segment ID for saving functionality
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
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              minHeight: 60,
            }}
          >
            <ActivityIndicator size="small" />
            <Text style={{ color: "#888", marginTop: 8 }}>Đang dịch...</Text>
          </View>
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
