module.exports = (req, res, next) => {
  const { selfieUrl } = req.body;

  if (!selfieUrl) {
    return res.status(400).json({
      success: false,
      message: "Selfie image is required",
    });
  }

  // ❗ DO NOT validate location here
  // because remote attendance may skip it

  next();
};
