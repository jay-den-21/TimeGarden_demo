/**
 * Authentication middleware
 * Extracts user ID from request headers (X-User-Id) or falls back to session
 * In production, this would extract from JWT token
 */
const getCurrentUserId = (req, res, next) => {
  // Try to get user ID from header (sent by frontend)
  // Express lowercases headers, so 'X-User-Id' becomes 'x-user-id'
  const userIdFromHeader = req.headers['x-user-id'] || req.headers['X-User-Id'];
  
  // Try to get from authorization header (if using token)
  let userId = null;
  if (userIdFromHeader) {
    userId = parseInt(userIdFromHeader, 10);
  } else if (req.headers.authorization) {
    // In production: extract from JWT token
    // const token = req.headers.authorization.split(' ')[1];
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // userId = decoded.userId;
  }
  
  // Fallback: check session or use default (for backward compatibility)
  if (!userId || isNaN(userId)) {
    // For now, if no user ID provided, return 401
    // In production, you'd check session or JWT
    return res.status(401).json({ error: 'Unauthorized: User ID required' });
  }
  
  req.userId = userId;
  next();
};

module.exports = { getCurrentUserId };

