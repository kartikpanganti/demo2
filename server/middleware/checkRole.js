// Middleware to check user role
const checkRole = (roles) => {
  return (req, res, next) => {
    // Get user role from JWT payload
    const userRole = req.user.role;

    // Check if user role is included in the allowed roles
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }

    next();
  };
};

module.exports = checkRole; 