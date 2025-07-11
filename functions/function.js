


export function checkRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      
      return res.redirect('/login');
    }

    const userRole = req.user.role_id; 
    if (allowedRoles.includes(userRole)) {
     
      return next();
    } else {
      return res.status(403).send('Access denied.');
    }
  };
}




