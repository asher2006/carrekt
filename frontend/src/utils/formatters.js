// Format price in INR with lakhs/crores
export const formatPrice = (price) => {
  if (!price && price !== 0) return 'N/A';
  
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lakh`;
  } else {
    return `₹${price.toLocaleString('en-IN')}`;
  }
};

// Format price range
export const formatPriceRange = (min, max) => {
  if (!min && !max) return 'Price on request';
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} - ${formatPrice(max)}`;
};

// Format confidence as percentage
export const formatConfidence = (confidence) => {
  if (!confidence && confidence !== 0) return '0%';
  return `${(confidence * 100).toFixed(1)}%`;
};

// Get confidence color
export const getConfidenceColor = (confidence) => {
  if (confidence >= 0.8) return 'var(--accent-green)';
  if (confidence >= 0.5) return 'var(--accent-gold)';
  return 'var(--accent-red)';
};

// Get confidence label
export const getConfidenceLabel = (confidence) => {
  if (confidence >= 0.9) return 'Very High';
  if (confidence >= 0.7) return 'High';
  if (confidence >= 0.5) return 'Moderate';
  if (confidence >= 0.3) return 'Low';
  return 'Very Low';
};

// Slugify text
export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Truncate text
export const truncate = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
