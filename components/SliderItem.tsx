import { Colors } from "@/constants/Colors";
import { Video } from "@/types/video";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
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
            Extrapolation.CLAMP,
          ),
        },
      ],
      scale: interpolate(
        scrollX.value,
        [(index - 1) * width, index * width, (index + 1) * width],
        [0.9, 1, 0.9],
        Extrapolation.CLAMP,
      ),
    };
  });

  return (
    <Animated.View style={[styles.itemWrapper, rnStyle]}>
      <Image source={{ uri: item.thumbnailURL }} style={styles.image} />
      <LinearGradient
        colors={["transparent", "rgba(0, 0, 0, 0.8)"]}
        style={styles.background}
      >
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subTitle} numberOfLines={2}>
            {item.subTitle}
          </Text>
        </View>
      </LinearGradient>
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
    width: width - 60,
    height: 180,
    borderRadius: 20,
  },
  background: {
    position: "absolute",
    right: 30,
    top: 0,
    width: width - 60,
    height: 180,
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
