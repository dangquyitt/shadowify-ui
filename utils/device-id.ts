import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// Key for storing the device ID in secure storage
const DEVICE_ID_KEY = 'shadowify-device-id';

/**
 * Gets the device ID from secure storage or creates a new one if it doesn't exist
 * @returns Promise with the device ID
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    // Try to get the existing device ID from secure storage
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    
    // If no device ID exists, create a new one and store it
    if (!deviceId) {
      deviceId = Crypto.randomUUID();
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
      console.log('New device ID created:', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error getting/creating device ID:', error);
    // If there's an error, return a temporary ID
    return 'unknown-device';
  }
};

/**
 * Checks if the device has been identified (has a stored UUID)
 * @returns Promise<boolean> indicating if device has been identified
 */
export const hasDeviceId = async (): Promise<boolean> => {
  try {
    const deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    return !!deviceId;
  } catch (error) {
    console.error('Error checking device ID:', error);
    return false;
  }
};

/**
 * Resets the device ID (removes it from storage)
 * Useful for testing or allowing users to reset their identification
 */
export const resetDeviceId = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
    console.log('Device ID has been reset');
  } catch (error) {
    console.error('Error resetting device ID:', error);
  }
};
