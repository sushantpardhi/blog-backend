import jwt from "jsonwebtoken";
import tokenModel from "../models/token.js";

const verifyToken = async (req, res, next) => {
  const token =
    req.cookies.token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!token) {
    return res.status(401).json("Access Denied");
  }

  const dbToken = await tokenModel.findOne({ token: token });
  if (dbToken) {
    return res.status(400).json("Token Expired");
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(400).json("Invalid Token");
  }
};

export default verifyToken;
