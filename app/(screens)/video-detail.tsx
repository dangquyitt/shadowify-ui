import { Colors } from "@/constants/Colors";
import { useSegments } from "@/hooks/useSegments";
import { useVideo } from "@/hooks/useVideos";
import { Segment } from "@/types/segment";
import { Feather, Ionicons } from "@expo/vector-icons";
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
import { MockTranslateAPI } from "../../components/MockTranslateAPI";

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
  const videoId = typeof params.videoId === "string" ? params.videoId : "";

  const {
    video,
    isLoading: isLoadingVideo,
    error: videoError,
  } = useVideo(videoId);
  const {
    segments,
    isLoading: isLoadingSegments,
    error: segmentsError,
  } = useSegments(videoId);

  const [currentLine, setCurrentLine] = useState<string>("");
  const [paused, setPaused] = useState(true);
  const [showSpeed, setShowSpeed] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showDictionary, setShowDictionary] = useState(false);
  const [dictionaryWord, setDictionaryWord] = useState<string | null>(null);
  const [liveSubActive, setLiveSubActive] = useState(false);
  const [repeatActive, setRepeatActive] = useState(false);

  // Set current line to first segment when segments load
  useEffect(() => {
    if (segments.length > 0 && !currentLine) {
      setCurrentLine(segments[0].id);
    }
  }, [segments]);

  // Luôn cập nhật currentLine khi video play (không cần bật liveSubActive)
  useEffect(() => {
    if (!segments.length) return;
    // Find the segment that matches currentTime
    const found = segments.find(
      (seg) =>
        typeof seg.start_sec === "number" &&
        typeof seg.end_sec === "number" &&
        currentTime >= seg.start_sec &&
        currentTime < seg.end_sec
    );
    if (found && found.id !== currentLine) {
      setCurrentLine(found.id);
    }
  }, [currentTime, segments]);

  // Translate modal state
  const [showTranslate, setShowTranslate] = useState(false);
  const [translateText, setTranslateText] = useState<string>("");
  const [sourceText, setSourceText] = useState<string>("");

  // Real duration/position from YoutubePlayer
  const [duration, setDuration] = useState<number>(0);
  // position = currentTime
  const position = currentTime;
  const percent = duration > 0 ? (position / duration) * 100 : 0;

  function handleWordPress(word: string) {
    setDictionaryWord(word);
    setShowDictionary(true);
  }

  function handleTranslate(text: string) {
    setSourceText(text);
    setTranslateText("Đây là bản dịch tiếng Việt của câu này."); // mock
    setShowTranslate(true);
  }

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
    const interval = setInterval(async () => {
      if (playerRef.current) {
        const elapsed_sec = await playerRef.current.getCurrentTime(); // Get current time in seconds

        // Update currentTime and calculate percent
        setCurrentTime(elapsed_sec);
        const calculatedPercent =
          duration > 0 ? (elapsed_sec / duration) * 100 : 0;
      }
    }, 100); // Refresh every 100ms

    return () => {
      clearInterval(interval);
    };
  }, [duration]);

  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  const handleScrollViewLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setScrollViewHeight(height);
  };

  // Scroll to the highlighted transcript line when liveSubActive is enabled
  useEffect(() => {
    if (liveSubActive && currentLine) {
      const index = segments.findIndex((seg) => seg.id === currentLine);
      if (index !== -1 && scrollViewRef.current) {
        const lineHeight = 50; // Assuming each transcript line has a height of 50
        const scrollToY =
          index * lineHeight - scrollViewHeight / 2 + lineHeight / 2;
        scrollViewRef.current.scrollTo({
          y: Math.max(scrollToY, 0), // Ensure it doesn't scroll to a negative position
          animated: true,
        });
      }
    }
  }, [liveSubActive, currentLine, segments, scrollViewHeight]);

  const handleMicPress = (segment: Segment) => {
    if (segment) {
      router.push({
        pathname: "/(screens)/shadowing-practice",
        params: {
          videoId: segment.video_id,
          transcript: segment.content,
          start: segment.start_sec?.toString() || "0",
          end: segment.end_sec?.toString() || "",
        },
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeftBlock}>
          <TouchableOpacity
            style={styles.backBtnBlock}
            onPress={() => router.back()}
            accessibilityLabel="Back"
          >
            <Feather name="arrow-left" size={24} color={Colors.softText} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenterBlock}>
          <Text style={styles.title} numberOfLines={2}>
            {video ? video.title : "Loading..."}
          </Text>
          <Text style={styles.userName}>{MOCK_USER.name}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Ionicons name="heart-outline" size={24} color={Colors.tint} />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 12 }}>
            <Feather name="share-2" size={22} color={Colors.softText} />
          </TouchableOpacity>
        </View>
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
            videoId={video.youtube_id}
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
              setCurrentTime(t);

              // Calculate the percentage of progress directly
              const percent = duration > 0 ? (t / duration) * 100 : 0;
              console.log("Current Time:", t);
              console.log("Duration:", duration);
              console.log("Percent:", percent);

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
                key={segment.id}
                text={segment.content}
                isActive={currentLine === segment.id}
                onPressLine={() => handleTranscriptLinePress(segment)}
                onWordPress={handleWordPress}
                onTranslate={handleTranslate}
                segment={segment}
                onMicPress={handleMicPress}
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
          onClose={() => setShowDictionary(false)}
        />
      )}

      {/* Translate Modal */}
      {showTranslate && (
        <TranslateModal
          source={sourceText}
          videoId={video?.id || ""}
          onClose={() => setShowTranslate(false)}
        />
      )}
    </SafeAreaView>
  );
}

