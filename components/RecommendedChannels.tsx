import { Colors } from "@/constants/Colors";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Mock data for recommended channels
const recommendedChannels = [
  {
    id: "1",
    name: "TED",
    logo: "https://i.ytimg.com/vi/uiUCIz-3CWM/hqdefault.jpg",
  },
  {
    id: "2",
    name: "Toastmasters International",
    logo: "https://i.ytimg.com/vi/uiUCIz-3CWM/hqdefault.jpg",
  },
  {
    id: "3",
    name: "Kurzgesagt - In a Nutshell",
    logo: "https://i.ytimg.com/vi/uiUCIz-3CWM/hqdefault.jpg",
  },
  {
    id: "4",
    name: "BBC Earth",
    logo: "https://i.ytimg.com/vi/uiUCIz-3CWM/hqdefault.jpg",
  },
  {
    id: "5",
    name: "The Joe Rogan Experience",
    logo: "https://i.ytimg.com/vi/uiUCIz-3CWM/hqdefault.jpg",
  },
  {
    id: "6",
    name: "The Joe Rogan Experience",
    logo: "https://i.ytimg.com/vi/uiUCIz-3CWM/hqdefault.jpg",
  },
  {
    id: "7",
    name: "The Joe Rogan Experience",
    logo: "https://i.ytimg.com/vi/uiUCIz-3CWM/hqdefault.jpg",
  },
];
function RecommendedChannels() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recommended channels</Text>
      <FlatList
        data={recommendedChannels}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity>
            <View style={styles.channelItem}>
              <Image
                source={{ uri: item.logo }}
                style={styles.channelAvatar}
                resizeMode="cover"
              />
              <Text style={styles.channelName} numberOfLines={2}>
                {item.name}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
export default RecommendedChannels;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 8,
    marginLeft: 16,
  },
  channelItem: {
    alignItems: "center",
    marginRight: 18,
    width: 76,
  },
  channelAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.lightGrey,
    marginBottom: 4,
  },
  channelName: {
    fontSize: 13,
    color: Colors.black,
    textAlign: "center",
    width: 70,
  },
  popularCard: {
    height: 180,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 12,
    justifyContent: "flex-end",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  popularCardImage: {
    resizeMode: "cover",
    borderRadius: 18,
  },
  popularContent: {
    padding: 18,
  },
  popularTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
