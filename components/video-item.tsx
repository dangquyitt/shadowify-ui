import { Colors } from "@/constants/colors";
import { Video } from "@/types/video";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

interface VideoItemProps {
  video: Video;
  onPress: () => void;
  onFavoriteToggle?: () => void;
  isFavorite?: boolean;
}

const VideoItem: React.FC<VideoItemProps> = ({
  video,
  onPress,
  onFavoriteToggle,
  isFavorite = false,
}) => {
  const { width } = useWindowDimensions();
  const containerPadding = 32;
  const thumbWidth = Math.round((width - containerPadding * 2) * 0.35);
  const thumbHeight = Math.round((thumbWidth * 9) / 16);

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View
        style={[styles.thumbBox, { width: thumbWidth, height: thumbHeight }]}
      >
        <Image
          source={{ uri: video.thumbnail }}
          style={[styles.itemImg, { width: thumbWidth, height: thumbHeight }]}
          resizeMode="cover"
        />
        <View style={styles.durationOverlay}>
          <Text style={styles.durationText}>{video.duration_string}</Text>
        </View>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={3}>
          {video.title}
        </Text>
        <Text style={styles.metaInfo} numberOfLines={1}>
          {video.categories.slice(0, 3).join(", ")}
          {video.categories.length > 3 && " ..."}
        </Text>
        <Text style={styles.createdAt} numberOfLines={1}>
          {new Date(video.created_at).toLocaleDateString()}
        </Text>
      </View>

      {onFavoriteToggle && (
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavoriteToggle}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? Colors.primary : Colors.darkGrey}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 8,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbBox: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: Colors.background,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  itemImg: {
    borderRadius: 8,
    backgroundColor: Colors.background,
    width: "100%",
    height: "100%",
  },
  durationOverlay: {
    position: "absolute",
    right: 4,
    bottom: 4,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  durationText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "600",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 3,
    justifyContent: "flex-start",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
    lineHeight: 18,
  },
  metaInfo: {
    fontSize: 11,
    color: Colors.darkGrey,
  },
  createdAt: {
    fontSize: 11,
    color: Colors.darkGrey,
    marginTop: 2,
  },
  favoriteButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default VideoItem;
