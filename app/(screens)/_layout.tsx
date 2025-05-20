import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="video-detail" />
      <Stack.Screen name="shadowing-practice" />
    </Stack>
  );
}
