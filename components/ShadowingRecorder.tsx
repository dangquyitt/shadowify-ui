import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";

interface ShadowingRecorderProps {
  onRecordingComplete: (text: string, accuracy: number) => void;
  isRecording: boolean;
  toggleRecording: () => void;
}

export function ShadowingRecorder({
  onRecordingComplete,
  isRecording,
  toggleRecording,
}: ShadowingRecorderProps) {
  const [pulseAnim] = useState(new Animated.Value(1));

  // Recording animation effect
  useEffect(() => {
    let animation: Animated.CompositeAnimation;

    if (isRecording) {
      // Create a pulse animation when recording
      animation = Animated.loop(
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
      animation.start();
    } else {
      // Reset animation when not recording
      pulseAnim.setValue(1);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isRecording, pulseAnim]);

  // Mock recording completion after 3 seconds
  useEffect(() => {
    let timeout: number;

    if (isRecording) {
      timeout = setTimeout(() => {
        // Mock data - pretend we got a transcript and accuracy score
        const mockText = "This is JFK Airport in New York.";
        const mockAccuracy = Math.floor(Math.random() * 50) + 50; // 50-100%

        onRecordingComplete(mockText, mockAccuracy);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [isRecording, onRecordingComplete]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={toggleRecording}
        style={[styles.recordButton, isRecording && styles.recordingButton]}
        activeOpacity={0.7}
        accessibilityLabel={isRecording ? "Stop recording" : "Start recording"}
      >
        <Ionicons name={isRecording ? "stop" : "mic"} size={28} color={Colors.white} />
      </TouchableOpacity>
      <Text style={styles.recordText}>
        {isRecording ? "Tap to stop" : "Record"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
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
