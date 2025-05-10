import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {};

const Favorites = (props: Props) => {
  return (
    <View style={styles.container}>
      <Text>Favorites Screen</Text>
    </View>
  );
};

export default Favorites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
