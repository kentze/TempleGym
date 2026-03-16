import { useState } from 'react';
import * as Location from 'expo-location';

interface GpsCoords { latitude: number; longitude: number; }

export function useGps() {
  const [isLoading, setIsLoading]         = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  async function getCoords(): Promise<GpsCoords | null> {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') return null;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { getCoords, hasPermission, isLoading };
}
