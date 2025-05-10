import React, { useEffect } from "react";
import { ActivityIndicator, View, Text } from "react-native";

interface MockTranslateAPIProps {
  text: string;
  onResult: (result: string) => void;
  onError?: (err: Error) => void;
}

export function MockTranslateAPI({ text, onResult, onError }: MockTranslateAPIProps) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Mock: return text reversed as "translation"
      const translation = `Bản dịch tiếng Việt: ${text.split('').reverse().join('')}`;
      onResult(translation);
    }, 1200);
    return () => clearTimeout(timeout);
  }, [text, onResult]);

  return (
    <View style={{ alignItems: "center", justifyContent: "center", minHeight: 60 }}>
      <ActivityIndicator size="small" />
      <Text style={{ color: '#888', marginTop: 8 }}>Đang dịch...</Text>
    </View>
  );
}
