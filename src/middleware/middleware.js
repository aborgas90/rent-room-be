const { error } = require("winston");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: [".env"] });

const authenticationMiddleware = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    return res.status(401).json({ errors: "Unauthorized. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ errors: "Unauthorized. Invalid token format." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;


    next();
  } catch (err) {
    console.log(err);
    return res
      .status(401)
      .json({ errors: "Unauthorized. Invalid or expired token." });
  }
};

const authorizeRoles = (...rolesAllowed) => {
  return (req, res, next) => {
    const { roles } = req.user;
    console.log(roles)

    if (!rolesAllowed.includes(roles)) {
      return res
        .status(403)
        .json({ errors: "Forbidden. You don't have permission." });
    }

    next();
  };
};

module.exports = {
  authenticationMiddleware,
  authorizeRoles,
};
