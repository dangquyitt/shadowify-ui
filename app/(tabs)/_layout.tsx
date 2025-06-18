import { TabBar } from "@/components/tab-bar";
import { Colors } from "@/constants/colors";
import { Tabs } from "expo-router";
import React from "react";

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.background,
          height: 50, // Adjusted height to fix tab bar issue
          paddingTop: 0, // Removed extra padding
          paddingBottom: 0, // Removed extra padding
        },
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Explore",
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarLabel: "Favorites",
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Library",
          tabBarLabel: "Library",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
