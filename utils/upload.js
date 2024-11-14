import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinaryConfig.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_pics",
    format: async (req, file) =>
      ["png", "jpg", "jpeg"].indexOf(file.mimetype.split("/")[1])
        ? "png"
        : "jpg",
    public_id: (req, file) => Date.now() + "-" + file.originalname,
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
});

export default upload;
