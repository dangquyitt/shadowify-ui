import Categories from "@/components/Categories";
import { Header } from "@/components/Header";
import PopularVideos from "@/components/PopularVideos";
import RecommendedChannels from "@/components/RecommendedChannels";
import SearchBar from "@/components/SearchBar";
import { Colors } from "@/constants/Colors";
import { useVideos } from "@/hooks/useVideos";
import { Video } from "@/types/video";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Create a reusable VideoItem component for each list item
const VideoItem = ({
  video,
  onPress,
}: {
  video: Video;
  onPress: () => void;
}) => {
  const { width } = useWindowDimensions();
  const containerPadding = 20;
  const thumbWidth = Math.round((width - containerPadding * 2) * 0.4);
  const thumbHeight = Math.round((thumbWidth * 9) / 16);

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      activeOpacity={0.85}
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
        <Text style={styles.itemTitle} numberOfLines={2}>
          {video.title}
        </Text>
        <Text style={styles.channelName}>{video.title}</Text>
        <Text style={styles.metaInfo}>{video.title}</Text>
      </View>
    </TouchableOpacity>
  );
};

type Props = {};

const Page = (props: Props) => {
  const router = useRouter();
  const {
    videos,
    isLoading,
    error,
    refetch,
    loadMore,
    hasMore,
    isLoadingMore,
  } = useVideos();

  const onCatChanged = (category: string) => {
    console.log("category changed", category);
  };

  const renderHeader = () => (
    <>
      <Header />
      <SearchBar />
      <RecommendedChannels />
      <PopularVideos />
      <Categories onCategoryChanged={onCatChanged} />
    </>
  );

  const renderFooter = () =>
    isLoadingMore ? (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" />
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && videos.length === 0 ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>Error: {error.message}</Text>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VideoItem
              video={item}
              onPress={() =>
                router.push({
                  pathname: "/(screens)/video-detail",
                  params: { videoId: item.id },
                })
              }
            />
          )}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          onRefresh={refetch}
          refreshing={isLoading && videos.length > 0}
        />
      )}
    </SafeAreaView>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    flex: 1,
  },
  errorText: {
    textAlign: "center",
    padding: 20,
  },
  // Video item styles
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
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
