/**
 * Authentication middleware
 * Currently uses hardcoded user ID for simulation
 * In production, this would extract user from JWT token or session
 */
const CURRENT_USER_ID = 2; // Hardcoded for simulation matching frontend mock requirements

const getCurrentUserId = (req, res, next) => {
  // In production: extract from JWT token
  // const token = req.headers.authorization?.split(' ')[1];
  // const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // req.userId = decoded.userId;
  
  req.userId = CURRENT_USER_ID;
  next();
};

module.exports = { getCurrentUserId, CURRENT_USER_ID };

