// src/middlewares/permission.middleware.js

exports.checkPermission = (permissionName) => {
  return (req, res, next) => {

    const permissions = [];

    req.user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        permissions.push(permission.name);
      });
    });

    if (!permissions.includes(permissionName)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};