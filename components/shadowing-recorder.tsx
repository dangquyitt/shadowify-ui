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
import { speechApi } from "../services/api";

type Props = {
  isRecording: boolean;
  toggleRecording: () => void;
  onRecordingComplete: (
    text: string,
    accuracy: number,
    audioUri?: string
  ) => void;
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
        Alert.alert("Permission to access microphone was denied");
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

  // Track whether we have actually started recording
  const [hasStartedRecording, setHasStartedRecording] = useState(false);

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
          setHasStartedRecording(true);
        } else {
          await recorder.stop();
          // stop animation reset
          pulseAnim.setValue(1);
          // Only try to upload if we've actually recorded something
          if (recorder.uri && hasStartedRecording) {
            await uploadRecording(recorder.uri);
          }
        }
      } catch (err) {
        console.error("Recording error", err);
      }
    };

    handleRecording();
  }, [isRecording, hasStartedRecording]);

  // Remove redundant saving of audio file to the cache directory
  const uploadRecording = async (uri: string) => {
    try {
      setIsUploading(true);

      // Make sure the uri isn't empty
      if (!uri) {
        console.warn("No URI provided for recording");
        return;
      }

      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        console.warn("Audio file not found:", uri);
        if (hasStartedRecording) {
          Alert.alert(
            "Recording file missing",
            "Audio file was not found. Maybe the app reloaded?"
          );
        }
        return;
      }

      // Read the original file as base64 for API
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      try {
        // Send to backend API using the speechApi service
        const transcribedText = await speechApi.transcribe(base64);

        // Call the callback with the transcribed text and the original URI
        onRecordingComplete(transcribedText, 0, uri); // Accuracy will be calculated by parent
      } catch (apiErr) {
        console.error("Speech API call failed:", apiErr);
        Alert.alert("Error", "Failed to process audio. Server error.");
        onRecordingComplete("Failed to transcribe audio", 0, uri);
      }
    } catch (err) {
      console.error("Upload failed", err);
      Alert.alert("Error", "Failed to process audio");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePress = async () => {
    // Only try to preview base64 if we've actually recorded something before
    if (!isRecording && hasStartedRecording && recorder.uri) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(recorder.uri);
        if (fileInfo.exists) {
          const b64 = await FileSystem.readAsStringAsync(recorder.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          console.log(
            "📀 Base64 on start press:",
            b64.substring(0, 100) + "..."
          );
        }
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
