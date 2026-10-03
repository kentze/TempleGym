import { haversineDistance } from '../utils/haversine';

const OWL_LAT = 35.6547;
const OWL_LNG = 139.7391;

describe('haversineDistance', () => {
  it('returns 0 when both points are identical', () => {
    expect(haversineDistance(OWL_LAT, OWL_LNG, OWL_LAT, OWL_LNG)).toBe(0);
  });

  it('is symmetric', () => {
    const pointLat = 35.6600;
    const pointLng = 139.7450;
    const ab = haversineDistance(OWL_LAT, OWL_LNG, pointLat, pointLng);
    const ba = haversineDistance(pointLat, pointLng, OWL_LAT, OWL_LNG);
    expect(ab).toBeCloseTo(ba, 6);
  });

  it('returns a distance under 500m for a point clearly within the gym radius', () => {
    // ~100m north of Owl Center
    const nearLat = 35.6556;
    const nearLng = 139.7391;
    expect(haversineDistance(OWL_LAT, OWL_LNG, nearLat, nearLng)).toBeLessThan(500);
  });

  it('returns a distance over 500m for a point clearly outside the gym radius', () => {
    // ~1km north of Owl Center
    const farLat = 35.6637;
    const farLng = 139.7391;
    expect(haversineDistance(OWL_LAT, OWL_LNG, farLat, farLng)).toBeGreaterThan(500);
  });

  it('returns approximately the correct distance for a known pair', () => {
    // Tokyo Station to Shinjuku Station is roughly 6.7km
    const tokyoLat = 35.6812;
    const tokyoLng = 139.7671;
    const shinjukuLat = 35.6896;
    const shinjukuLng = 139.7006;
    const dist = haversineDistance(tokyoLat, tokyoLng, shinjukuLat, shinjukuLng);
    expect(dist).toBeGreaterThan(6000);
    expect(dist).toBeLessThan(7500);
  });
});
