import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@alyven:onboarding:completed:v1';

/** Show the introduction only once per local installation. */
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_KEY)) === 'yes';
  } catch {
    // If storage is unavailable, still let the user sign in without being blocked.
    return true;
  }
}

export async function completeOnboarding(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'yes');
  } catch {
    // The user can still continue; persistence is best-effort.
  }
}
