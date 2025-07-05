import DictionaryModal from "@/components/dictionary-modal";
import ShadowingControls from "@/components/shadowing-controls";
import SpeedModal from "@/components/speed-modal";
import TranscriptLine from "@/components/transcript-line";
import TranslateModal from "@/components/translate-modal";
import { Colors } from "@/constants/colors";
import { useSegments } from "@/hooks/use-segments";
import { useVideo } from "@/hooks/use-videos";
import { Segment } from "@/types/segment";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

// Will be replaced with actual user data in a future implementation
const MOCK_USER = {
  name: "Dina OG kpop stan since 1998",
  avatar:
    "https://yt3.ggpht.com/ytc/AIdro_nF4i4VwE6w0wYw6KZ2Jg5wLw=s88-c-k-c0x00ffffff-no-rj",
};

export const options = {
  headerShown: false,
};

export default function VideoDetailScreen() {
  const playerRef = useRef<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const params = useLocalSearchParams();
  const id = typeof params.id === "string" ? params.id : "";
  const lineRefs = useRef<Record<string, View | null>>({});

  const {
    video,
    isLoading: isLoadingVideo,
    error: videoError,
    isFavorite,
    toggleFavorite,
  } = useVideo(id);
  const {
    segments,
    isLoading: isLoadingSegments,
    error: segmentsError,
  } = useSegments(id);

  const [currentLine, setCurrentLine] = useState<string>("");
  const [paused, setPaused] = useState(true);
  const [showSpeed, setShowSpeed] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showDictionary, setShowDictionary] = useState(false);
  const [dictionaryWord, setDictionaryWord] = useState<string | null>(null);
  const [liveSubActive, setLiveSubActive] = useState(false);
  const [repeatActive, setRepeatActive] = useState(false);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  // Translate modal state
  const [showTranslate, setShowTranslate] = useState(false);
  const [translateSegment, setTranslateSegment] = useState<Segment | null>(
    null
  ); // Store the segment directly

  // Real duration/position from YoutubePlayer
  const [duration, setDuration] = useState<number>(0);
  // position = currentTime
  const position = currentTime;
  const percent = duration > 0 ? (position / duration) * 100 : 0;

  const scrollViewRef = useRef<ScrollView>(null);

  function handleWordPress(word: string) {
    setDictionaryWord(word);
    setShowDictionary(true);
    setPaused(true); // Pause the video when showing the dictionary modal
  }

  function handleDictionaryClose() {
    setShowDictionary(false);
    // Don't auto-resume playback as it might be jarring for the user
    // User can manually play again if desired
  }

  function handleTranslate(segment: Segment) {
    setTranslateSegment(segment);
    setShowTranslate(true);
  }

  // Function to scroll to a specific segment
  const scrollToSegment = (segmentId: string) => {
    const segmentRef = lineRefs.current[segmentId];
    if (segmentRef && scrollViewRef.current) {
      segmentRef.measureLayout(
        scrollViewRef.current as any,
        (x, y, width, height) => {
          // Calculate scroll position to center the segment
          const scrollY = Math.max(0, y - scrollViewHeight / 2 + height / 2);
          scrollViewRef.current?.scrollTo({
            y: scrollY,
            animated: true,
          });
        },
        () => {
          // Fallback if measureLayout fails
        }
      );
    }
  };

  // Set current line to first segment when segments load
  useEffect(() => {
    if (segments.length > 0 && !currentLine) {
      setCurrentLine(segments[0].id);
    }
  }, [segments]);

  // Handle live sub activation - scroll to current segment immediately
  useEffect(() => {
    if (liveSubActive && segments.length > 0 && currentTime > 0) {
      const foundSegment = segments.find(
        (seg) =>
          typeof seg.start_sec === "number" &&
          typeof seg.end_sec === "number" &&
          currentTime >= seg.start_sec &&
          currentTime < seg.end_sec
      );

      if (foundSegment) {
        setCurrentLine(foundSegment.id);
        scrollToSegment(foundSegment.id);
      }
    }
  }, [liveSubActive]);

  // Handle seeking to a specific time in the video
  function handleSeek(time: number) {
    if (playerRef.current && typeof time === "number") {
      playerRef.current.seekTo(time, true);
      setCurrentTime(time);

      // Also update the current line based on the seek position
      if (segments.length) {
        const foundSegment = segments.find(
          (seg) =>
            typeof seg.start_sec === "number" &&
            typeof seg.end_sec === "number" &&
            time >= seg.start_sec &&
            time < seg.end_sec
        );

        if (foundSegment) {
          setCurrentLine(foundSegment.id);
        }
      }

      // Optionally resume playback after seeking
      setPaused(false);
    }
  }

  // Seek video to segment start when clicking transcript
  function handleTranscriptLinePress(segment: Segment) {
    setCurrentLine(segment.id);
    if (playerRef.current && typeof segment.start_sec === "number") {
      playerRef.current.seekTo(segment.start_sec, true);
      setCurrentTime(segment.start_sec);
      setPaused(false);
    }
  }

  // Periodically fetch current time from YouTube player
  useEffect(() => {
    // Don't run the interval when dictionary modal is open
    if (showDictionary) return;

    // Set a higher limit on listeners for the YouTube player
    if (playerRef.current && playerRef.current.setMaxListeners) {
      playerRef.current.setMaxListeners(20);
    }

    const intervalId = setInterval(async () => {
      if (playerRef.current && !showDictionary) {
        try {
          const elapsed_sec = await playerRef.current.getCurrentTime(); // Get current time in seconds

          // Update currentTime and calculate percent
          setCurrentTime(elapsed_sec);
          const calculatedPercent =
            duration > 0 ? (elapsed_sec / duration) * 100 : 0;

          // Auto-update current segment when live sub is active
          if (liveSubActive && segments.length > 0) {
            const foundSegment = segments.find(
              (seg) =>
                typeof seg.start_sec === "number" &&
                typeof seg.end_sec === "number" &&
                elapsed_sec >= seg.start_sec &&
                elapsed_sec < seg.end_sec
            );

            if (foundSegment && foundSegment.id !== currentLine) {
              setCurrentLine(foundSegment.id);
              // Auto-scroll to the current segment
              scrollToSegment(foundSegment.id);
            }
          }
        } catch (error) {
          console.log("Error getting currentTime:", error);
        }
      }
    }, 200); // Reduced frequency to every 200ms

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [duration, liveSubActive, segments, currentLine, scrollViewHeight]);

  const handleScrollViewLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setScrollViewHeight(height);
  };

  const handleMicPress = (segment: Segment) => {
    if (segment) {
      router.push({
        pathname: "/(screens)/shadowing-practice",
        params: {
          youtubeId: video?.youtube_id,
          transcript: segment.content,
          startSec: segment.start_sec,
          endSec: segment.end_sec,
          cefr: segment.cefr, // Pass the CEFR level
          segmentId: segment.id, // Pass segment ID for saving functionality
        },
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtnBlock}
          onPress={() => router.back()}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={2}>
          {video ? video.title : "Loading..."}
        </Text>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorite}
          accessibilityLabel={
            isFavorite ? "Remove from favorites" : "Add to favorites"
          }
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? Colors.primary : Colors.darkGrey}
          />
        </TouchableOpacity>
      </View>

      {/* Video Player */}
      <View style={styles.videoBox}>
        {isLoadingVideo ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              height: VIDEO_HEIGHT,
              backgroundColor: Colors.black,
            }}
          >
            <ActivityIndicator size="large" color={Colors.tint} />
          </View>
        ) : videoError ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              height: VIDEO_HEIGHT,
              backgroundColor: Colors.black,
            }}
          >
            <Text style={{ color: Colors.white }}>Error loading video</Text>
          </View>
        ) : video ? (
          <YoutubePlayer
            ref={playerRef}
            height={VIDEO_HEIGHT}
            width={"100%"}
            videoId={video?.youtube_id}
            play={!paused}
            playbackRate={playbackRate}
            initialPlayerParams={{
              controls: false,
              modestbranding: true,
              showinfo: false,
              rel: false,
              fs: false,
              iv_load_policy: 3,
              cc_load_policy: 0,
              disablekb: true,
            }}
            onProgress={({ currentTime: t }) => {
              if (showDictionary) return; // Skip updates when dictionary is open

              setCurrentTime(t);

              // Calculate the percentage of progress directly
              const percent = duration > 0 ? (t / duration) * 100 : 0;
              // Reduce logging to avoid console clutter
              // console.log("Current Time:", t);
              // console.log("Duration:", duration);
              // console.log("Percent:", percent);

              // Fetch duration if not already set
              if (playerRef.current && (!duration || duration < 1)) {
                playerRef.current.getDuration?.().then((d: number) => {
                  if (typeof d === "number" && d > 0) setDuration(d);
                });
              }
            }}
            onReady={async () => {
              if (playerRef.current) {
                try {
                  const d = await playerRef.current.getDuration?.();
                  if (typeof d === "number" && d > 0) setDuration(d);
                } catch {}
              }
            }}
            onChangeState={async (event) => {
              if (
                (event === "playing" || event === "paused") &&
                playerRef.current
              ) {
                try {
                  const d = await playerRef.current.getDuration?.();
                  if (typeof d === "number" && d > 0) setDuration(d);
                } catch {}
              }
            }}
          />
        ) : null}
      </View>

      {/* Scrollable Content (Transcript, Controls, Modals) */}
      <ScrollView
        style={{ flex: 1 }}
        ref={scrollViewRef}
        onLayout={handleScrollViewLayout}
      >
        {/* Transcript */}
        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptHint}>
            <Text style={{ color: Colors.tint }}>Click</Text> on any word to
            open the dictionary, or click the translation icon to translate the
            entire sentence
          </Text>

          {isLoadingSegments ? (
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <ActivityIndicator size="large" color={Colors.tint} />
              <Text style={{ marginTop: 10, color: Colors.softText }}>
                Loading transcript...
              </Text>
            </View>
          ) : segmentsError ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: "red" }}>Error loading transcript</Text>
              <Text style={{ color: Colors.softText, marginTop: 8 }}>
                {segmentsError.message}
              </Text>
            </View>
          ) : segments.length === 0 ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: Colors.softText }}>
                No transcript available for this video
              </Text>
            </View>
          ) : (
            segments.map((segment) => (
              <TranscriptLine
                youtubeId={video?.youtube_id}
                key={segment.id}
                ref={(ref) => {
                  lineRefs.current[segment.id] = ref;
                }}
                text={segment.content}
                isActive={currentLine === segment.id}
                onPressLine={() => handleTranscriptLinePress(segment)}
                onWordPress={handleWordPress}
                onTranslate={handleTranslate}
                segment={segment}
                onMicPress={handleMicPress}
                cefrColor={Colors[`cefr${segment.cefr}`] || Colors.primary} // Pass CEFR color
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Audio/Video Controls */}
      <ShadowingControls
        paused={paused}
        onTogglePause={() => setPaused((p) => !p)}
        duration={duration}
        position={position}
        percent={percent}
        playbackRate={playbackRate}
        onShowSpeed={() => setShowSpeed(true)}
        liveSubActive={liveSubActive}
        onToggleLiveSub={() => setLiveSubActive((v) => !v)}
        repeatActive={repeatActive}
        onToggleRepeat={() => setRepeatActive((v) => !v)}
        speedActive={showSpeed}
        onSeek={handleSeek}
      />

      {/* Speed Modal */}
      {showSpeed && (
        <SpeedModal
          value={playbackRate}
          onSelect={(v) => {
            setPlaybackRate(v);
            setShowSpeed(false);
          }}
          onClose={() => setShowSpeed(false)}
        />
      )}

      {/* Dictionary Modal */}
      {showDictionary && dictionaryWord && (
        <DictionaryModal
          word={dictionaryWord}
          onClose={handleDictionaryClose} // Use the new close handler
        />
      )}

      {/* Translate Modal */}
      {showTranslate && translateSegment && (
        <TranslateModal
          source={translateSegment.content}
          video={video}
          segment={translateSegment} // Pass the segment directly
          onClose={() => setShowTranslate(false)}
        />
      )}
    </SafeAreaView>
  );
}

const VIDEO_HEIGHT = (Dimensions.get("window").width * 9) / 16;

const styles = StyleSheet.create({
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
    alignItems: "flex-start",
    justifyContent: "center",
    marginLeft: 8,
  },
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: Colors.white,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
    flex: 1,
    textAlign: "center",
    lineHeight: 18, // Reduced line height for better readability
    maxHeight: 38, // Limit height to two lines
  },
  favoriteButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  videoBox: {
    width: "100%",
    height: VIDEO_HEIGHT,
    backgroundColor: Colors.black,
  },
  webview: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    overflow: "hidden",
  },
  userInfo: { flexDirection: "row", alignItems: "center", padding: 12 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    backgroundColor: Colors.background,
  },
  userName: { fontWeight: "600", color: Colors.softText },
  transcriptBox: { marginHorizontal: 10, marginBottom: 16 },
  transcriptHint: { color: Colors.softText, fontSize: 13, marginBottom: 8 },

  audioControls: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderColor: Colors.background,
  },
  timeText: {
    color: Colors.softText,
    fontSize: 13,
    minWidth: 40,
    textAlign: "center",
  },
});
