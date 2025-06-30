import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { STTModal } from "./stt-modal";
import { YouTubeURLModal } from "./youtube-url-modal";

interface ActionMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ActionMenuModal: React.FC<ActionMenuModalProps> = ({
  visible,
  onClose,
}) => {
  const [sttModalVisible, setSttModalVisible] = useState(false);
  const [youtubeModalVisible, setYoutubeModalVisible] = useState(false);

  const handleSTTPress = () => {
    onClose();
    setSttModalVisible(true);
  };

  const handleYoutubePress = () => {
    onClose();
    setYoutubeModalVisible(true);
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.container}>
            <View style={styles.menu}>
              <Text style={styles.title}>Choose Action</Text>

              {/* Speech Recognition Option */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleSTTPress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: Colors.tint },
                  ]}
                >
                  <Ionicons name="mic" size={24} color={Colors.white} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.menuItemTitle}>Speech Recognition</Text>
                  <Text style={styles.menuItemSubtitle}>
                    Record your voice to analyze pronunciation
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.lightGrey}
                />
              </TouchableOpacity>

              {/* Import YouTube Video Option */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleYoutubePress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: Colors.cefrB2 },
                  ]}
                >
                  <Ionicons name="videocam" size={24} color={Colors.white} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.menuItemTitle}>Import YouTube Video</Text>
                  <Text style={styles.menuItemSubtitle}>
                    Add a new video for shadowing practice
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.lightGrey}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* STT Modal */}
      <STTModal
        visible={sttModalVisible}
        onClose={() => setSttModalVisible(false)}
      />

      {/* YouTube URL Modal */}
      <YouTubeURLModal
        visible={youtubeModalVisible}
        onClose={() => setYoutubeModalVisible(false)}
      />
    </>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: width * 0.85,
    maxWidth: 350,
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.black,
    textAlign: "center",
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: Colors.darkGrey,
    lineHeight: 20,
  },
});
