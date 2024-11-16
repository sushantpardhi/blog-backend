import tokenModel from "../models/token.js";

export const manageTokenCount = async () => {
  try {
    const count = await tokenModel.countDocuments();
    if (count > 10) {
      const oldestToken = await tokenModel.findOne().sort({ createdAt: 1 });
      if (oldestToken) await tokenModel.deleteOne({ _id: oldestToken._id });
    }
  } catch (err) {
    console.error("Error managing token count:", err);
  }
};
