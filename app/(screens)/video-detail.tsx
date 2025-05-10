import { Colors } from "@/constants/Colors";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

const MOCK_USER = {
  name: "Dina OG kpop stan since 1998",
  avatar:
    "https://yt3.ggpht.com/ytc/AIdro_nF4i4VwE6w0wYw6KZ2Jg5wLw=s88-c-k-c0x00ffffff-no-rj",
};

const MOCK_TRANSCRIPT = [
  {
    id: "1",
    text: "Sup y'all welcome back to another video by me Dina OG kpop stan since 1998",
    highlight: true,
  },
  { id: "2", text: "So we know kpop comebacks have been very crazy lately" },
  {
    id: "3",
    text: "I mean kpop activity is just crazy in general but this year and this month has been crazy and",
  },
  {
    id: "4",
    text: "One comeback that I have specifically been waiting for ever since their debut of fearless is the seraphims",
  },
  { id: "5", text: "So I still don't know a name to a face yet because me" },
];

const YOUTUBE_VIDEO_ID = "pyf8cbqyfPs";

import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VideoDetailScreen() {
  const [currentLine, setCurrentLine] = useState("1");
  const [paused, setPaused] = useState(true);
  const [showSpeed, setShowSpeed] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showDictionary, setShowDictionary] = useState(false);
  const [dictionaryWord, setDictionaryWord] = useState<string | null>(null);
  const [liveSubActive, setLiveSubActive] = useState(false);
  const [repeatActive, setRepeatActive] = useState(false);

  // Translate modal state
  const [showTranslate, setShowTranslate] = useState(false);
  const [translateText, setTranslateText] = useState<string>("");
  const [sourceText, setSourceText] = useState<string>("");

  // Mock duration/position
  const duration = 1080; // 18:00
  const position = 2; // 00:02
  const percent = (position / duration) * 100;

  const insets = useSafeAreaInsets();

  function handleWordPress(word: string) {
    setDictionaryWord(word);
    setShowDictionary(true);
  }

  function handleTranslate(text: string) {
    setSourceText(text);
    setTranslateText("Đây là bản dịch tiếng Việt của câu này."); // mock
    setShowTranslate(true);
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityLabel="Back"
        >
          <Feather name="arrow-left" size={24} color={Colors.softText} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={2}>
          A RETIRED DANCER'S POV— LE SSERAFIM "ANTIFRAGILE" M/V
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Ionicons name="heart-outline" size={24} color={Colors.tint} />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 12 }}>
            <Feather name="share-2" size={22} color={Colors.softText} />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{MOCK_USER.name}</Text>
      </View>

      {/* Video Player */}
      <View style={styles.videoBox}>
        <YoutubePlayer
          height={VIDEO_HEIGHT}
          width={"100%"}
          videoId={YOUTUBE_VIDEO_ID}
          play={!paused}
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
        />
      </View>

      {/* Scrollable Content (Transcript, Controls, Modals) */}
      <ScrollView style={{ flex: 1 }}>
        {/* Transcript */}
        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptHint}>
            <Text style={{ color: Colors.tint }}>Click</Text> on any word to
            open the dictionary, or click the translation icon to translate the
            entire sentence
          </Text>
          {MOCK_TRANSCRIPT.map((line) => (
            <TranscriptLine
              key={line.id}
              text={line.text}
              isActive={currentLine === line.id}
              onPressLine={() => setCurrentLine(line.id)}
              onWordPress={handleWordPress}
              onTranslate={handleTranslate}
            />
          ))}
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
          onClose={() => setShowTranslate(false)}
        />
      )}
    </View>
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
  return (
    <View style={styles.shadowingControlsBox}>
      <View style={styles.shadowingProgressRow}>
        <Text style={styles.timeText}>{format(position)}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${percent}%` }]} />
        </View>
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
}: {
  text: string;
  isActive?: boolean;
  onPressLine?: () => void;
  onWordPress?: (word: string) => void;
  onTranslate?: (text: string) => void;
}) {
  const words = text.split(" ");
  return (
    <TouchableOpacity
      style={[styles.transcriptLine, isActive && styles.transcriptLineActive]}
      onPress={onPressLine}
      activeOpacity={0.7}
    >
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
            router.push({
              pathname: "/shadowing-practice",
              params: {
                videoId: YOUTUBE_VIDEO_ID,
                transcript: text,
                start: 2,
                end: 4,
              },
            });
          }}
          style={styles.shadowingIcon}
        >
          <Ionicons name="mic-outline" size={18} color={Colors.tint} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const VIDEO_HEIGHT = (Dimensions.get("window").width * 9) / 16;

import { MockTranslateAPI } from "../../components/MockTranslateAPI";

function TranslateModal({
  source,
  onClose,
}: {
  source: string;
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
                  router.push({
                    pathname: "/shadowing-practice",
                    params: {
                      videoId: YOUTUBE_VIDEO_ID,
                      transcript: source,
                      start: 2,
                      end: 4,
                    },
                  });
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

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 8,
    backgroundColor: Colors.white,
    borderRadius: 20,
    elevation: 2,
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
  },
  transcriptLineActive: { backgroundColor: Colors.background },
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
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.background,
    borderRadius: 2,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  progress: { height: 4, backgroundColor: Colors.tint, borderRadius: 2 },
  controlBtn: { marginHorizontal: 6 },
});
