import { Colors } from "@/constants/Colors";
import { Video } from "@/types/video";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

type Props = {
  items: Video[];
  paginationIndex: number;
};

const Pagination = ({ items, paginationIndex }: Props) => {
  return (
    <View style={styles.container}>
      {items.map((_, index) => (
        <Animated.View
          style={[
            styles.dot,
            {
              backgroundColor:
                paginationIndex === index ? Colors.tint : Colors.darkGrey,
            },
          ]}
          key={index}
        />
      ))}
    </View>
  );
};

export default Pagination;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    backgroundColor: "#333",
    height: 8,
    width: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
});
