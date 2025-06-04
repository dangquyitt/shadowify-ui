import { Colors } from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ShadowingControls({
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

const styles = StyleSheet.create({
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
  timeText: {
    color: Colors.softText,
    fontSize: 13,
    minWidth: 40,
    textAlign: "center",
  },
});
