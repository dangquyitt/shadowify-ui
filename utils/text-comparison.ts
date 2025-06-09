/**
 * Text comparison utilities for analyzing speech accuracy
 */

/**
 * Calculate the similarity between two text strings and identify mismatches
 * @param originalText The original transcript text
 * @param spokenText The user's spoken text from speech recognition
 * @returns Object containing calculated accuracy and marked comparison
 */
export interface TextComparisonResult {
  accuracy: number;
  markedOriginalWords: Array<{word: string, isCorrect: boolean}>;
  markedSpokenWords: Array<{word: string, isCorrect: boolean}>;
}

export function compareTexts(originalText: string, spokenText: string): TextComparisonResult {
  // Normalize and split texts into arrays of words
  const originalWords = originalText
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  const spokenWords = spokenText
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  // Calculate Levenshtein distance for each word
  const result: TextComparisonResult = {
    accuracy: 0,
    markedOriginalWords: [],
    markedSpokenWords: []
  };
  
  // Mark words in original text
  originalWords.forEach(originalWord => {
    // Check if the word appears in the spoken text
    const foundInSpoken = spokenWords.some(spokenWord => 
      spokenWord.toLowerCase() === originalWord.toLowerCase()
    );
    
    result.markedOriginalWords.push({
      word: originalWord,
      isCorrect: foundInSpoken
    });
  });
  
  // Mark words in spoken text
  spokenWords.forEach(spokenWord => {
    // Check if the word appears in the original text
    const foundInOriginal = originalWords.some(originalWord => 
      originalWord.toLowerCase() === spokenWord.toLowerCase()
    );
    
    result.markedSpokenWords.push({
      word: spokenWord, 
      isCorrect: foundInOriginal
    });
  });
  
  // Calculate accuracy score - ratio of correctly spoken words to total words in original
  const correctCount = result.markedOriginalWords.filter(item => item.isCorrect).length;
  result.accuracy = originalWords.length > 0 
    ? Math.round((correctCount / originalWords.length) * 100)
    : 0;
  
  return result;
}
