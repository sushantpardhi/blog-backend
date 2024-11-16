import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinaryConfig.js";

const allowedFormats = ["png", "jpg", "jpeg"];

const getFileFormat = (mimetype) => {
  const format = mimetype.split("/")[1].toLowerCase();
  return allowedFormats.includes(format) ? format : "jpg";
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_pics",
    format: async (req, file) => getFileFormat(file.mimetype),
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
    transformation: [
      { width: 1000, crop: "scale" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    const format = getFileFormat(file.mimetype);
    if (allowedFormats.includes(format)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file format"), false);
    }
  },
});

export default upload;
