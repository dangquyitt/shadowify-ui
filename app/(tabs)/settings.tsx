import { Colors } from "@/constants/Colors";
import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}

function SettingItem({ icon, label, onPress }: SettingItemProps) {
  return (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.itemIcon}>{icon}</View>
      <Text style={styles.itemLabel}>{label}</Text>
      <Feather
        name="chevron-right"
        size={20}
        color={Colors.lightGrey}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
}

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionContainer}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function VersionText() {
  return (
    <Text style={styles.versionText} accessibilityLabel="App version">
      Version 1.6.5 (2)
    </Text>
  );
}

import Header from "@/components/Header";
// ... (các import khác giữ nguyên)

// ...
// Xoá function Header, thay thế bằng AppHeader trong JSX

const Page = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <Section title="General">
          <SettingItem
            icon={
              <Ionicons
                name="notifications-outline"
                size={20}
                color={Colors.darkGrey}
              />
            }
            label="Notification"
          />
          <Divider />
          <SettingItem
            icon={
              <Feather name="shopping-cart" size={20} color={Colors.darkGrey} />
            }
            label="Manage Subscription"
          />
        </Section>
        <Section title="About">
          <SettingItem
            icon={
              <Feather name="file-text" size={20} color={Colors.darkGrey} />
            }
            label="Privacy Policy"
          />
          <Divider />
          <SettingItem
            icon={
              <MaterialIcons name="article" size={20} color={Colors.darkGrey} />
            }
            label="Terms of Use"
          />
          <Divider />
          <SettingItem
            icon={
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={Colors.darkGrey}
              />
            }
            label="About the author"
          />
        </Section>
        <Section title="Others">
          <SettingItem
            icon={<Feather name="mail" size={20} color={Colors.darkGrey} />}
            label="Feedback"
          />
          <Divider />
          <SettingItem
            icon={<Feather name="share-2" size={20} color={Colors.darkGrey} />}
            label="Share with friends"
          />
          <Divider />
          <SettingItem
            icon={
              <FontAwesome name="star-o" size={20} color={Colors.darkGrey} />
            }
            label="Rate the app"
          />
        </Section>
        <VersionText />
      </ScrollView>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    marginBottom: 12,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.black,
    letterSpacing: 0.5,
  },
  logoAccent: {
    color: Colors.tint,
  },
  premiumBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.tint,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  premiumText: {
    color: Colors.tint,
    fontWeight: "600",
    fontSize: 14,
  },
  sectionContainer: {
    marginHorizontal: 14,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    color: Colors.softText,
    marginBottom: 6,
    marginLeft: 8,
    fontWeight: "500",
  },
  sectionContent: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: Colors.white,
  },
  itemIcon: {
    width: 26,
    alignItems: "center",
    marginRight: 14,
  },
  itemLabel: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
    fontWeight: "500",
  },
  chevron: {
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.background,
    marginLeft: 56,
  },
  versionText: {
    textAlign: "center",
    color: Colors.lightGrey,
    fontSize: 13,
    marginTop: 10,
    marginBottom: 18,
    letterSpacing: 0.2,
  },
});
