import { MarkedText } from "@/components/marked-text";
import { ShadowingRecorder } from "@/components/shadowing-recorder";
import { compareTexts, TextComparisonResult } from "@/utils/textComparison";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { Colors } from "../../constants/Colors";

const VIDEO_HEIGHT = (Dimensions.get("window").width * 9) / 16;

export default function ShadowingPracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const youtubeId = params.youtubeId as string;
  const transcript = params.transcript as string;
  const startSec = Number(params.startSec) || 0;
  const endSec = Number(params.endSec) || 0;

  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [accuracy, setAccuracy] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [textComparison, setTextComparison] =
    useState<TextComparisonResult | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioSound, setAudioSound] = useState<Audio.Sound | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const playerRef = useRef(null);

  // Auto-pause video when recording
  useEffect(() => {
    if (isPlayerReady && isRecording) {
      setIsPaused(true);
    }
  }, [isRecording, isPlayerReady]);

  // Handle video state changes to ensure proper looping from start point
  const handleStateChange = (state: string) => {
    if (state === "ended" && playerRef.current) {
      // Khi video kết thúc, quay lại điểm bắt đầu và tự động phát lại
      playerRef.current.seekTo(startSec, true);
      setIsPaused(false);
    }
  };

  // Sử dụng useEffect để theo dõi vị trí video và loop lại khi cần thiết
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (!isPaused && playerRef.current && endSec) {
      intervalId = setInterval(async () => {
        try {
          const currentTime = await playerRef.current.getCurrentTime();
          if (currentTime >= endSec) {
            playerRef.current.seekTo(startSec, true);
          }
        } catch (err) {
          console.error("Error checking video position:", err);
        }
      }, 500);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPaused, endSec, startSec]);

  // Cleanup audio resources when component unmounts
  useEffect(() => {
    return () => {
      if (audioSound) {
        audioSound.unloadAsync();
      }
    };
  }, [audioSound]);

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
  };

  const handleRecordingComplete = (
    text: string,
    accuracyScore: number,
    recordingUri?: string
  ) => {
    setIsRecording(false);
    setHasRecorded(true);
    setSpokenText(text);

    // Save the audio URI if available
    if (recordingUri) {
      setAudioUri(recordingUri);
      console.log("Audio saved at:", recordingUri);
    }

    // Compare the spoken text with the original transcript
    const comparison = compareTexts(transcript || "", text);
    setTextComparison(comparison);
    setAccuracy(comparison.accuracy);
  };

  const handlePlayRecording = async () => {
    if (!audioUri) {
      Alert.alert("Error", "No recording found to play");
      return;
    }

    try {
      if (isPlayingAudio && audioSound) {
        // If already playing, stop it
        await audioSound.stopAsync();
        await audioSound.unloadAsync();
        setAudioSound(null);
        setIsPlayingAudio(false);
      } else {
        // Load and play the audio
        setIsPlayingAudio(true);

        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );

        setAudioSound(sound);

        // When playback finishes
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlayingAudio(false);
          }
        });
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Playback Error", "Failed to play recording");
      setIsPlayingAudio(false);
    }
  };

  const handleRecordAgain = async () => {
    // Cleanup audio resources before resetting
    if (audioSound) {
      try {
        await audioSound.stopAsync();
        await audioSound.unloadAsync();
        setAudioSound(null);
        setIsPlayingAudio(false);
      } catch (error) {
        console.error("Error cleaning up audio:", error);
      }
    }

    setHasRecorded(false);
    setSpokenText("");
    setAccuracy(0);
    setTextComparison(null);
    setAudioUri(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeftBlock}>
          <TouchableOpacity
            style={styles.backBtnBlock}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenterBlock}>
          <Text style={styles.headerTitle}>Shadowing Practice</Text>
        </View>
        <View style={{ width: 48 }} />
      </View>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        <YoutubePlayer
          ref={playerRef}
          height={VIDEO_HEIGHT}
          play={!isPaused}
          videoId={youtubeId}
          onReady={() => {
            setIsPlayerReady(true);
            // Make sure it starts at the correct position when first loaded
            if (playerRef.current) {
              playerRef.current.seekTo(startSec, true);
            }
          }}
          onChangeState={handleStateChange}
          initialPlayerParams={{
            loop: false, // We'll handle looping manually for more control
            start: startSec,
            end: endSec,
            controls: true, // Sử dụng controls của YouTube
            modestbranding: true,
            showinfo: false,
            rel: false,
            fs: false,
            iv_load_policy: 3,
            cc_load_policy: 0,
            disablekb: true,
          }}
        />
      </View>

      {/* Main Content ScrollView */}
      <ScrollView
        style={styles.contentScrollView}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Transcript */}
        <View style={styles.transcriptContainer}>
          <View style={styles.transcriptHeader}>
            <Text style={styles.transcriptTitle}>Original Transcript</Text>
            <TouchableOpacity style={styles.bookmarkButton}>
              <Feather name="bookmark" size={20} color={Colors.black} />
            </TouchableOpacity>
          </View>
          <View style={styles.transcriptBox}>
            {hasRecorded && textComparison ? (
              <MarkedText markedWords={textComparison.markedOriginalWords} />
            ) : (
              <Text style={styles.transcriptText}>{transcript}</Text>
            )}
          </View>
        </View>

        {/* Spoken text result (only shown if has recorded) */}
        {hasRecorded && textComparison && (
          <View style={styles.speechResultContainer}>
            <View style={styles.speechResultHeader}>
              <Text style={styles.speechResultTitle}>Your Speech</Text>
            </View>
            <View style={styles.speechResultBox}>
              <MarkedText markedWords={textComparison.markedSpokenWords} />
            </View>
          </View>
        )}

        {/* Free trial indicator */}
        <View style={styles.trialContainer}>
          <Feather name="clock" size={16} color={Colors.black} />
          <Text style={styles.trialText}>Free for Today: 5 mins remaining</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: "70%" }]} />
        </View>
      </ScrollView>

      {/* Recording controls or results - always visible at the bottom */}
      <View style={styles.recorderFooter}>
        {!hasRecorded ? (
          <ShadowingRecorder
            isRecording={isRecording}
            toggleRecording={toggleRecording}
            onRecordingComplete={handleRecordingComplete}
          />
        ) : (
          <View style={styles.resultsContainer}>
            {/* Record Again Button (Left) */}
            <TouchableOpacity
              style={styles.resultButton}
              onPress={handleRecordAgain}
              accessibilityLabel="Record again"
            >
              <MaterialIcons name="replay" size={24} color={Colors.tint} />
              <Text style={styles.resultButtonText}>Record Again</Text>
            </TouchableOpacity>

            {/* Accuracy Circle (Middle) */}
            <View style={styles.accuracyCircleContainer}>
              <View style={styles.accuracyCircle}>
                <Text style={styles.accuracyText}>{accuracy}%</Text>
              </View>
              <Text style={styles.accuracyLabel}>Accuracy</Text>
            </View>

            {/* My Record Button (Right) */}
            <TouchableOpacity
              style={styles.resultButton}
              onPress={handlePlayRecording}
              accessibilityLabel={
                isPlayingAudio ? "Stop playing" : "Play my recording"
              }
            >
              <MaterialIcons
                name={isPlayingAudio ? "stop-circle" : "play-circle-filled"}
                size={24}
                color={Colors.tint}
              />
              <Text style={styles.resultButtonText}>
                {isPlayingAudio ? "Stop" : "My Record"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  headerLeftBlock: {
    width: 48,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backBtnBlock: {
    padding: 8,
    backgroundColor: Colors.white,
    borderRadius: 20,
    elevation: 2,
  },
  headerCenterBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
  },
  videoContainer: {
    width: "100%",
    height: VIDEO_HEIGHT,
    backgroundColor: Colors.black,
  },
  contentScrollView: {
    flex: 1,
  },
  transcriptContainer: {
    margin: 16,
  },
  transcriptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  transcriptTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  bookmarkButton: {
    padding: 4,
  },
  transcriptBox: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
  },
  transcriptText: {
    fontSize: 16,
    color: Colors.black,
    lineHeight: 24,
  },
  recorderFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  resultsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  accuracyCircleContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  accuracyCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.background,
    borderWidth: 3,
    borderColor: Colors.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  accuracyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.tint,
  },
  accuracyLabel: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.darkGrey,
  },
  resultButton: {
    alignItems: "center",
    paddingHorizontal: 10,
    width: 90,
  },
  resultButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.darkGrey,
    textAlign: "center",
  },
  speechResultContainer: {
    margin: 16,
  },
  speechResultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  speechResultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  speechResultBox: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
  },
  speechResultText: {
    fontSize: 16,
    color: Colors.black,
    lineHeight: 24,
  },
  trialContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  trialText: {
    fontSize: 14,
    color: Colors.darkGrey,
    marginLeft: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 3,
    marginHorizontal: 40,
    marginBottom: 16,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    backgroundColor: Colors.tint,
    borderRadius: 3,
  },
});

export const options = {
  headerShown: false,
};
