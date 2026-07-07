import jwt from "jsonwebtoken";

const optionalAuthenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    next();
    return;
  }

  try {
    req.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    req.user = null;
  }

  next();
};

export default optionalAuthenticate;
