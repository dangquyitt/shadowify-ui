import Categories from "@/components/Categories";
import Header from "@/components/Header";
import PopularVideos from "@/components/PopularVideos";
import SearchBar from "@/components/SearchBar";
import VideoList from "@/components/VideoList";
import { mockVideos } from "@/constants/mockVideos";
import { Video } from "@/types/video";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {};

const Page = (props: Props) => {
  const insets = useSafeAreaInsets();
  const [videos, setVideos] = useState<Video[]>(mockVideos);
  const [isLoading, setIsLoading] = useState(false);

  const onCatChanged = (category: string) => {
    console.log("category changed", category);
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <Header />
      <SearchBar />
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <PopularVideos videos={videos} />
      )}
      <Categories onCategoryChanged={onCatChanged} />
      <VideoList videos={videos} />
    </ScrollView>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
