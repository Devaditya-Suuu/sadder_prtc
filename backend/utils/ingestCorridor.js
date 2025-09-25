// Corridor ingestion script
// Usage: node utils/ingestCorridor.js <path_to_json>

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const turf = require('@turf/turf');
const polyline = require('@mapbox/polyline');
const Corridor = require('../models/Corridor');

const KEY = 'bengaluru-tumkur';
const NAME = 'Bengaluru ⇄ Tumkur Corridor';

async function run() {
  try {
    const fileArg = process.argv[2];
    if (!fileArg) {
      console.error('Please provide path to JSON file (e.g. node utils/ingestCorridor.js data/tumkur_bengaluru_osrm.json)');
      process.exit(1);
    }
    const filePath = path.resolve(process.cwd(), fileArg);
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!raw.route || !Array.isArray(raw.route) || raw.route.length < 2) {
      throw new Error('Invalid JSON format: expected { route: [ { lat, lng }, ... ] }');
    }

    const fullCoords = raw.route.map(p => [p.lng, p.lat]); // GeoJSON order
    const fullLine = turf.lineString(fullCoords);

    const lengthKm = turf.length(fullLine, { units: 'kilometers' });

    // Simplify (tolerance tweakable)
    const simplified = turf.simplify(fullLine, { tolerance: 0.0005, highQuality: false });

    // Cumulative distances (meters)
    const cumulative = [0];
    for (let i = 1; i < fullCoords.length; i++) {
      const d = turf.distance(
        turf.point(fullCoords[i - 1]),
        turf.point(fullCoords[i]),
        { units: 'meters' }
      );
      cumulative.push(Math.round(cumulative[i - 1] + d));
    }

    const encoded = polyline.encode(simplified.geometry.coordinates.map(([lng, lat]) => [lat, lng]));

    const doc = await Corridor.findOneAndUpdate(
      { key: KEY },
      {
        key: KEY,
        name: NAME,
        fullLine: { type: 'LineString', coordinates: fullCoords },
        simplifiedLine: { type: 'LineString', coordinates: simplified.geometry.coordinates },
        encodedPolyline: encoded,
        cumulativeDistances: cumulative,
        lengthMeters: Math.round(lengthKm * 1000),
        endpoints: {
          start: { type: 'Point', coordinates: fullCoords[0] },
          end: { type: 'Point', coordinates: fullCoords[fullCoords.length - 1] }
        },
        meta: {
          simplifiedPointCount: simplified.geometry.coordinates.length,
          sourcePoints: fullCoords.length
        }
      },
      { upsert: true, new: true }
    );

    console.log('Corridor stored:', doc.key, 'lengthMeters:', doc.lengthMeters, 'simplified points:', doc.meta.simplifiedPointCount);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Ingestion failed:', err.message);
    process.exit(1);
  }
}

run();
