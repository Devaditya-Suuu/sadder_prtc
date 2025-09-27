const express = require('express');
const Corridor = require('../models/Corridor');
const BusStop = require('../models/BusStop');
const CurrentLocation = require('../models/CurrentLocation');

const router = express.Router();

// Utility: haversine distance in meters
function haversine(lat1, lon1, lat2, lon2){
  const R = 6371000; // m
  const toRad = d=> d*Math.PI/180;
  const dLat = toRad(lat2-lat1);
  const dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Generate (or regenerate) bus stops along a corridor by sampling simplifiedLine coordinates
router.post('/:key/generate-stops', async (req,res) => {
  try {
    const { key } = req.params;
    const { everyMeters = 800, limit = 15 } = req.body || {}; // default spacing
    const corridor = await Corridor.findOne({ key }).lean();
    if(!corridor) return res.status(404).json({ success:false, message:'Corridor not found' });
    if(!corridor.simplifiedLine || !corridor.simplifiedLine.coordinates) return res.status(400).json({ success:false, message:'Corridor missing simplifiedLine' });

    // Build cumulative distances along simplified line if not present
    const coords = corridor.simplifiedLine.coordinates.map(([lng,lat])=>({ lat, lng }));
    let cumulative = [0];
    for(let i=1;i<coords.length;i++){
      cumulative[i] = cumulative[i-1] + haversine(coords[i-1].lat, coords[i-1].lng, coords[i].lat, coords[i].lng);
    }

    const totalLen = cumulative[cumulative.length-1];
    const targetDistances = [];
    for(let d=0; d<=totalLen && targetDistances.length < limit; d+= everyMeters){ targetDistances.push(d); }

    // For each target distance, pick nearest point index
    const stopsToInsert = [];
    targetDistances.forEach((d,idx)=>{
      // binary / linear search since list small
      let closestIdx = 0; let bestDiff = Infinity;
      for(let i=0;i<cumulative.length;i++){
        const diff = Math.abs(cumulative[i]-d); if(diff<bestDiff){ bestDiff = diff; closestIdx = i; }
      }
      const p = coords[closestIdx];
      stopsToInsert.push({
        name: `${key.replace(/-/g,' ')} Stop ${idx+1}`,
        location: { latitude: p.lat, longitude: p.lng },
        stopId: `${key}-S${idx+1}`,
        corridorKey: key,
        sequence: idx+1,
        distanceAlongCorridor: Math.round(d)
      });
    });

    // Remove existing auto-generated corridor stops for that key
    await BusStop.deleteMany({ corridorKey: key });
    const inserted = await BusStop.insertMany(stopsToInsert);

    res.json({ success:true, count: inserted.length, data: inserted });
  } catch(e){
    console.error('generate-stops error', e);
    res.status(500).json({ success:false, message: e.message });
  }
});

// Get ordered stops for corridor
router.get('/:key/stops', async (req,res) => {
  try {
    const { key } = req.params;
    const stops = await BusStop.find({ corridorKey: key }).sort({ sequence:1 }).lean();
    res.json({ success:true, count: stops.length, data: stops });
  } catch(e){
    res.status(500).json({ success:false, message:e.message });
  }
});

// Distance of a vehicle to next stop along the corridor
router.get('/:key/vehicle/:vehicleNumber/next-stop', async (req,res) => {
  try {
    const { key, vehicleNumber } = req.params;
    const v = vehicleNumber.trim();
    const regex = new RegExp(`^${v}$`, 'i');
    const locationDoc = await CurrentLocation.findOne({
      $or: [ { vehicleNumber: regex }, { busNumber: regex } ]
    }).sort({ timestamp:-1 }).lean();
    if(!locationDoc) return res.status(404).json({ success:false, message:'Vehicle not found. Use /api/current-locations to list available vehicleNumber values.' });

    const stops = await BusStop.find({ corridorKey: key }).sort({ sequence:1 }).lean();
    if(!stops.length) return res.status(404).json({ success:false, message:'No stops for corridor' });

    // Find closest stop ahead (nearest straight line)
    let nearest = null; let minDist = Infinity;
    stops.forEach(s => {
      const d = haversine(locationDoc.latitude, locationDoc.longitude, s.location.latitude, s.location.longitude);
      if(d < minDist){ minDist = d; nearest = s; }
    });

    res.json({ success:true, data:{ vehicleNumber: locationDoc.vehicleNumber, current: { latitude: locationDoc.latitude, longitude: locationDoc.longitude }, nextStop: nearest, distanceMeters: Math.round(minDist) } });
  } catch(e){
    res.status(500).json({ success:false, message:e.message });
  }
});

module.exports = router;
