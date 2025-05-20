import { Colors } from "@/constants/Colors";
import { Video } from "@/types/video";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

type Props = {
  videos: Array<Video>;
};

const VideoList = ({ videos }: Props) => {
  const { width } = useWindowDimensions();
  const router = useRouter();
  // Thumbnail takes ~40% width, info takes ~60%
  const containerPadding = 20;
  const thumbWidth = Math.round((width - containerPadding * 2) * 0.4);
  const thumbHeight = Math.round((thumbWidth * 9) / 16);

  return (
    <View style={styles.container}>
      {videos.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.itemContainer}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: "/(screens)/video-detail",
              params: { videoId: item.id },
            })
          }
        >
          <View
            style={[
              styles.thumbBox,
              { width: thumbWidth, height: thumbHeight },
            ]}
          >
            <Image
              source={{ uri: item.thumbnail }}
              style={[
                styles.itemImg,
                { width: thumbWidth, height: thumbHeight },
              ]}
              resizeMode="cover"
            />
            <View style={styles.durationOverlay}>
              <Text style={styles.durationText}>{item.duration_string}</Text>
            </View>
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.channelName}>{item.title}</Text>
            <Text style={styles.metaInfo}>{item.title}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default VideoList;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    flex: 1,
    gap: 10,
  },
  thumbBox: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.background,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  itemImg: {
    borderRadius: 12,
    backgroundColor: Colors.background,
    width: "100%",
    height: "100%",
  },
  durationOverlay: {
    position: "absolute",
    right: 6,
    bottom: 6,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 4,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 2,
  },
  channelName: {
    fontSize: 13,
    color: Colors.softText,
    fontWeight: "500",
    marginBottom: 2,
  },
  metaInfo: {
    fontSize: 12,
    color: Colors.darkGrey,
  },
});
