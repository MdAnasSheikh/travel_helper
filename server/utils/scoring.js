/**
 * Normalises a value within [min, max] to [0, 1].
 * Returns 0.5 if all values are equal to avoid division by zero.
 */
function normalise(value, min, max) {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

/**
 * Calculates AI scores for an array of transport options.
 *
 * @param {Array<{
 *   id: string,
 *   type: string,
 *   price: number,
 *   duration: number,   // minutes
 *   comfort: number,    // 1–5
 *   co2: number,        // kg
 *   distance: number    // km
 * }>} options
 * @returns {Array} Options enriched with aiScore (0–100), explanation, and isBest flag.
 */
function calculateScores(options) {
  if (!options || options.length === 0) return [];

  const prices = options.map((o) => o.price);
  const durations = options.map((o) => o.duration);
  const comforts = options.map((o) => o.comfort);
  const co2s = options.map((o) => o.co2);
  const distances = options.map((o) => o.distance);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  const minComfort = Math.min(...comforts);
  const maxComfort = Math.max(...comforts);
  const minCo2 = Math.min(...co2s);
  const maxCo2 = Math.max(...co2s);
  const minDistance = Math.min(...distances);
  const maxDistance = Math.max(...distances);

  const scored = options.map((opt) => {
    // Lower is better for price, duration, co2; higher is better for comfort
    const priceScore = 1 - normalise(opt.price, minPrice, maxPrice);
    const timeScore = 1 - normalise(opt.duration, minDuration, maxDuration);
    const comfortScore = normalise(opt.comfort, minComfort, maxComfort);
    const ecoScore = 1 - normalise(opt.co2, minCo2, maxCo2);
    // Distance bonus: routes covering more km reward efficient long-haul options
    const distanceBonus = normalise(opt.distance, minDistance, maxDistance);

    const rawScore =
      priceScore * 0.4 +
      timeScore * 0.3 +
      comfortScore * 0.15 +
      ecoScore * 0.1 +
      distanceBonus * 0.05;

    const aiScore = Math.round(rawScore * 100);

    // Build human-readable explanation
    const highlights = [];
    if (priceScore >= 0.7) highlights.push('very affordable');
    else if (priceScore <= 0.3) highlights.push('premium pricing');
    if (timeScore >= 0.7) highlights.push('fastest option');
    else if (timeScore <= 0.3) highlights.push('longer travel time');
    if (comfortScore >= 0.7) highlights.push('high comfort');
    if (ecoScore >= 0.7) highlights.push('eco-friendly');
    else if (ecoScore <= 0.3) highlights.push('higher emissions');

    const explanation =
      highlights.length > 0
        ? `This ${opt.type} is ${highlights.join(', ')}.`
        : `This ${opt.type} offers a balanced travel experience.`;

    return { ...opt, aiScore, explanation, isBest: false };
  });

  // Mark the single best-scoring option
  const bestScore = Math.max(...scored.map((o) => o.aiScore));
  let markedBest = false;
  for (const opt of scored) {
    if (!markedBest && opt.aiScore === bestScore) {
      opt.isBest = true;
      markedBest = true;
    }
  }

  return scored;
}

module.exports = { calculateScores };
