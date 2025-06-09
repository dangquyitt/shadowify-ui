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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import VideoItem from "./video-item";

type Props = {};

const RECENT_KEY = "recent_searches";
const MAX_RECENT = 5;

const SearchBar = (props: Props) => {
  const [search, setSearch] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const [results, setResults] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((v) => {
      if (v) setRecent(JSON.parse(v));
    });
  }, []);

  // Debounce search
  useEffect(() => {
    const q = search.trim();
    if (q.length === 0) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handler = setTimeout(() => {
      videoApi
        .getVideos(1, 20, q)
        .then((res) => {
          setResults(res.videos);
        })
        .finally(() => setLoading(false));
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [search]);


  // Instead of showing overlay, navigate to modal
  const handleFocus = () => {
    router.push("/(screens)/search-modal");
  };

  // No need for handleBlur

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
    // Save to recent only when clicking a video
    if (search.trim().length > 0) {
      saveRecent(search.trim());
    }
    router.push({
      pathname: "/(screens)/video-detail",
      params: { videoId: video.id },
    });
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
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
          onFocus={handleFocus}
          returnKeyType="search"
        />
      </View>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
    zIndex: 1,
    position: 'relative',
  },
  // overlayBox removed
  searchBar: {
    backgroundColor: Colors.searchBackground,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  searchText: {
    fontSize: 14,
    flex: 1,
    color: Colors.lightGrey,
    padding: 0,
  },
  recentBox: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginTop: 4,
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
  resultsBox: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginTop: 4,
    padding: 4,
    shadowColor: Colors.black,
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
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
