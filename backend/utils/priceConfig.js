// Price mapping for different service categories
// Used for prototyping - can be replaced with AI pricing later

const SERVICE_PRICES = {
	'Instant Visit': 250,
	'General Visit': 200,
	'A.C Jet Machine Service': 1099,
	'Water Tank Cleaning': 1599,
	'Air Cooler Service': 349,
	'Washing Machine Service': 899,
	'Generator/Inverter Rental': 699,
	'Chimney Services': 1099,
	'Aquaguard Service': 399,
	'Janitorial Services': 449,
	'2-Wheeler Service @ Doorstep': 499,
	'Others (Please Specify)': 500, // Default for custom services
};

/**
 * Get numeric price for a service type
 * @param {string} serviceType - The service name
 * @returns {number} - Price in rupees
 */
const getPriceForService = (serviceType) => {
	return SERVICE_PRICES[serviceType] || 500; // Default to 500 if not found
};

/**
 * Format price for display
 * @param {number} price - Price in rupees
 * @returns {string} - Formatted price string
 */
const formatPriceForDisplay = (price) => {
	return `₹${price.toLocaleString('en-IN')}`;
};

module.exports = {
	SERVICE_PRICES,
	getPriceForService,
	formatPriceForDisplay,
};
