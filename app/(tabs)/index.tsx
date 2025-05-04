import Header from "@/components/Header";
import PopularVideos from "@/components/PopularVideos";
import SearchBar from "@/components/SearchBar";
import { mockVideos } from "@/constants/mockVideos";
import { Video } from "@/types/video";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {};

const Page = (props: Props) => {
  const insets = useSafeAreaInsets();
  const [videos, setVideos] = useState<Video[]>(mockVideos);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header />
      <SearchBar />
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <PopularVideos videos={videos} />
      )}
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
