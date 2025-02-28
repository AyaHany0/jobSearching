import multer from "multer";

export const multerHost = (fileValidation = []) => {
  const storage = multer.diskStorage({});
  const fileFilter = (req, file, cb) => {
    if (fileValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed!"), false);
    }
  };
  const upload = multer({ storage });
  return upload;
};


