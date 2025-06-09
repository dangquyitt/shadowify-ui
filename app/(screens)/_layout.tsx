import { Colors } from "@/constants/colors";
import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.white },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Screens",
        }}
      />
      <Stack.Screen
        name="video-detail"
        options={{
          title: "Video Details",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="shadowing-practice"
        options={{
          title: "Practice",
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="dictionary-demo"
        options={{
          title: "Dictionary",
          presentation: "card",
        }}
      />
    </Stack>
  );
}
