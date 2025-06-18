import { Header } from "@/components/header";
import VideoItem from "@/components/video-item";
import { Colors } from "@/constants/colors";
import useFavorites from "@/hooks/use-favorites";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {};

const Favorites = (props: Props) => {
  const {
    favorites,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    removeFromFavorites,
  } = useFavorites();

  // Refresh favorites list every time this tab gets focus
  useFocusEffect(
    useCallback(() => {
      // This runs when the screen comes into focus
      refresh();
      // Return a cleanup function (optional)
      return () => {
        // This runs when the screen goes out of focus
      };
    }, [refresh])
  );

  const handleVideoPress = (videoId: string) => {
    router.push({
      pathname: "/(screens)/video-detail",
      params: { id: videoId },
    });
  };

  const handleUnfavorite = async (videoId: string) => {
    await removeFromFavorites(videoId);
  };

  const renderFooter = () => {
    if (!loading || !hasMore) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No favorite videos yet</Text>
        <Text style={styles.emptySubText}>
          Videos you mark as favorite will appear here
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={favorites}
        renderItem={({ item }) => (
          <VideoItem
            video={item}
            onPress={() => handleVideoPress(item.id)}
            onFavoriteToggle={() => handleUnfavorite(item.id)}
            isFavorite={true}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        onEndReached={() => hasMore && loadMore()}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={loading && favorites.length > 0}
            onRefresh={refresh}
          />
        }
      />
    </SafeAreaView>
  );
};

export default Favorites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    flexGrow: 1,
    padding: 10,
  },
  loaderContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  errorContainer: {
    padding: 15,
    backgroundColor: "#ffebee",
    margin: 10,
    borderRadius: 5,
  },
  errorText: {
    color: "#d32f2f",
  },
});