function ShadowingControls({
  paused,
  onTogglePause,
  duration,
  position,
  percent,
  playbackRate,
  onShowSpeed,
  liveSubActive,
  onToggleLiveSub,
  repeatActive,
  onToggleRepeat,
  speedActive,
  onSeek,
}: {
  paused: boolean;
  onTogglePause: () => void;
  duration: number;
  position: number;
  percent: number;
  playbackRate: number;
  onShowSpeed: () => void;
  liveSubActive: boolean;
  onToggleLiveSub: () => void;
  repeatActive: boolean;
  onToggleRepeat: () => void;
  speedActive: boolean;
  onSeek: (time: number) => void;
}) {
  function format(sec: number) {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }

  // Handle timeline seeking
  const handleProgressBarPress = (event: any) => {
    // Get touch position relative to progress bar
    const { locationX, pageX } = event.nativeEvent;
    const progressBarEl = event.currentTarget;

    // Get width of progress bar for percentage calculation
    progressBarEl.measure(
      (
        x: number,
        y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number
      ) => {
        // Calculate the percentage of the touch position
        const seekPercent = locationX / width;
        // Calculate the target time in seconds
        const seekTime = seekPercent * duration;
        // Call the parent's seek function
        onSeek(seekTime);
      }
    );
  };

  return (
    <View style={styles.shadowingControlsBox}>
      <View style={styles.shadowingProgressRow}>
        <Text style={styles.timeText}>{format(position)}</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.progressBar}
          onPress={handleProgressBarPress}
        >
          <View style={[styles.progress, { width: `${percent}%` }]} />
          <View style={[styles.progressHandle, { left: `${percent}%` }]} />
        </TouchableOpacity>
        <Text style={styles.timeText}>{format(duration)}</Text>
      </View>
      <View style={styles.shadowingButtonRow}>
        <View style={styles.shadowingBtnCol}>
          <TouchableOpacity
            style={
              liveSubActive ? styles.shadowingBtnActive : styles.shadowingBtn
            }
            onPress={onToggleLiveSub}
          >
            <Feather
              name="sun"
              size={28}
              color={liveSubActive ? Colors.tint : Colors.softText}
            />
          </TouchableOpacity>
          <Text style={styles.shadowingBtnLabel}>Live Sub</Text>
        </View>
        <View style={styles.shadowingBtnCol}>
          <TouchableOpacity onPress={onShowSpeed} style={styles.shadowingBtn}>
            <Feather
              name="activity"
              size={28}
              color={speedActive ? Colors.tint : Colors.softText}
            />
          </TouchableOpacity>
          <Text style={styles.shadowingBtnLabel}>Speed</Text>
        </View>
        <View style={styles.shadowingBtnCol}>
          <TouchableOpacity
            style={
              repeatActive ? styles.shadowingBtnActive : styles.shadowingBtn
            }
            onPress={onToggleRepeat}
          >
            <Feather
              name="repeat"
              size={28}
              color={repeatActive ? Colors.tint : Colors.softText}
            />
          </TouchableOpacity>
          <Text style={styles.shadowingBtnLabel}>Repeat</Text>
        </View>
        <View style={styles.shadowingBtnCol}>
          <TouchableOpacity onPress={onTogglePause} style={styles.shadowingBtn}>
            <Feather
              name={paused ? "play" : "pause"}
              size={28}
              color={!paused ? Colors.tint : Colors.softText}
            />
          </TouchableOpacity>
          <Text style={styles.shadowingBtnLabel}>
            {paused ? "Paused" : "Playing"}
          </Text>
        </View>
      </View>
    </View>
  );
}

