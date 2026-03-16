import { config } from '../config';
import { haversineDistance } from '../utils/haversine';

export function isAtGym(lat: number, lng: number): boolean {
  const distanceM = haversineDistance(lat, lng, config.GYM_LAT, config.GYM_LNG);
  return distanceM <= config.GYM_RADIUS_M;
}
