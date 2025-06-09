import { Colors } from "@/constants/colors";
import { dictionaryApi } from "@/services/api";
import { DictionaryEntry } from "@/types/dictionary";
import { Ionicons } from "@expo/vector-icons";
import * as Audio from "expo-audio";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DictionaryModal({
  word,
  onClose,
}: {
  word: string;
  onClose: () => void;
}) {
  const [dictionaryData, setDictionaryData] = useState<DictionaryEntry | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Function to play pronunciation audio
  const playPronunciation = async (audioUrl: string) => {
    try {
      setIsPlayingAudio(true);

      // Ensure the URL is properly formatted
      const fullUrl = audioUrl.startsWith("http")
        ? audioUrl
        : `https:${audioUrl}`;

      // Create a new audio player for this specific audio
      const player = Audio.createAudioPlayer({ uri: fullUrl });

      // Wait for the player to be ready
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Play the audio
      player.play();

      // Reset playing state after audio duration (estimated 3 seconds for pronunciation)
      setTimeout(() => {
        setIsPlayingAudio(false);
        // Clean up the player
        player.remove();
      }, 1000);
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlayingAudio(false);
    }
  };

  useEffect(() => {
    const fetchDefinition = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dictionaryApi.getWordDefinition(word);

        // Take the first entry from the response
        if (response && response.length > 0) {
          setDictionaryData(response[0]);
        } else {
          setError(`No definition found for "${word}"`);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch definition"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDefinition();
  }, [word]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.tint} />
          <Text style={styles.loadingText}>Looking up "{word}"...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!dictionaryData) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No data available</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
      >
        <View style={styles.wordHeader}>
          <Text style={styles.dictWord}>{dictionaryData.word}</Text>
        </View>

        {/* Pronunciation Section */}
        {dictionaryData.phonetics && dictionaryData.phonetics.length > 0 && (
          <View style={styles.pronunciationSection}>
            <Text style={styles.pronunciationTitle}>Pronunciation</Text>
            <View style={styles.pronunciationContainer}>
              {dictionaryData.phonetics
                .filter((phonetic) => phonetic.text || phonetic.audio)
                .map((phonetic, index) => {
                  // Determine pronunciation type based on audio URL or text
                  let pronunciationType = "";
                  if (phonetic.audio) {
                    if (
                      phonetic.audio.includes("-us.mp3") ||
                      phonetic.audio.includes("us/")
                    ) {
                      pronunciationType = "US";
                    } else if (
                      phonetic.audio.includes("-uk.mp3") ||
                      phonetic.audio.includes("uk/")
                    ) {
                      pronunciationType = "UK";
                    }
                  }

                  return (
                    <View key={index} style={styles.pronunciationItem}>
                      <View style={styles.pronunciationInfo}>
                        {pronunciationType && (
                          <Text style={styles.pronunciationLabel}>
                            {pronunciationType}
                          </Text>
                        )}
                        {phonetic.text && (
                          <Text style={styles.pronunciationText}>
                            {phonetic.text}
                          </Text>
                        )}
                      </View>
                      {phonetic.audio && phonetic.audio.trim() !== "" && (
                        <TouchableOpacity
                          style={styles.pronunciationAudioButton}
                          onPress={() =>
                            playPronunciation(
                              phonetic.audio!.startsWith("http")
                                ? phonetic.audio!
                                : `https:${phonetic.audio!}`
                            )
                          }
                          disabled={isPlayingAudio}
                        >
                          <Ionicons
                            name={
                              isPlayingAudio ? "volume-high" : "volume-medium"
                            }
                            size={16}
                            color={isPlayingAudio ? Colors.white : Colors.tint}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
            </View>
          </View>
        )}

        {dictionaryData.meanings.map((meaning, meaningIndex) => (
          <View key={meaningIndex} style={styles.meaningContainer}>
            <Text style={styles.dictType}>{meaning.partOfSpeech}</Text>

            {/* Meaning-level synonyms and antonyms */}
            {(meaning.synonyms.length > 0 || meaning.antonyms.length > 0) && (
              <View style={styles.meaningTagsContainer}>
                {meaning.synonyms.length > 0 && (
                  <View style={styles.tagSection}>
                    <Text style={styles.tagLabel}>Synonyms:</Text>
                    <View style={styles.tagsContainer}>
                      {meaning.synonyms.map((synonym, index) => (
                        <View
                          key={index}
                          style={[styles.tag, styles.synonymTag]}
                        >
                          <Text style={styles.synonymText}>{synonym}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {meaning.antonyms.length > 0 && (
                  <View style={styles.tagSection}>
                    <Text style={styles.tagLabel}>Antonyms:</Text>
                    <View style={styles.tagsContainer}>
                      {meaning.antonyms.map((antonym, index) => (
                        <View
                          key={index}
                          style={[styles.tag, styles.antonymTag]}
                        >
                          <Text style={styles.antonymText}>{antonym}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {meaning.definitions.map((definition, defIndex) => (
              <View key={defIndex} style={styles.definitionContainer}>
                <Text style={styles.dictDef}>
                  {defIndex + 1}. {definition.definition}
                </Text>

                {definition.example && (
                  <Text style={styles.dictExample}>
                    Example: "{definition.example}"
                  </Text>
                )}

                {/* Definition-level synonyms and antonyms */}
                {(definition.synonyms.length > 0 ||
                  definition.antonyms.length > 0) && (
                  <View style={styles.definitionTagsContainer}>
                    {definition.synonyms.length > 0 && (
                      <View style={styles.inlineTagSection}>
                        <Text style={styles.inlineTagLabel}>Synonyms:</Text>
                        <View style={styles.inlineTagsContainer}>
                          {definition.synonyms.map((synonym, index) => (
                            <View
                              key={index}
                              style={[styles.inlineTag, styles.synonymTag]}
                            >
                              <Text style={styles.synonymText}>{synonym}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {definition.antonyms.length > 0 && (
                      <View style={styles.inlineTagSection}>
                        <Text style={styles.inlineTagLabel}>Antonyms:</Text>
                        <View style={styles.inlineTagsContainer}>
                          {definition.antonyms.map((antonym, index) => (
                            <View
                              key={index}
                              style={[styles.inlineTag, styles.antonymTag]}
                            >
                              <Text style={styles.antonymText}>{antonym}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.dictModalOverlay}>
      <View style={styles.dictModalBox}>
        {renderContent()}
        <TouchableOpacity onPress={onClose} style={styles.dictCloseBtn}>
          <Text style={styles.dictCloseText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Dictionary Modal Styles
  dictModalOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.darkGrey + "99", // semi-transparent overlay
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
  },
  dictModalBox: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    minWidth: 280,
    maxWidth: 360,
    maxHeight: "80%",
    alignItems: "flex-start",
    elevation: 10,
    shadowColor: Colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    minHeight: 100,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.softText,
    marginTop: 10,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    minHeight: 100,
  },
  errorText: {
    fontSize: 14,
    color: Colors.darkGrey,
    textAlign: "center",
  },
  contentContainer: {
    maxHeight: 500,
    width: "100%",
  },
  dictWord: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.tint,
    marginBottom: 4,
  },
  wordHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    width: "100%",
  },
  // Pronunciation section styles
  pronunciationSection: {
    marginBottom: 16,
    width: "100%",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
  },
  pronunciationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.tint,
    marginBottom: 8,
  },
  pronunciationContainer: {
    gap: 8,
  },
  pronunciationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  pronunciationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pronunciationLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white,
    backgroundColor: Colors.tint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 24,
    textAlign: "center",
  },
  pronunciationText: {
    fontSize: 16,
    color: Colors.black,
    fontStyle: "italic",
    fontWeight: "500",
  },
  pronunciationAudioButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.tint,
  },
  meaningContainer: {
    marginBottom: 16,
    width: "100%",
  },
  dictType: {
    fontSize: 14,
    color: Colors.tint,
    marginBottom: 8,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  definitionContainer: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  dictDef: {
    fontSize: 15,
    color: Colors.black,
    marginBottom: 6,
    lineHeight: 20,
  },
  dictExample: {
    fontSize: 14,
    color: Colors.softText,
    fontStyle: "italic",
    marginBottom: 6,
    paddingLeft: 8,
  },
  synonyms: {
    fontSize: 13,
    color: Colors.darkGrey,
    marginBottom: 4,
    paddingLeft: 8,
  },
  // New styles for enhanced synonyms/antonyms display
  meaningTagsContainer: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  tagSection: {
    marginBottom: 8,
  },
  tagLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.darkGrey,
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  synonymTag: {
    backgroundColor: Colors.synonymBackground,
    borderWidth: 1,
    borderColor: Colors.synonymBorder,
  },
  antonymTag: {
    backgroundColor: Colors.antonymBackground,
    borderWidth: 1,
    borderColor: Colors.antonymBorder,
  },
  synonymText: {
    fontSize: 12,
    color: Colors.synonymText,
    fontWeight: "500",
  },
  antonymText: {
    fontSize: 12,
    color: Colors.antonymText,
    fontWeight: "500",
  },
  definitionTagsContainer: {
    marginTop: 6,
    paddingLeft: 8,
  },
  inlineTagSection: {
    marginBottom: 6,
  },
  inlineTagLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.softText,
    marginBottom: 3,
  },
  inlineTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  inlineTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 3,
    marginBottom: 3,
  },
  dictCloseBtn: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: Colors.tint,
    marginTop: 10,
  },
  dictCloseText: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: "600",
  },
});
