import DictionaryModal from "@/components/dictionary-modal";
import { MarkedText } from "@/components/marked-text";
import { ShadowingRecorder } from "@/components/shadowing-recorder";
import { sentencesApi, videoApi } from "@/services/api";
import { compareTexts, TextComparisonResult } from "@/utils/text-comparison";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { Colors } from "../../constants/colors";

const VIDEO_HEIGHT = (Dimensions.get("window").width * 9) / 16;

export default function ShadowingPracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const youtubeId = params.youtubeId as string;
  console.log("YouTube ID:", youtubeId);
  const transcript = params.transcript as string;
  const startSec = Number(params.startSec) || 0;
  const endSec = Number(params.endSec) || 0;
  const cefr = params.cefr as string; // Add CEFR level from params
  const segmentId = params.segmentId as string; // Get segmentId from params

  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [accuracy, setAccuracy] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [textComparison, setTextComparison] =
    useState<TextComparisonResult | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false); // Track if this segment is saved
  const [isLoading, setIsLoading] = useState(true); // Loading state for API calls
  const [isLoadingSegment, setIsLoadingSegment] = useState(false); // Loading state for segment data
  const [savingBookmark, setSavingBookmark] = useState(false); // Thêm state để theo dõi trạng thái đang lưu bookmark

  const bookmarkScaleAnim = useRef(new Animated.Value(1)).current; // Animation value for bookmark button

  const playerRef = useRef(null);
  const audioPlayer = useAudioPlayer();
  const audioSubscriptionRef = useRef(null);

  // Auto-pause video when recording
  useEffect(() => {
    if (isPlayerReady && isRecording) {
      setIsPaused(true);
    }
  }, [isRecording, isPlayerReady]);

  // Check if the segment is already saved when component mounts
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (segmentId) {
        try {
          setIsLoading(true);
          const sentence =
            await sentencesApi.getSentencesBySegmentId(segmentId);
          setIsSaved(sentence !== null);
        } catch (error) {
          console.error("Failed to fetch sentence status:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkSavedStatus();
  }, [segmentId]);

  // Fetch segment data if only segmentId is provided
  useEffect(() => {
    const fetchSegmentData = async () => {
      if (segmentId && (!youtubeId || !transcript)) {
        try {
          setIsLoadingSegment(true);
          const segmentData = await videoApi.getSegmentById(segmentId);

          // Get video details to fetch YouTube ID
          const videoDetails = await videoApi.getVideoById(
            segmentData.video_id
          );

          // Update URL params with segment data
          router.setParams({
            youtubeId: videoDetails.youtube_id,
            transcript: segmentData.content,
            startSec: segmentData.start_sec.toString(),
            endSec: segmentData.end_sec.toString(),
            cefr: segmentData.cefr || "",
            segmentId, // Keep the segmentId
          });
        } catch (error) {
          console.error("Failed to fetch segment data:", error);
          Alert.alert(
            "Error",
            "Failed to load segment data. Please try again."
          );
        } finally {
          setIsLoadingSegment(false);
        }
      }
    };

    fetchSegmentData();
  }, [segmentId, youtubeId, transcript]);

  // Function to toggle save/unsave status
  const toggleSaveStatus = async () => {
    if (!segmentId || savingBookmark) return;

    // Start animation
    Animated.sequence([
      Animated.timing(bookmarkScaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(bookmarkScaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      setSavingBookmark(true);

      if (isSaved) {
        // Delete sentence if already saved
        const success =
          await sentencesApi.deleteSentencesBySegmentId(segmentId);
        if (success) {
          setIsSaved(false);
        }
      } else {
        // Save sentence if not already saved
        await sentencesApi.createSentence(segmentId, transcript);
        setIsSaved(true);
      }
    } catch (error: any) {
      console.error("Failed to toggle save status:", error);
      // Hiển thị lỗi chi tiết để debug
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error?.message ||
        "Unknown error occurred";

      Alert.alert(
        "Error",
        isSaved
          ? `Failed to remove from saved items: ${errorMessage}`
          : `Failed to save item: ${errorMessage}`
      );
    } finally {
      setSavingBookmark(false);
    }
  };

  // Handle video state changes to ensure proper looping from start point
  const handleStateChange = (state: string) => {
    if (state === "ended" && playerRef.current) {
      // Khi video kết thúc, quay lại điểm bắt đầu và tự động phát lại
      playerRef.current.seekTo(startSec, true);
      setIsPaused(false);
    }
  };

  useEffect(() => {
    if (!isPlayerReady || !playerRef.current || !endSec) return;

    const intervalId = setInterval(async () => {
      try {
        const currentTime = await playerRef.current.getCurrentTime();
        if (currentTime >= endSec) {
          playerRef.current.seekTo(startSec, true);
        }
      } catch (err) {
        console.error("Error checking video time:", err);
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [isPlayerReady, endSec, startSec]);

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

  // Ensure audioPlayer is properly initialized and handle playback correctly
  const handlePlayRecording = async () => {
    if (!audioUri) {
      Alert.alert("Error", "No recording found to play");
      return;
    }

    try {
      if (isPlayingAudio) {
        // If already playing, stop it
        try {
          audioPlayer.pause();
        } catch (pauseError) {
          console.warn("Error pausing audio:", pauseError);
        }
        setIsPlayingAudio(false);
      } else {
        // Remove previous listener if exists
        if (audioSubscriptionRef.current) {
          audioSubscriptionRef.current.remove();
          audioSubscriptionRef.current = null;
        }

        // Load and play the audio
        setIsPlayingAudio(true);

        await audioPlayer.replace({ uri: audioUri });
        await audioPlayer.play();

        // Add listener for playback completion
        audioSubscriptionRef.current = audioPlayer.addListener(
          "playbackStatusUpdate",
          (status) => {
            if (status.didJustFinish) {
              setIsPlayingAudio(false);
              if (audioSubscriptionRef.current) {
                audioSubscriptionRef.current.remove();
                audioSubscriptionRef.current = null;
              }
            }
          }
        );
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Playback Error", "Failed to play recording");
      setIsPlayingAudio(false);
    }
  };

  // Cleanup audio resources when recording again or leaving the screen
  useEffect(() => {
    return () => {
      // Clean up listener
      if (audioSubscriptionRef.current) {
        audioSubscriptionRef.current.remove();
        audioSubscriptionRef.current = null;
      }
      // Release audio player
      if (audioPlayer) {
        try {
          audioPlayer.release();
        } catch (error) {
          console.warn("Error releasing audio player:", error);
        }
      }
    };
  }, []);

  const handleRecordAgain = async () => {
    // Stop current audio playback if playing
    if (isPlayingAudio) {
      try {
        audioPlayer.pause();
      } catch (error) {
        console.warn("Error pausing audio:", error);
      }
      setIsPlayingAudio(false);
    }

    // Clean up audio listener
    if (audioSubscriptionRef.current) {
      audioSubscriptionRef.current.remove();
      audioSubscriptionRef.current = null;
    }

    // Reset states
    setAudioUri(null);
    setHasRecorded(false);
    setSpokenText("");
    setAccuracy(0);
    setTextComparison(null);
  };

  const handleWordPress = (word: string) => {
    setSelectedWord(word);
  };

  const handleDictionaryClose = () => {
    setSelectedWord(null);
  };

  // Show loading indicator while fetching segment data
  if (isLoadingSegment) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.tint} />
        <Text style={{ marginTop: 20, color: Colors.black }}>
          Loading segment data...
        </Text>
      </SafeAreaView>
    );
  }

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
        <View style={styles.headerRightBlock}>
          {/* Bookmark button removed */}
        </View>
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
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={[
                  styles.cefrBadge,
                  {
                    backgroundColor: Colors[`cefr${cefr}`] || Colors.tint,
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    fontSize: 14,
                  },
                ]}
              >
                {cefr}
              </Text>
              <TouchableOpacity
                style={styles.bookmarkButton}
                onPress={toggleSaveStatus}
                disabled={savingBookmark}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={{ transform: [{ scale: bookmarkScaleAnim }] }}
                >
                  {savingBookmark ? (
                    <ActivityIndicator size="small" color={Colors.tint} />
                  ) : (
                    <MaterialIcons
                      name={isSaved ? "bookmark" : "bookmark-outline"}
                      size={24}
                      color={isSaved ? Colors.tint : Colors.darkGrey}
                    />
                  )}
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.transcriptBox}>
            {hasRecorded && textComparison ? (
              <MarkedText
                markedWords={textComparison.markedOriginalWords}
                onWordPress={handleWordPress}
              />
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
              <MarkedText
                markedWords={textComparison.markedSpokenWords}
                onWordPress={handleWordPress}
              />
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

      {/* Dictionary Modal */}
      {selectedWord && (
        <DictionaryModal word={selectedWord} onClose={handleDictionaryClose} />
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
    position: "relative",
  },
  headerLeftBlock: {
    width: 48,
    justifyContent: "center",
    alignItems: "flex-start",
    zIndex: 1,
  },
  backBtnBlock: {
    padding: 8,
    backgroundColor: Colors.white,
    borderRadius: 20,
    elevation: 2,
  },
  headerCenterBlock: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
    textAlign: "center",
  },
  headerRightBlock: {
    width: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    marginLeft: "auto",
    zIndex: 1,
  },
  savedButton: {
    padding: 4,
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
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
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
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  originalTranscript: {
    fontSize: 16,
    fontWeight: "bold",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  savedButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cefrBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: "white",
    fontWeight: "bold",
    marginRight: 10,
  },
});

export const options = {
  headerShown: false,
};
