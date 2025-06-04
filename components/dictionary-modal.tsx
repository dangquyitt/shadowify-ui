import { Colors } from "@/constants/Colors";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DictionaryModal({
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

const styles = StyleSheet.create({
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
});
