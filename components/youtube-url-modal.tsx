import { Colors } from "@/constants/colors";
import { videoApi } from "@/services/api";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type YouTubeURLModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const YouTubeURLModal = ({ visible, onClose }: YouTubeURLModalProps) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleImport = async () => {
    if (!url.trim()) {
      Alert.alert("Error", "Please enter a YouTube URL or video ID");
      return;
    }

    setIsLoading(true);
    try {
      const videoId = await videoApi.createVideo(url);
      setIsLoading(false);
      onClose();
      setUrl("");

      // Navigate to video detail screen with the new video ID
      router.push({
        pathname: "/(screens)/video-detail",
        params: { id: videoId },
      });
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert("Error", error.message || "Failed to import video");
    }
  };

  const handleOpenYouTube = () => {
    router.push({
      pathname: "https://youtube.com",
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      presentationStyle="overFullScreen" // Added presentation style
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => {
          // Prevent flicker by delaying the close action slightly
          setTimeout(onClose, 50);
        }}
      >
        <TouchableOpacity
          style={styles.container}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.title}>Import Video</Text>

          <TextInput
            style={styles.input}
            placeholder="Paste a YouTube URL or ID"
            placeholderTextColor={Colors.lightGrey}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.openYouTubeButton}
              onPress={handleOpenYouTube}
            >
              <Text style={styles.openYouTubeButtonText}>Open YouTube</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.importButton}
              onPress={handleImport}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.importButtonText}>Import</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    width: "75%",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: "center",
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "500",
    marginBottom: 20,
    color: "#555",
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 100,
    paddingHorizontal: 18,
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 16,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 5,
  },
  openYouTubeButton: {
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.primary,
    flex: 1,
    marginRight: 12,
    alignItems: "center",
    backgroundColor: "white",
    maxWidth: "48%",
  },
  openYouTubeButtonText: {
    color: Colors.primary,
    fontWeight: "500",
    fontSize: 14,
  },
  importButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderRadius: 100,
    flex: 1,
    alignItems: "center",
    maxWidth: "48%",
  },
  importButtonText: {
    color: Colors.white,
    fontWeight: "500",
    fontSize: 14,
  },
});
