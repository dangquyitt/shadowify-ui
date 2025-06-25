import { Header } from "@/components/header";
import VideoItem from "@/components/video-item";
import { Colors } from "@/constants/colors";
import useFavorites from "@/hooks/use-favorites";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {};

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.searchBar}>
      <Feather
        name="search"
        size={18}
        color={Colors.lightGrey}
        style={{ marginRight: 6 }}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Search favorites..."
        placeholderTextColor={Colors.lightGrey}
        value={value}
        onChangeText={onChange}
        accessibilityLabel="Search favorite videos"
      />
    </View>
  );
}

const Favorites = (props: Props) => {
  const {
    favorites,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    removeFromFavorites,
    search,
    setSearch,
  } = useFavorites();

  // Refresh favorites list every time this tab gets focus, with a small delay
  useFocusEffect(
    useCallback(() => {
      // Use a small delay to prevent UI jank when switching tabs
      const timer = setTimeout(() => {
        refresh();
      }, 100);

      // Return a cleanup function to clear the timeout if we navigate away quickly
      return () => {
        clearTimeout(timer);
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
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.tint} />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No favorite videos yet</Text>
        <Text style={styles.emptySubText}>
          Videos you mark as favorite will appear here
        </Text>
      </View>
    );
  };

  // We don't need explicit debounce here anymore as it's handled in the hook
  // The useFavorites hook already debounces and handles search changes

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <SearchBar value={search} onChange={setSearch} />
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
            colors={[Colors.tint]}
            tintColor={Colors.tint}
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginHorizontal: 14,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.background,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.black,
    paddingVertical: 2,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 14, // Match search bar margin
    paddingBottom: 20,
    paddingTop: 5,
  },
  loaderContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minHeight: 200,
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
