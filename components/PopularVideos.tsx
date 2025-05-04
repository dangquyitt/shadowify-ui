import { Colors } from "@/constants/Colors";
import { Video } from "@/types/video";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewToken,
} from "react-native";
import Animated, {
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import Pagination from "./Pagination";
import SliderItem from "./SliderItem";

type Props = {
  videos: Array<Video>;
};

const PopularVideos = ({ videos }: Props) => {
  const [data, setData] = useState(videos);
  const [paginationIdx, setPaginationIdx] = useState(0);
  const scrollX = useSharedValue(0);
  const ref = useAnimatedRef<Animated.FlatList<any>>();
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const offset = useSharedValue(0);
  const { width } = useWindowDimensions();

  const onScrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
    onMomentumEnd: (e) => {
      offset.value = e.contentOffset.x;
    },
  });

  useEffect(() => {
    if (isAutoPlay === true) {
      interval.current = setInterval(() => {
        offset.value = offset.value + width;
      }, 5000);
    } else {
      clearInterval(interval.current);
    }
    return () => clearInterval(interval.current);
  }, [isAutoPlay, offset, width]);

  useDerivedValue(() => {
    scrollTo(ref, offset.value, 0, true);
  });

  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken[];
  }) => {
    if (
      viewableItems.length > 0 &&
      viewableItems[0].index !== undefined &&
      viewableItems[0].index !== null
    ) {
      const newIndex = viewableItems[0].index;
      setPaginationIdx(newIndex % videos.length);
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  };

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Popular Videos</Text>
      <View style={styles.slideWrapper}>
        <Animated.FlatList
          ref={ref}
          data={data}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <SliderItem item={item} index={index} scrollX={scrollX} />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onScroll={onScrollHandler}
          scrollEventThrottle={16}
          onEndReachedThreshold={0.5}
          onEndReached={() => setData([...data, ...videos])}
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
          onScrollBeginDrag={() => setIsAutoPlay(false)}
          onScrollEndDrag={() => setIsAutoPlay(true)}
        />
        <Pagination
          items={videos}
          paginationIndex={paginationIdx}
          scrollX={scrollX}
        />
      </View>
    </View>
  );
};

export default PopularVideos;

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 10,
    marginLeft: 20,
  },
  slideWrapper: {
    justifyContent: "center",
  },
});
