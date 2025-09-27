const mongoose = require('mongoose');

const CurrentLocationSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, index: true, trim: true },
  driverName: { type: String, trim: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  busNumber: { type: String, trim: true }
}, { versionKey: false, collection: 'currentlocations' });

CurrentLocationSchema.index({ vehicleNumber: 1, timestamp: -1 });
// New index for busNumber lookups
CurrentLocationSchema.index({ busNumber: 1, timestamp: -1 });

// Normalize identifiers (uppercase + trim) before save
CurrentLocationSchema.pre('save', function(next){
  if(this.vehicleNumber) this.vehicleNumber = this.vehicleNumber.trim().toUpperCase();
  if(this.busNumber) this.busNumber = this.busNumber.trim().toUpperCase();
  next();
});

module.exports = mongoose.model('CurrentLocation', CurrentLocationSchema);
