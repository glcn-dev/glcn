// Bayer 2x2 ordered dithering
// Smallest Bayer matrix, most visible pattern

const float bayerMatrix2x2[4] = float[4](
  0.0 / 4.0,
  2.0 / 4.0,
  3.0 / 4.0,
  1.0 / 4.0
);

float getBayerThreshold2x2(ivec2 coord) {
  int x = coord.x % 2;
  int y = coord.y % 2;
  return bayerMatrix2x2[y * 2 + x];
}

vec3 dither(vec3 color, vec2 fragCoord, float strength) {
  ivec2 coord = ivec2(fragCoord);
  float threshold = getBayerThreshold2x2(coord);

  // Calculate luminance
  float luminance = dot(color, vec3(0.299, 0.587, 0.114));

  // Binary result based on luminance vs threshold
  float dithered = luminance > threshold ? 1.0 : 0.0;

  // Blend between original and dithered based on strength
  return mix(color, vec3(dithered), strength);
}

#pragma glslify: export(dither)
