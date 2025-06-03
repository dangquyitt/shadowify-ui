import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ScreensIndex() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Screens Index!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
