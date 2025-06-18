import Categories from "@/components/categories";
import { Header } from "@/components/header";
import PopularVideos from "@/components/popular-videos";
import SearchBar from "@/components/search-bar";
import { YouTubeURLModal } from "@/components/youtube-url-modal";
import { Colors } from "@/constants/colors";
import { useVideos } from "@/hooks/use-videos";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import VideoItem from "@/components/video-item";

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
  const [modalVisible, setModalVisible] = useState(false);

  const onCatChanged = (category: string) => {
    console.log("category changed", category);
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Header />
      <SearchBar />
      <View style={styles.contentSections}>
        {/* <RecommendedChannels /> */}
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
                  params: { id: item.id },
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

      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={22} color={Colors.white} />
      </TouchableOpacity>

      <YouTubeURLModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingBottom: 0, // Adjusted padding to fix tab bar height issue
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
  fabButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    zIndex: 100,
  },
  // Video item styles moved to VideoItem component
});
