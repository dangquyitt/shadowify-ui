import { Colors } from "@/constants/colors";
import { mockVideos } from "@/constants/mock-videos";
import React, { useState } from "react";
import {
  FlatList,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Pagination from "./pagination";

const PopularVideos = () => {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>The most popular video</Text>
      <FlatList
        data={mockVideos}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item }) => (
          <TouchableOpacity>
            <View style={{ alignItems: "center", width }}>
              <ImageBackground
                source={{ uri: item.thumbnail }}
                style={[
                  styles.popularCard,
                  {
                    width: width - 32,
                    height: ((width - 32) * 9) / 16,
                  },
                ]}
                imageStyle={styles.popularCardImage}
              >
                <View style={styles.overlay} />
                <View style={styles.popularContent}>
                  <Text style={styles.popularTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                </View>
              </ImageBackground>
            </View>
          </TouchableOpacity>
        )}
      />
      <Pagination items={mockVideos} paginationIndex={currentIndex} />
    </View>
  );
};

export default PopularVideos;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 8,
    marginLeft: 16,
  },
  channelItem: {
    alignItems: "center",
    marginRight: 18,
    width: 76,
  },
  channelAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.lightGrey,
    marginBottom: 4,
  },
  channelName: {
    fontSize: 13,
    color: Colors.black,
    textAlign: "center",
    width: 70,
  },
  popularCard: {
    height: 180,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 12,
    justifyContent: "flex-end",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  popularCardImage: {
    resizeMode: "cover",
    borderRadius: 18,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  popularContent: {
    padding: 18,
  },
  popularTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
