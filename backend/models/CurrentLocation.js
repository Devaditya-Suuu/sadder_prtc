const mongoose = require('mongoose');

const currentLocationSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, index: true, trim: true },
  driverName: { type: String, trim: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true }
}, { versionKey: false });

// Compound index for frequent queries by recency + vehicle
currentLocationSchema.index({ vehicleNumber: 1, timestamp: -1 });

module.exports = mongoose.model('CurrentLocation', currentLocationSchema);