function SpeedModal({
  value,
  onSelect,
  onClose,
}: {
  value: number;
  onSelect: (v: number) => void;
  onClose: () => void;
}) {
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  return (
    <View style={styles.speedModalOverlay}>
      <View style={styles.speedModalBox}>
        {speeds.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => onSelect(s)}
            style={[
              styles.speedOption,
              s === value && styles.speedOptionActive,
            ]}
          >
            <Text
              style={
                s === value
                  ? styles.speedOptionActiveText
                  : styles.speedOptionText
              }
            >
              {s}
              {s === value ? "  ✓" : ""}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={onClose} style={styles.speedCloseBtn}>
          <Text style={styles.speedCloseText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DictionaryModal({
  word,
  onClose,
}: {
  word: string;
  onClose: () => void;
}) {
  // Mock dictionary data
  return (
    <View style={styles.dictModalOverlay}>
      <View style={styles.dictModalBox}>
        <Text style={styles.dictWord}>{word}</Text>
        <Text style={styles.dictPhonetic}>/miː/</Text>
        <Text style={styles.dictType}>pronoun</Text>
        <Text style={styles.dictDef}>
          used, usually as the object of a verb or preposition, to refer to the
          person speaking or writing.
        </Text>
        <Text style={styles.dictExample}>
          Example: They didn't invite me to the wedding.
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.dictCloseBtn}>
          <Text style={styles.dictCloseText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TranscriptLine({
  text,
  isActive,
  onPressLine,
  onWordPress,
  onTranslate,
  segment,
  onMicPress,
}: {
  text: string;
  isActive?: boolean;
  onPressLine?: () => void;
  onWordPress?: (word: string) => void;
  onTranslate?: (text: string) => void;
  segment?: Segment;
  onMicPress?: (segment: Segment) => void;
}) {
  const words = text.split(" ");

  // Format time to MM:SS
  const formatTime = (seconds: number | undefined): string => {
    if (typeof seconds !== "number") return "";
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const startTime = formatTime(segment?.start_sec);

  return (
    <TouchableOpacity
      id={`transcript-line-${segment.id}`} // Add id for scrolling
      style={[styles.transcriptLine, isActive && styles.transcriptLineActive]}
      onPress={onPressLine}
      activeOpacity={0.7}
    >
      {segment && typeof segment.start_sec === "number" && (
        <View style={styles.segmentTimeContainer}>
          <Text style={styles.segmentTimeText}>{startTime}</Text>
        </View>
      )}
      <Text style={styles.transcriptText}>
        {words.map((word, idx) => (
          <Text
            key={idx}
            style={isActive ? styles.underlineWord : undefined}
            onPress={() =>
              onWordPress && onWordPress(word.replace(/[^a-zA-Z']/g, ""))
            }
            suppressHighlighting
          >
            {word + (idx < words.length - 1 ? " " : "")}
          </Text>
        ))}
      </Text>
      <View style={styles.translateBox}>
        <TouchableOpacity
          style={styles.translateIcon}
          onPress={() => onTranslate && onTranslate(text)}
        >
          <Ionicons name="language-outline" size={18} color={Colors.tint} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (segment) {
              // Navigate to shadowing practice screen
              router.push({
                pathname: "/(screens)/shadowing-practice",
                params: {
                  videoId: segment.video_id,
                  transcript: text,
                  start: segment.start_sec,
                  end: segment.end_sec,
                },
              });
            }
          }}
          style={styles.shadowingIcon}
        >
          <Ionicons name="mic-outline" size={18} color={Colors.tint} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function TranslateModal({
  source,
  videoId,
  onClose,
}: {
  source: string;
  videoId: string;
  onClose: () => void;
}) {
  const { router } = require("expo-router");
  const [result, setResult] = React.useState<string | null>(null);

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
                  // Navigate to the appropriate screen
                  if (videoId) {
                    router.push({
                      pathname: "/(screens)/video-detail", // Update with correct path when shadowing-practice is implemented
                      params: {
                        videoId: videoId,
                        transcript: source,
                        start: 2,
                        end: 4,
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
          <MockTranslateAPI text={source} onResult={setResult} />
        )}
      </View>
    </View>
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
  // Shadowing Controls Styles
  shadowingControlsBox: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    marginHorizontal: 8,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  shadowingProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  shadowingButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  shadowingBtnCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  shadowingBtn: {
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 7,
  },
  shadowingBtnActive: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 7,
  },
  shadowingBtnLabel: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.softText,
    textAlign: "center",
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.background,
    borderRadius: 6,
    marginHorizontal: 8,
    overflow: "visible", // Changed from "hidden" to allow the handle to be visible
    shadowColor: Colors.tint,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.tint + "22",
    position: "relative", // Added to position the handle
  },
  progress: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: Colors.tint,
    borderRadius: 6,
    // Optionally add a gradient effect if you use a gradient lib
  },
  progressHandle: {
    position: "absolute",
    top: -5,
    marginLeft: -8, // Half of width to center the handle
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.tint,
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
    zIndex: 10,
  },
  controlBtn: { marginHorizontal: 6 },

  // Speed Modal Styles
  speedModalOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.darkGrey + "99", // semi-transparent overlay
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  speedModalBox: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 18,
    minWidth: 120,
    alignItems: "center",
    elevation: 8,
    shadowColor: Colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  speedOption: {
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 8,
    marginVertical: 2,
  },
  speedOptionActive: {
    backgroundColor: Colors.background,
  },
  speedOptionText: {
    fontSize: 16,
    color: Colors.black,
  },
  speedOptionActiveText: {
    fontSize: 16,
    color: Colors.tint,
    fontWeight: "bold",
  },
  speedCloseBtn: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  speedCloseText: {
    fontSize: 15,
    color: Colors.softText,
    fontWeight: "500",
  },

  // Dictionary Modal Styles
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
  dictWord: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.tint,
    marginBottom: 4,
  },
  dictPhonetic: {
    fontSize: 15,
    color: Colors.softText,
    marginBottom: 6,
  },
  dictType: {
    fontSize: 13,
    color: Colors.darkGrey,
    marginBottom: 8,
    fontWeight: "600",
  },
  dictDef: {
    fontSize: 15,
    color: Colors.black,
    marginBottom: 6,
  },
  dictExample: {
    fontSize: 14,
    color: Colors.tint,
    fontStyle: "italic",
    marginBottom: 12,
  },
  dictCloseBtn: {
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  dictCloseText: {
    fontSize: 15,
    color: Colors.softText,
    fontWeight: "500",
  },
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 16,
  },
  title: {
    flex: 1,
    fontWeight: "700",
    fontSize: 16,
    color: Colors.black,
    marginRight: 8,
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
  transcriptLine: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 10,
    marginBottom: 4,
    borderRadius: 8,
    position: "relative", // Added to position the time badge
  },
  transcriptLineActive: {
    // Remove background color, add shadow for active transcript
    backgroundColor: Colors.white,
    shadowColor: Colors.tint,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    borderWidth: 1.5,
    borderColor: Colors.tint,
  },
  transcriptText: { flex: 1, color: Colors.black, fontSize: 15 },
  underlineWord: {
    textDecorationLine: "underline",
    color: Colors.tint,
    fontWeight: "600",
  },
  translateBox: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  translateIcon: { marginVertical: 6 },
  shadowingIcon: { marginVertical: 6 },
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
  segmentTimeContainer: {
    marginRight: 8,
    backgroundColor: Colors.background,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 4,
    minWidth: 40,
    alignItems: "center",
  },
  segmentTimeText: {
    fontSize: 12,
    color: Colors.softText,
    fontWeight: "500",
  },
});
