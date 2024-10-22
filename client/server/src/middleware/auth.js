const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };
  
  const hasRole = (role) => {
    return (req, res, next) => {
      if (req.user && req.user.roles.includes(role)) {
        return next();
      }
      res.status(403).json({ message: 'Forbidden' });
    };
  };
  
  module.exports = { isAuthenticated, hasRole };