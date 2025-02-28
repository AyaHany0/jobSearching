import userModel from "../Database/Models/user.model.js";
import { asyncHandler } from "../utils/ErrorHandling/errorHandling.js";
import { verifyJWT } from "../utils/JWT/jwt.js";
import { roleTypes, tokenTypes } from "../utils/types.js";

export const decodeToken = async ({
  authenticate,
  tokenType = tokenTypes.access,
  next,
}) => {
  if (!authenticate) {
    return next(new Error("Token required!", { cause: 400 }));
  }
  const [prefix, token] = authenticate.split(" ");
  if (!prefix || !token) {
    return next(new Error("Token required!", { cause: 400 }));
  }
  let accessSignature = "";
  let refreshSignature = "";

  if (prefix == roleTypes.user) {
    accessSignature = process.env.ACCESS_SIGNATURE_USER;
    refreshSignature = process.env.REFRESH_SIGNATURE_USER;
  } else if (prefix == roleTypes.admin) {
    accessSignature = process.env.ACCESS_SIGNATURE_ADMIN;
    refreshSignature = process.env.REFRESH_SIGNATURE_ADMIN;
  } else {
    return next(new Error("Invalid token!", { cause: 403 }));
  }
  const decodeToken = verifyJWT({
    token,
    signature:
      tokenType == tokenTypes.access ? accessSignature : refreshSignature,
  });
  const user = await userModel.findOne({ _id: decodeToken._id });

  if (!user?._id) {
    return next(new Error("Invalid token payload!", { cause: 403 }));
  }
  if (!user) {
    return next(new Error("User not exist!", { cause: 404 }));
  }
  if (user?.changeCredentialTime?.getTime() >= decodeToken.iat * 1000) {
    return next(
      new Error("Your data has been changed, login again!", { cause: 403 })
    );
  }
  if (user.deletedAt) {
    return next(new Error("User not exist!", { cause: 404 }));
  }
  if (user.bannedAt) {
    return next(new Error("User banned!", { cause: 403 }));
  }

  return user;
};
export const authenticate = asyncHandler(async (req, res, next) => {
  const authenticate = req.headers.authenticate;
  const user = await decodeToken({
    authenticate,
    tokenType: tokenTypes.access,
    next,
  });
  req.user = user;
  next();
});

export const authorize = asyncHandler(async (req, res, next) => {
  const authenticate = req.headers.authenticate;
  const user = await decodeToken({
    authenticate,
    tokenType: tokenTypes.access,
    next,
  });
  if (user.role !== roleTypes.admin) {
    return next(new Error("Unauthorized!", { cause: 403 }));
  }
  req.user = user;
  next();
});
