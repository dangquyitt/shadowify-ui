import { Colors } from "@/constants/colors";
import { sttApi } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DictionaryModal from "./dictionary-modal";

interface STTModalProps {
  visible: boolean;
  onClose: () => void;
}

interface STTResult {
  cefr: string;
  meaning_en: string;
  meaning_vi: string;
}

export const STTModal: React.FC<STTModalProps> = ({ visible, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<STTResult | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSound, setPlaybackSound] = useState<Audio.Sound | null>(null);
  const [dictionaryModalVisible, setDictionaryModalVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>("");

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isMounted = useRef(true);

  // Request audio permissions and set up audio mode
  React.useEffect(() => {
    let isMountedLocal = true;

    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (!isMountedLocal) return;

        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please allow microphone access to use this feature."
          );
          return;
        }

        // Set audio mode for iOS
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } catch (error) {
        console.error("Audio permission error:", error);
      }
    })();

    return () => {
      isMountedLocal = false;
    };
  }, []);

  // Pulse animation for record button
  React.useEffect(() => {
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
    return () => {
      if (anim) {
        anim.stop();
      }
    };
  }, [isRecording]);

  // Clean up recording on unmount
  React.useEffect(() => {
    return () => {
      isMounted.current = false;

      // Clean up any ongoing recording when component unmounts
      if (recording) {
        (async () => {
          try {
            recording.setOnRecordingStatusUpdate(null);
            await recording.stopAndUnloadAsync();
          } catch (error) {
            console.error("Error cleaning up recording:", error);
          }
        })();
      }
    };
  }, []);

  const handleRecording = async () => {
    try {
      if (!isRecording) {
        // Make sure any existing recording is properly cleaned up
        if (recording) {
          recording.setOnRecordingStatusUpdate(null);
          await recording.stopAndUnloadAsync();
        }

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        console.log("🎤 Created recording with HIGH_QUALITY preset");

        // Set up status monitoring
        newRecording.setOnRecordingStatusUpdate((status) => {
          // Status update handling if needed
        });

        if (isMounted.current) {
          setRecording(newRecording);
          setHasStartedRecording(true);
          setIsRecording(true);
          setResult(null);
        }

        await newRecording.startAsync();
      } else {
        if (recording) {
          // Remove status updates listener
          recording.setOnRecordingStatusUpdate(null);

          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();

          if (isMounted.current) {
            setRecording(null);
            setHasStartedRecording(false);
            setIsRecording(false);
            setAudioUri(uri); // Save audio URI for playback
          }

          // Only try to upload if we've actually recorded something
          if (uri && hasStartedRecording && isMounted.current) {
            await processRecording(uri);
          }
        }
      }
    } catch (err) {
      console.error("Recording error", err);
      if (isMounted.current) {
        setHasStartedRecording(false);
        setIsRecording(false);
        Alert.alert("Error", "Failed to record audio. Please try again.");
      }
    }
  };

  const processRecording = async (uri: string) => {
    try {
      if (!isMounted.current) return;
      setIsLoading(true);

      // Make sure the uri isn't empty
      if (!uri) {
        console.warn("No URI provided for recording");
        return;
      }

      console.log("🎵 Processing audio file:", uri);

      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        console.warn("Audio file not found:", uri);
        if (hasStartedRecording && isMounted.current) {
          Alert.alert(
            "Recording file missing",
            "Audio file was not found. Please try again."
          );
        }
        return;
      }

      console.log("📁 File info:", fileInfo);

      // Read the file as base64 for API
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("📀 Base64 length:", base64.length);
      console.log("📀 Base64 preview:", base64.substring(0, 100) + "...");

      try {
        // Send to STT API
        console.log("🚀 Calling STT API...");
        const sttResult = await sttApi.evaluate(base64);
        console.log("✅ STT Result:", sttResult);

        if (isMounted.current) {
          setResult(sttResult);
        }
      } catch (apiErr) {
        console.error("STT API call failed:", apiErr);
        if (isMounted.current) {
          Alert.alert(
            "Error",
            `Failed to process audio: ${apiErr.message || "Unknown error"}`
          );
        }
      }
    } catch (err) {
      console.error("Processing failed", err);
      if (isMounted.current) {
        Alert.alert("Error", "Failed to process audio");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const handleMicPress = async () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    await handleRecording();
  };

  const playAudio = async () => {
    if (!audioUri) return;

    try {
      if (isPlaying) {
        // Stop current playback
        if (playbackSound) {
          await playbackSound.stopAsync();
          await playbackSound.unloadAsync();
          setPlaybackSound(null);
        }
        setIsPlaying(false);
      } else {
        // Start playback
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );

        setPlaybackSound(sound);
        setIsPlaying(true);

        // Listen for playback status
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
            sound.unloadAsync();
            setPlaybackSound(null);
          }
        });
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Error", "Failed to play audio");
    }
  };

  const handleWordPress = (word: string) => {
    // Clean the word (remove punctuation and convert to lowercase)
    const cleanWord = word
      .replace(/[.,!?;:'"]/g, "")
      .toLowerCase()
      .trim();
    if (cleanWord) {
      setSelectedWord(cleanWord);
      setDictionaryModalVisible(true);
    }
  };

  const renderClickableText = (text: string) => {
    const words = text.split(" ");
    return (
      <Text style={styles.resultValue}>
        {words.map((word, index) => (
          <Text key={index}>
            <TouchableOpacity onPress={() => handleWordPress(word)}>
              <Text style={styles.clickableWord}>{word}</Text>
            </TouchableOpacity>
            {index < words.length - 1 ? " " : ""}
          </Text>
        ))}
      </Text>
    );
  };

  const handleClose = () => {
    if (isRecording && recording) {
      recording.setOnRecordingStatusUpdate(null);
      recording.stopAndUnloadAsync();
      setRecording(null);
      setIsRecording(false);
      setHasStartedRecording(false);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }

    // Clean up audio playback
    if (playbackSound) {
      playbackSound.unloadAsync();
      setPlaybackSound(null);
    }
    setIsPlaying(false);

    setResult(null);
    setAudioUri(null);
    onClose();
  };

  const getCefrColor = (cefr: string) => {
    switch (cefr.toUpperCase()) {
      case "A1":
        return Colors.cefrA1;
      case "A2":
        return Colors.cefrA2;
      case "B1":
        return Colors.cefrB1;
      case "B2":
        return Colors.cefrB2;
      case "C1":
        return Colors.cefrC1;
      case "C2":
        return Colors.cefrC2;
      default:
        return Colors.tint;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="mic" size={20} color={Colors.tint} />
            </View>
            <Text style={styles.title}>Speech Recognition</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.darkGrey} />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Microphone Section */}
          <View style={styles.micSection}>
            <Text style={styles.instruction}>
              {isRecording
                ? "Recording... Tap to stop"
                : "Tap to start recording"}
            </Text>

            <TouchableOpacity
              onPress={handleMicPress}
              disabled={isLoading}
              style={styles.micContainer}
            >
              <Animated.View
                style={[
                  styles.micButton,
                  {
                    transform: [
                      { scale: scaleAnim },
                      { scale: isRecording ? pulseAnim : 1 },
                    ],
                    backgroundColor: isRecording
                      ? Colors.tint
                      : Colors.background,
                  },
                ]}
              >
                <Ionicons
                  name={isRecording ? "stop" : "mic"}
                  size={40}
                  color={isRecording ? Colors.white : Colors.tint}
                />
              </Animated.View>
            </TouchableOpacity>

            {isLoading && (
              <Text style={styles.loadingText}>Processing your speech...</Text>
            )}
          </View>

          {/* Result Section */}
          {result && (
            <View style={styles.resultSection}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Analysis Result</Text>
                {audioUri && (
                  <TouchableOpacity
                    onPress={playAudio}
                    style={styles.playButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isPlaying ? "pause" : "play"}
                      size={20}
                      color={Colors.white}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* CEFR Level */}
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>CEFR Level</Text>
                <View
                  style={[
                    styles.cefrBadge,
                    { backgroundColor: getCefrColor(result.cefr) },
                  ]}
                >
                  <Text style={styles.cefrText}>
                    {result.cefr.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* English Meaning */}
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>English Meaning</Text>
                {renderClickableText(result.meaning_en)}
              </View>

              {/* Vietnamese Meaning */}
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Vietnamese Meaning</Text>
                <Text style={styles.resultValue}>{result.meaning_vi}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Dictionary Modal */}
        {dictionaryModalVisible && (
          <DictionaryModal
            word={selectedWord}
            onClose={() => setDictionaryModalVisible(false)}
          />
        )}
      </View>
    </Modal>
  );
};

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGrey,
    backgroundColor: Colors.white,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  micSection: {
    alignItems: "center",
    paddingVertical: 60,
  },
  instruction: {
    fontSize: 16,
    color: Colors.softText,
    marginBottom: 40,
    textAlign: "center",
  },
  micContainer: {
    marginBottom: 20,
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.tint,
    fontStyle: "italic",
  },
  resultSection: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.tint,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  resultItem: {
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.darkGrey,
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 16,
    color: Colors.black,
    lineHeight: 24,
  },
  clickableWord: {
    color: Colors.tint,
    textDecorationLine: "underline",
  },
  cefrBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cefrText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
});
