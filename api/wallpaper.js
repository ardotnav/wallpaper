const { generateSVG } = require('../utils/wallpaperGenerator');
const { getIndiaDate } = require('../utils/dateUtils');

module.exports = async (req, res) => {
  try {
    const now = getIndiaDate();
    const svg = generateSVG(now);

    // Convert SVG to PNG using sharp
    const svgBuffer = Buffer.from(svg);
    
    try {
      const sharp = require('sharp');
      const pngBuffer = await sharp(svgBuffer).png().toBuffer();
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(200).send(pngBuffer);
    } catch (sharpError) {
      // Fallback to SVG if sharp is not available
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(200).send(svg);
    }
  } catch (error) {
    console.error('Error generating wallpaper:', error);
    res.status(500).json({ error: 'Failed to generate wallpaper' });
  }
};
