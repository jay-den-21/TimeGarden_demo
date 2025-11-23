/**
 * Helper to normalize status strings from DB to Frontend Enums
 */
const normalizeStatus = (status) => {
  if (status === 'in_progress') return 'in-progress';
  if (status === 'awaiting_review') return 'awaiting_review';
  // Add other mappings here if necessary
  return status;
};

module.exports = { normalizeStatus };

