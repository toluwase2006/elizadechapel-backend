const { BibleStudy, ProverbialDigest } = require("../models/content");
const { cloudinary, hasCloudinaryConfig } = require("../config/cloudinary");

const getModel = (type) => (type === "bible-study" ? BibleStudy : ProverbialDigest);

const toClientEntry = (entry) => ({
  ...entry,
  id: entry._id.toString(),
  documentDataUrl: entry.documentUrl,
  _id: undefined,
});

const uploadDocument = async (type, documentDataUrl, documentName) => {
  if (!hasCloudinaryConfig()) {
    const error = new Error("Cloudinary is not configured on the server.");
    error.status = 503;
    throw error;
  }
  if (typeof documentDataUrl !== "string" || !documentDataUrl.startsWith("data:")) {
    const error = new Error("documentDataUrl must be a valid data URL.");
    error.status = 400;
    throw error;
  }

  const result = await cloudinary.uploader.upload(documentDataUrl, {
    folder: `elizade-chapel/${type}`,
    resource_type: "auto",
    use_filename: true,
    filename_override: documentName,
    unique_filename: true,
  });

  return {
    documentUrl: result.secure_url,
    documentPublicId: result.public_id,
    documentResourceType: result.resource_type,
  };
};

const listContent = async (req, res, next) => {
  try {
    const Model = getModel(req.params.type);
    const entries = await Model.find().sort({ createdAt: -1 }).lean();
    res.json(entries.map(toClientEntry));
  } catch (error) {
    next(error);
  }
};

const createContent = async (req, res, next) => {
  let uploadedDocument;
  try {
    const Model = getModel(req.params.type);
    const { documentDataUrl, documentName, ...content } = req.body;
    uploadedDocument = await uploadDocument(req.params.type, documentDataUrl, documentName);
    const entry = await Model.create({ ...content, documentName, ...uploadedDocument });
    res.status(201).json(toClientEntry(entry.toObject()));
  } catch (error) {
    if (uploadedDocument?.documentPublicId) {
      await cloudinary.uploader.destroy(uploadedDocument.documentPublicId, {
        resource_type: uploadedDocument.documentResourceType,
      }).catch((cleanupError) => console.error("Cloudinary cleanup failed:", cleanupError));
    }
    next(error);
  }
};

const deleteContent = async (req, res, next) => {
  try {
    const Model = getModel(req.params.type);
    const entry = await Model.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: "Content entry not found." });
    }
    if (entry.documentPublicId) {
      await cloudinary.uploader.destroy(entry.documentPublicId, {
        resource_type: entry.documentResourceType || "image",
      });
    }
    await entry.deleteOne();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { listContent, createContent, deleteContent };
