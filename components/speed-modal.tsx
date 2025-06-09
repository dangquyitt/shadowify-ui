import { Colors } from "@/constants/colors";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SpeedModal({
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

const styles = StyleSheet.create({
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
});
