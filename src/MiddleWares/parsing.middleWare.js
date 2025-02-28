export const parseNumberOfEmployees = (req, res, next) => {
  if (
    req.body.numberOfEmployees &&
    typeof req.body.numberOfEmployees === "string"
  ) {
    try {
      req.body.numberOfEmployees = JSON.parse(req.body.numberOfEmployees);
    } catch (error) {
      return next(
        new Error("Invalid JSON format for numberOfEmployees", { cause: 403 })
      );
    }
  }
  next();
};
