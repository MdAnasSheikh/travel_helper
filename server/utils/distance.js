// City coordinates (latitude, longitude)
const cityCoordinates = {
  Mumbai: [19.076, 72.8777],
  Delhi: [28.6139, 77.209],
  Bangalore: [12.9716, 77.5946],
  Hyderabad: [17.385, 78.4867],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
  Pune: [18.5204, 73.8567],
  Ahmedabad: [23.0225, 72.5714],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462],
  Kanpur: [26.4499, 80.3319],
  Nagpur: [21.1458, 79.0882],
  Indore: [22.7196, 75.8577],
  Thane: [19.2183, 72.9781],
  Bhopal: [23.2599, 77.4126],
  Visakhapatnam: [17.6868, 83.2185],
  Patna: [25.5941, 85.1376],
  Vadodara: [22.3072, 73.1812],
  Ghaziabad: [28.6692, 77.4538],
  Ludhiana: [30.901, 75.8573],
  Agra: [27.1767, 78.0081],
  Nashik: [19.9975, 73.7898],
  Faridabad: [28.4089, 77.3178],
  Meerut: [28.9845, 77.7064],
  Rajkot: [22.3039, 70.8022],
  Varanasi: [25.3176, 82.9739],
  Srinagar: [34.0837, 74.7973],
  Aurangabad: [19.8762, 75.3433],
  Amritsar: [31.634, 74.8723],
  Allahabad: [25.4358, 81.8463],
  Ranchi: [23.3441, 85.3096],
  Howrah: [22.5958, 88.2636],
  Coimbatore: [11.0168, 76.9558],
  Vijayawada: [16.5062, 80.648],
  Jodhpur: [26.2389, 73.0243],
  Madurai: [9.9252, 78.1198],
  Raipur: [21.2514, 81.6296],
  Kota: [25.2138, 75.8648],
  Chandigarh: [30.7333, 76.7794],
  Guwahati: [26.1445, 91.7362],
  Solapur: [17.6599, 75.9064],
  Hubli: [15.3647, 75.124],
  Mysore: [12.2958, 76.6394],
  Tiruchirappalli: [10.7905, 78.7047],
  Bareilly: [28.367, 79.4304],
  Aligarh: [27.8974, 78.088],
  Moradabad: [28.8386, 78.7733],
  Gwalior: [26.2183, 78.1828],
  Jabalpur: [23.1815, 79.9864],
  Thiruvananthapuram: [8.5241, 76.9366],
  Kochi: [9.9312, 76.2673],
  Bhubaneswar: [20.2961, 85.8245],
  Dehradun: [30.3165, 78.0322],
  Shimla: [31.1048, 77.1734],
  Manali: [32.2432, 77.1892],
  Goa: [15.2993, 74.124],
  Udaipur: [24.5854, 73.7125],
  Pushkar: [26.49, 74.5509],
  Ajmer: [26.4499, 74.6399],
  Nainital: [29.3919, 79.4542],
  Haridwar: [29.9457, 78.1642],
  Rishikesh: [30.0869, 78.2676],
  Mathura: [27.4924, 77.6737],
  Vrindavan: [27.5794, 77.6965],
  Jammu: [32.7266, 74.857],
  Leh: [34.1526, 77.5771],
};

// Hardcoded distances (km) for common routes
const distanceLookup = {
  'Mumbai-Delhi': 1415,
  'Delhi-Mumbai': 1415,
  'Mumbai-Pune': 149,
  'Pune-Mumbai': 149,
  'Mumbai-Goa': 594,
  'Goa-Mumbai': 594,
  'Mumbai-Ahmedabad': 531,
  'Ahmedabad-Mumbai': 531,
  'Mumbai-Bangalore': 984,
  'Bangalore-Mumbai': 984,
  'Mumbai-Hyderabad': 709,
  'Hyderabad-Mumbai': 709,
  'Mumbai-Chennai': 1338,
  'Chennai-Mumbai': 1338,
  'Delhi-Agra': 233,
  'Agra-Delhi': 233,
  'Delhi-Jaipur': 281,
  'Jaipur-Delhi': 281,
  'Delhi-Amritsar': 452,
  'Amritsar-Delhi': 452,
  'Delhi-Chandigarh': 274,
  'Chandigarh-Delhi': 274,
  'Delhi-Lucknow': 555,
  'Lucknow-Delhi': 555,
  'Delhi-Varanasi': 821,
  'Varanasi-Delhi': 821,
  'Delhi-Kolkata': 1484,
  'Kolkata-Delhi': 1484,
  'Bangalore-Chennai': 346,
  'Chennai-Bangalore': 346,
  'Bangalore-Hyderabad': 569,
  'Hyderabad-Bangalore': 569,
  'Chennai-Hyderabad': 629,
  'Hyderabad-Chennai': 629,
  'Kolkata-Patna': 580,
  'Patna-Kolkata': 580,
  'Jaipur-Udaipur': 393,
  'Udaipur-Jaipur': 393,
  'Jaipur-Jodhpur': 335,
  'Jodhpur-Jaipur': 335,
  'Pune-Nagpur': 716,
  'Nagpur-Pune': 716,
  'Delhi-Dehradun': 302,
  'Dehradun-Delhi': 302,
  'Ahmedabad-Jaipur': 668,
  'Jaipur-Ahmedabad': 668,
  'Chennai-Madurai': 461,
  'Madurai-Chennai': 461,
  'Kochi-Thiruvananthapuram': 220,
  'Thiruvananthapuram-Kochi': 220,
  'Bangalore-Mysore': 143,
  'Mysore-Bangalore': 143,
  'Mumbai-Nagpur': 836,
  'Nagpur-Mumbai': 836,
  'Delhi-Shimla': 362,
  'Shimla-Delhi': 362,
  'Delhi-Leh': 1010,
  'Leh-Delhi': 1010,
};

// Earth's mean radius in kilometres (WGS-84)
const EARTH_RADIUS_KM = 6371;
// Used when both lookup table and coordinate data are unavailable
const DEFAULT_FALLBACK_DISTANCE_KM = 500;

/**
 * Haversine formula to calculate great-circle distance between two coordinates.
 * @param {number[]} coord1 - [lat, lon]
 * @param {number[]} coord2 - [lat, lon]
 * @returns {number} Distance in km
 */
function haversine(coord1, coord2) {
  const [lat1, lon1] = coord1.map((d) => (d * Math.PI) / 180);
  const [lat2, lon2] = coord2.map((d) => (d * Math.PI) / 180);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return Math.round(EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a)));
}

/**
 * Returns the distance in km between two cities.
 * Uses a hardcoded lookup table first, then falls back to Haversine.
 * @param {string} city1
 * @param {string} city2
 * @returns {number} Distance in km
 */
function getDistance(city1, city2) {
  const key = `${city1}-${city2}`;
  if (distanceLookup[key]) {
    return distanceLookup[key];
  }

  const coord1 = cityCoordinates[city1];
  const coord2 = cityCoordinates[city2];

  if (coord1 && coord2) {
    return haversine(coord1, coord2);
  }

  // Default fallback for unknown cities
  return DEFAULT_FALLBACK_DISTANCE_KM;
}

module.exports = { getDistance, cityCoordinates, distanceLookup };
