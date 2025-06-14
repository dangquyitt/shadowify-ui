import { Colors } from "@/constants/colors";
import { videoApi } from "@/services/api";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  onCategoryChanged: (category: string) => void;
};

type Category = {
  id: number;
  title: string;
  slug: string;
};

const Categories = ({ onCategoryChanged }: Props) => {
  const scrollRef = useRef<ScrollView>(null);
  const itemRef = useRef<(View | null)[]>([]);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, title: "All", slug: "" },
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await videoApi.getCategories();
        if (Array.isArray(categoriesData)) {
          // Transform the API data to match our expected format
          const categoriesFromApi = [
            { id: 1, title: "All", slug: "" },
            ...categoriesData.map((category: string, index: number) => ({
              id: index + 2,
              title: category,
              slug: category
                .toLowerCase()
                .replace(/ & /g, "-")
                .replace(/ /g, "-"),
            })),
          ];
          setCategories(categoriesFromApi);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleSelectCategory = (index: number) => {
    const selected = itemRef.current[index];
    setActiveIndex(index);

    selected?.measure((x, y, width, height, pageX, pageY) => {
      scrollRef.current?.scrollTo({ x: pageX, y: 0, animated: true });
    });

    onCategoryChanged(categories[index].slug);
  };

  return (
    <View>
      <Text style={styles.title}>Categories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.itemsWrapper}
        ref={scrollRef}
      >
        {categories.map((item, index) => (
          <View
            ref={(el) => {
              itemRef.current[index] = el;
            }}
            key={index}
          >
            <TouchableOpacity
              style={[styles.item, activeIndex === index && styles.itemActive]}
              onPress={() => handleSelectCategory(index)}
            >
              <Text
                style={[
                  styles.itemText,
                  activeIndex === index && styles.itemTextActive,
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Categories;

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 10,
    marginLeft: 20,
  },
  itemsWrapper: {
    gap: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  item: {
    borderWidth: 1,
    borderColor: Colors.darkGrey,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  itemText: {
    fontSize: 14,
    color: Colors.darkGrey,
    letterSpacing: 0.5,
  },
  itemActive: {
    backgroundColor: Colors.tint,
    borderColor: Colors.tint,
  },
  itemTextActive: {
    fontWeight: "600",
    color: Colors.white,
  },
});
