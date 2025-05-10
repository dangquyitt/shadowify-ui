import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { ShadowingRecorder } from "../../components/ShadowingRecorder";
import { Colors } from "../../constants/Colors";

const VIDEO_HEIGHT = (Dimensions.get("window").width * 9) / 16;

export default function ShadowingPracticeScreen() {
  const router = useRouter();
  const { videoId, transcript, start, end } = useLocalSearchParams<{
    videoId: string;
    transcript: string;
    start: string;
    end: string;
  }>();

  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [accuracy, setAccuracy] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const playerRef = useRef(null);

  // Auto-pause video when recording
  useEffect(() => {
    if (isPlayerReady && isRecording) {
      setIsPaused(true);
    }
  }, [isRecording, isPlayerReady]);

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
  };

  const handleRecordingComplete = (text: string, accuracyScore: number) => {
    setIsRecording(false);
    setHasRecorded(true);
    setSpokenText(text);
    setAccuracy(accuracyScore);
  };

  const handlePlayRecording = () => {
    // Mock playing the recording - in real app would play audio file
    alert("Playing your recording...");
  };

  const handleRecordAgain = () => {
    setHasRecorded(false);
    setSpokenText("");
    setAccuracy(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shadowing Practice</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        <YoutubePlayer
          height={VIDEO_HEIGHT}
          play={!isPaused}
          videoId={videoId || "pyf8cbqyfPs"}
          onReady={() => setIsPlayerReady(true)}
          initialPlayerParams={{
            loop: true,
            start: parseInt(start, 10) || 0,
            end: parseInt(end, 10) || undefined,
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
            <Text style={styles.transcriptText}>{transcript}</Text>
          </View>
        </View>

        {/* Spoken text result (only shown if has recorded) */}
        {hasRecorded && (
          <View style={styles.speechResultContainer}>
            <View style={styles.speechResultHeader}>
              <Text style={styles.speechResultTitle}>Your Speech</Text>
            </View>
            <View style={styles.speechResultBox}>
              <Text style={styles.speechResultText}>{spokenText}</Text>
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
              accessibilityLabel="Play my recording"
            >
              <MaterialIcons
                name="play-circle-filled"
                size={24}
                color={Colors.tint}
              />
              <Text style={styles.resultButtonText}>My Record</Text>
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
  backButton: {
    padding: 8,
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
