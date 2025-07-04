import { Colors } from "@/constants/colors";
import { getDeviceId } from "@/utils/device-id";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

const Page = () => {
  const router = useRouter();

  // Initialize device ID when app starts
  useEffect(() => {
    const initDeviceId = async () => {
      try {
        const deviceId = await getDeviceId();
        console.log("Device identified:", deviceId);
      } catch (error) {
        console.error("Error initializing device ID:", error);
      }
    };

    initDeviceId();
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/getting-started.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={styles.wrapper}>
          <Animated.Text
            style={styles.title}
            entering={FadeInRight.delay(300).duration(500)}
          >
            Shadowify
          </Animated.Text>
          <Animated.Text
            style={styles.description}
            entering={FadeInRight.delay(700).duration(500)}
          >
            Practice English by mimicking native speakers in real time
          </Animated.Text>
          <Animated.View entering={FadeInRight.delay(1200).duration(500)}>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => router.replace("/(tabs)")}
            >
              <Text style={styles.btnText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 50,
    paddingHorizontal: 30,
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  title: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 1.5,
    lineHeight: 36,
    textAlign: "center",
  },
  description: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 1.2,
    lineHeight: 22,
    textAlign: "center",
  },
  btn: {
    backgroundColor: Colors.tint,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    borderRadius: 10,
  },
  btnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
