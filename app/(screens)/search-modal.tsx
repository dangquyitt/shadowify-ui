import VideoItem from "@/components/video-item";
import { Colors } from "@/constants/colors";
import { videoApi } from "@/services/api";
import { Video } from "@/types/video";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const RECENT_KEY = "recent_searches";
const MAX_RECENT = 20;

const SearchModalScreen = () => {
  const [search, setSearch] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const [results, setResults] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((v) => {
      if (v) setRecent(JSON.parse(v));
    });
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  // Debounce search, reset page/results on new search
  useEffect(() => {
    const q = search.trim();
    if (q.length === 0) {
      setResults([]);
      setPage(1);
      setHasMore(true);
      setShowRecent(true); // Show recent when input is empty
      return;
    }
    setShowRecent(false); // Hide recent when searching
    setLoading(true);
    setPage(1);
    setHasMore(true);
    const handler = setTimeout(() => {
      videoApi
        .getVideos(1, 10, q)
        .then((res) => {
          setResults(res.videos);
          setHasMore(res.hasMore);
        })
        .finally(() => setLoading(false));
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [search]);

  // Load more videos
  const loadMore = () => {
    if (loadingMore || loading || !hasMore) return;
    const q = search.trim();
    if (q.length === 0) return;
    setLoadingMore(true);
    videoApi
      .getVideos(page + 1, 10, q)
      .then((res) => {
        setResults((prev) => [...prev, ...res.videos]);
        setPage((p) => p + 1);
        setHasMore(res.hasMore);
      })
      .finally(() => setLoadingMore(false));
  };

  const handleRecentPress = (item: string) => {
    setSearch(item);
    setShowRecent(false);
    inputRef.current?.focus();
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    // Do NOT save to recent here
  };

  const saveRecent = async (q: string) => {
    let arr = [q, ...recent.filter((r) => r !== q)];
    if (arr.length > MAX_RECENT) arr = arr.slice(0, MAX_RECENT);
    setRecent(arr);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(arr));
  };

  const handleVideoPress = (video: Video) => {
    if (search.trim().length > 0) {
      saveRecent(search.trim());
    }
    router.replace({
      pathname: "/(screens)/video-detail",
      params: { id: video.id },
    });
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.lightGrey} />
          <TextInput
            ref={inputRef}
            placeholder="Search"
            placeholderTextColor={Colors.lightGrey}
            style={styles.searchText}
            autoCapitalize="none"
            value={search}
            onChangeText={handleSearch}
            returnKeyType="search"
            onFocus={() => setShowRecent(true)}
            onBlur={() => setShowRecent(false)}
          />
        </View>
      </View>
      <View style={styles.flex1}>
        {showRecent && search.trim().length === 0 && recent.length > 0 && (
          <View style={styles.recentBox}>
            <Text style={styles.recentTitle}>Recent Searches</Text>
            {recent.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => handleRecentPress(item)}
              >
                <Text style={styles.recentItem}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {search.trim().length > 0 && (
          <View style={styles.resultsBoxFull}>
            {loading ? (
              <Text style={styles.loadingText}>Searching...</Text>
            ) : results.length === 0 ? (
              <Text style={styles.noResultText}>No videos found</Text>
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <VideoItem
                    video={item}
                    onPress={() => handleVideoPress(item)}
                  />
                )}
                keyboardShouldPersistTaps="handled"
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  loadingMore ? (
                    <Text style={styles.loadingText}>Loading more...</Text>
                  ) : null
                }
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 32 }}
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchModalScreen;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === "android" ? 32 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: Colors.white,
    zIndex: 10,
  },
  closeBtn: {
    marginRight: 8,
    padding: 4,
  },
  searchBar: {
    flex: 1,
    backgroundColor: Colors.searchBackground,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchText: {
    fontSize: 15,
    flex: 1,
    color: Colors.lightGrey,
    padding: 0,
  },
  flex1: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  recentBox: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    shadowColor: Colors.black,
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  recentTitle: {
    fontWeight: "700",
    color: Colors.softText,
    marginBottom: 6,
  },
  recentItem: {
    paddingVertical: 6,
    color: Colors.text,
    fontSize: 15,
  },
  resultsBoxFull: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 4,
    shadowColor: Colors.black,
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 0,
    maxHeight: "100%",
  },
  loadingText: {
    color: Colors.softText,
    padding: 12,
    textAlign: "center",
  },
  noResultText: {
    color: Colors.softText,
    padding: 12,
    textAlign: "center",
  },
});
