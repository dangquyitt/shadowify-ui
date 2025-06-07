import { Ionicons } from "@expo/vector-icons";
import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";

type Props = {
  isRecording: boolean;
  toggleRecording: () => void;
  onRecordingComplete: (text: string, accuracy: number) => void;
};

export const ShadowingRecorder = ({
  isRecording,
  toggleRecording,
  onRecordingComplete,
}: Props) => {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isUploading, setIsUploading] = useState(false);
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Microphone permission denied");
      }
    })();
  }, []);

  // pulse animation for record button
  useEffect(() => {
    let anim: Animated.CompositeAnimation;
    if (isRecording) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => anim && anim.stop();
  }, [isRecording]);

  useEffect(() => {
    const handleRecording = async () => {
      try {
        if (isRecording) {
          await recorder.prepareToRecordAsync();
          // log base64 of previous file (if exists)
          if (recorder.uri) {
            try {
              const prev = await FileSystem.readAsStringAsync(recorder.uri, {
                encoding: FileSystem.EncodingType.Base64,
              });
              console.log(
                "📀 Base64 on start:",
                prev.substring(0, 100) + "..."
              );
            } catch (e) {
              console.warn("Cannot preview base64", e);
            }
          }
          recorder.record();
        } else {
          await recorder.stop();
          // stop animation reset
          pulseAnim.setValue(1);
          if (recorder.uri) {
            await uploadRecording(recorder.uri);
          }
        }
      } catch (err) {
        console.error("Recording error", err);
      }
    };

    handleRecording();
  }, [isRecording]);

  const uploadRecording = async (uri: string) => {
    try {
      setIsUploading(true);

      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        console.warn("Audio file not found:", uri);
        Alert.alert(
          "Recording file missing",
          "Audio file was not found. Maybe the app reloaded?"
        );
        return;
      }

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Delete file after using it, don't keep it in cache
      await FileSystem.deleteAsync(uri, { idempotent: true });

      try {
        // Send to backend API
        const response = await fetch("http://localhost:8080/stt/transcribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audio_base64: base64,
          }),
        });

        const result = await response.json();
        if (result.code === "success" && result.data?.text) {
          // Call the callback with the transcribed text and a calculated accuracy (handled by parent)
          onRecordingComplete(result.data.text, 0); // Accuracy will be calculated by parent
        } else {
          throw new Error("Invalid response format");
        }
      } catch (apiErr) {
        console.error("API call failed:", apiErr);
        Alert.alert("Error", "Failed to process audio. Server error.");
        // Fallback to a mock result if API fails
        onRecordingComplete("Failed to transcribe audio", 0);
      }
    } catch (err) {
      console.error("Upload failed", err);
      Alert.alert("Error", "Failed to process audio");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePress = async () => {
    // preview base64 on manual start
    if (!isRecording && recorder.uri) {
      try {
        const b64 = await FileSystem.readAsStringAsync(recorder.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        console.log("📀 Base64 on start press:", b64.substring(0, 100) + "...");
      } catch (e) {
        console.warn("Preview error", e);
      }
    }
    toggleRecording();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          onPress={handlePress}
          style={[styles.recordButton, isRecording && styles.recordingButton]}
          activeOpacity={0.7}
          disabled={isUploading}
          accessibilityLabel={
            isRecording ? "Stop recording" : "Start recording"
          }
        >
          <Ionicons
            name={isRecording ? "stop" : "mic"}
            size={28}
            color={Colors.white}
          />
        </TouchableOpacity>
      </Animated.View>
      <Text style={styles.recordText}>
        {isRecording ? "Tap to stop" : "Record"}
      </Text>
      {isUploading && (
        <ActivityIndicator
          style={{ marginTop: 10 }}
          size="small"
          color="#999"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  // Record button styles
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.tint,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1,
  },
  recordingButton: {
    backgroundColor: Colors.tabIconDefault,
  },
  recordText: {
    marginTop: 10,
    color: Colors.darkGrey,
    fontSize: 16,
  },
});
