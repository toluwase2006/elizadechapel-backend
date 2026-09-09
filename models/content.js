const mongoose = require("mongoose");

const bibleStudyDays = ["Sunday", "Tuesday", "Thursday"];
const digestDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const bibleStudySchema = new mongoose.Schema(
  {
    day: { type: String, required: true, enum: bibleStudyDays },
    time: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    scripture: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    documentName: { type: String, required: true, trim: true },
    documentUrl: { type: String, required: true },
    documentPublicId: { type: String, required: true },
    documentResourceType: { type: String, required: true },
  },
  { timestamps: true },
);

const proverbialDigestSchema = new mongoose.Schema(
  {
    day: { type: String, required: true, enum: digestDays },
    proverb: { type: String, required: true, trim: true },
    reflection: { type: String, required: true, trim: true },
    documentName: { type: String, required: true, trim: true },
    documentUrl: { type: String, required: true },
    documentPublicId: { type: String, required: true },
    documentResourceType: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = {
  BibleStudy: mongoose.model("BibleStudy", bibleStudySchema),
  ProverbialDigest: mongoose.model("ProverbialDigest", proverbialDigestSchema),
};
