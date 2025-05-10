import Categories from "@/components/Categories";
import { Header } from "@/components/Header";
import PopularVideos from "@/components/PopularVideos";
import RecommendedChannels from "@/components/RecommendedChannels";
import SearchBar from "@/components/SearchBar";
import VideoList from "@/components/VideoList";
import { mockVideos } from "@/constants/mockVideos";
import { Video } from "@/types/video";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {};

const Page = (props: Props) => {
  const [videos, setVideos] = useState<Video[]>(mockVideos);
  const [isLoading, setIsLoading] = useState(false);

  const onCatChanged = (category: string) => {
    console.log("category changed", category);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Header />
        <SearchBar />
        <RecommendedChannels />
        {isLoading ? <ActivityIndicator size="large" /> : <PopularVideos />}
        <Categories onCategoryChanged={onCatChanged} />
        <VideoList videos={videos} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
