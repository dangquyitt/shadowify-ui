import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {};

const Page = (props: Props) => {
  return (
    <View style={styles.container}>
      <Text>Discover Screen</Text>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
