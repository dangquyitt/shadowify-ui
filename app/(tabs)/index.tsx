import Categories from "@/components/Categories";
import { Header } from "@/components/Header";
import PopularVideos from "@/components/PopularVideos";
import RecommendedChannels from "@/components/RecommendedChannels";
import SearchBar from "@/components/SearchBar";
import VideoList from "@/components/VideoList";
import { useVideos } from "@/hooks/useVideos";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {};

const Page = (props: Props) => {
  const { videos, isLoading, error, refetch } = useVideos();

  const onCatChanged = (category: string) => {
    console.log("category changed", category);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Header />
        <SearchBar />
        <RecommendedChannels />
        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : error ? (
          <Text>Error: {error.message}</Text>
        ) : (
          <>
            <PopularVideos />
            <Categories onCategoryChanged={onCatChanged} />
            <VideoList videos={videos} />
          </>
        )}
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
