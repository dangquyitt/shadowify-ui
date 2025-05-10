import { Colors } from "@/constants/Colors";
import { Video } from "@/types/video";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

type Props = {
  item: Video;
  index: number;
  scrollX: SharedValue<number>;
};

const { width } = Dimensions.get("screen");

const SliderItem = ({ item, index, scrollX }: Props) => {
  const rnStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            scrollX.value,
            [(index - 1) * width, index * width, (index + 1) * width],
            [-width * 0.1, 0, width * 0.1],
            Extrapolation.CLAMP
          ),
        },
      ],
      scale: interpolate(
        scrollX.value,
        [(index - 1) * width, index * width, (index + 1) * width],
        [0.9, 1, 0.9],
        Extrapolation.CLAMP
      ),
    };
  });

  const router = useRouter();
  const thumbWidth = width - 60;
  const thumbHeight = Math.round(thumbWidth * 9 / 16);

  return (
    <Animated.View style={[styles.itemWrapper, rnStyle]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: "/(screens)/video-detail", params: { videoId: item.videoId } })}
      >
        <Image
          source={{ uri: item.thumbnailURL }}
          style={[styles.image, { width: thumbWidth, height: thumbHeight }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0, 0, 0, 0.8)"]}
          style={[styles.background, { width: thumbWidth, height: thumbHeight }]}
        >
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subTitle} numberOfLines={2}>
              {item.subTitle}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default SliderItem;

const styles = StyleSheet.create({
  itemWrapper: {
    position: "relative",
    width: width,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  background: {
    position: "absolute",
    right: 30,
    top: 0,
    borderRadius: 20,
    padding: 20,
  },
  textContainer: {
    position: "absolute",
    top: 120,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: "400",
  },
  subTitle: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: "600",
  },
});
