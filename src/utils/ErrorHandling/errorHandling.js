// asyncHandler
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      return next(error);
    });
  };
};

// global error handling

export const globalErrorHandling = (error, req, res, next) => {
  if (process.env.MODE === "DEV") {
    return res
      .status(error["cause"] || 500)
      .json({ message: error.message, path: error.stack });
  }
  return res.status(error["cause"] || 500).json({ message: error.message });
};
