import { Colors } from "@/constants/Colors";
import { Video } from "@/types/video";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

type Props = {
  videos: Array<Video>;
};

const VideoList = ({ videos }: Props) => {
  return (
    <View style={styles.container}>
      {videos.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <Image source={{ uri: item.thumbnailURL }} style={styles.itemImg} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemSubTitle}>{item.subTitle}</Text>
          </View>
        </View>
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
  itemImg: {
    width: 150,
    height: 100,
    borderRadius: 20,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
    gap: 10,
    justifyContent: "space-between",
  },
  itemSubTitle: {
    fontSize: 12,
    color: Colors.darkGrey,
    textTransform: "capitalize",
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.black,
  },
});
