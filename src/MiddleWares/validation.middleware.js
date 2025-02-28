// This middleware is used to validate the request body, params, query and files

export const validate = (schema) => {
  return async (req, res, next) => {
    // Making a copy of the request body, params, and query
    const inputData = {
      ...req.body,
      ...req.params,
      ...req.query,
    };

    // If there is any files we will add it to the inputData
    if (req.file) {
      inputData.file = req.file;
    }
    if (req.files) {
      Object.keys(req.files).forEach((key) => {
        inputData[key] = req.files[key];
      });
    }
   

    // Validate the schema passing it the all the data in the req and abortEarly set to false
    const { error } = schema.validate(inputData, { abortEarly: false });
    // If there is an error return a 500 status code and the error details
    if (error) {
      return res
        .status(500)
        .json({ message: "Validation Error!", error: error.details });
    }
    // If there is no error call the next middleware
    next();
  };
};
