import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface HeaderProps {
  title?: string;
  showPremium?: boolean;
  containerStyle?: ViewStyle;
}

export function Header({
  title,
  showPremium = true,
  containerStyle,
}: HeaderProps) {
  return (
    <View style={[styles.headerContainer, containerStyle]}>
      <View style={styles.logoRow}>
        <Text style={styles.logoText} accessibilityRole="header">
          shadow<Text style={styles.logoAccent}>ify</Text>
        </Text>
        {title && <Text style={styles.title}>{title}</Text>}
      </View>
      {showPremium && (
        <TouchableOpacity
          style={styles.premiumBtn}
          activeOpacity={0.8}
          accessibilityRole="button"
        >
          <Ionicons
            name="diamond"
            size={16}
            color={Colors.tint}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.premiumText}>Premium</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.tint,
    marginLeft: 10,
    alignSelf: "flex-end",
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
});
