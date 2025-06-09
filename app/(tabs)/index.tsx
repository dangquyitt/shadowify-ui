import Categories from "@/components/categories";
import { Header } from "@/components/header";
import PopularVideos from "@/components/popular-videos";
import RecommendedChannels from "@/components/recommended-channels";
import SearchBar from "@/components/search-bar";
import { Colors } from "@/constants/colors";
import { useVideos } from "@/hooks/use-videos";
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
        <Text style={styles.channelName} numberOfLines={1}>
          Channel Name
        </Text>
        <Text style={styles.metaInfo} numberOfLines={1}>
          {video.views || "1.2K"} views • {video.published || "2 days ago"}
        </Text>
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
    <View style={styles.headerSection}>
      <Header />
      <SearchBar />
      <View style={styles.contentSections}>
        <RecommendedChannels />
        <PopularVideos />
        <Categories onCategoryChanged={onCatChanged} />
      </View>
    </View>
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
    backgroundColor: Colors.white,
  },
  headerSection: {
    backgroundColor: Colors.white,
  },
  contentSections: {
    gap: 4,
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
    color: Colors.darkGrey,
  },
  // Video item styles
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
  channelName: {
    fontSize: 12,
    color: Colors.softText,
    fontWeight: "500",
  },
  metaInfo: {
    fontSize: 11,
    color: Colors.darkGrey,
  },
});
