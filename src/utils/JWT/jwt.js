import jwt from "jsonwebtoken";

export const generateJWT = ({
  payload,
  signature = process.env.SIGNATURE,
  options,
}) => {
  return jwt.sign(payload, signature, options);
};

export const verifyJWT = ({ token, signature = process.env.SIGNATURE }) => {
  return jwt.verify(token, signature);
};
