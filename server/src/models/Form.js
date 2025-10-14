const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true }, // text, email, number, textarea, select, radio, checkbox, date, image
    required: { type: Boolean, default: false },
    options: [{ type: String }],
  },
  { _id: false }
);

const FormSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    fields: [FieldSchema],
    publicId: { type: String, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Form', FormSchema);