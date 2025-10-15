// Simple script to create placeholder PWA icons
const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const createIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="${size}" height="${size}" rx="${size/6}" fill="url(#gradient0_linear_1_1)"/>
<path d="M${size/2} ${size/3}C${size*0.7} ${size/3} ${size*0.8} ${size*0.4} ${size*0.8} ${size/2}C${size*0.8} ${size*0.6} ${size*0.7} ${size*0.7} ${size/2} ${size*0.7}C${size*0.3} ${size*0.7} ${size*0.2} ${size*0.6} ${size*0.2} ${size/2}C${size*0.2} ${size*0.4} ${size*0.3} ${size/3} ${size/2} ${size/3}Z" fill="white"/>
<path d="M${size/2} ${size*0.35}C${size*0.6} ${size*0.35} ${size*0.65} ${size*0.4} ${size*0.65} ${size/2}C${size*0.65} ${size*0.6} ${size*0.6} ${size*0.65} ${size/2} ${size*0.65}C${size*0.4} ${size*0.65} ${size*0.35} ${size*0.6} ${size*0.35} ${size/2}C${size*0.35} ${size*0.4} ${size*0.4} ${size*0.35} ${size/2} ${size*0.35}Z" fill="#8B5CF6"/>
<defs>
<linearGradient id="gradient0_linear_1_1" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
<stop stop-color="#8B5CF6"/>
<stop offset="1" stop-color="#7C4BD6"/>
</linearGradient>
</defs>
</svg>`;
};

// Create icons for different sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');

sizes.forEach(size => {
  const svg = createIcon(size);
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(publicDir, filename);
  
  // For now, just create the SVG file
  fs.writeFileSync(filepath.replace('.png', '.svg'), svg);
  console.log(`Created icon-${size}x${size}.svg`);
});

// Create badge and screenshots
const badgeSvg = createIcon(72);
fs.writeFileSync(path.join(publicDir, 'badge-72x72.svg'), badgeSvg);

const screenshotSvg = `<svg width="1280" height="720" viewBox="0 0 1280 720" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="1280" height="720" fill="#1a0b2e"/>
<text x="640" y="360" text-anchor="middle" fill="white" font-size="48" font-family="Arial">Case Index RT Desktop</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'screenshot-desktop.svg'), screenshotSvg);

const mobileSvg = `<svg width="390" height="844" viewBox="0 0 390 844" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="390" height="844" fill="#1a0b2e"/>
<text x="195" y="422" text-anchor="middle" fill="white" font-size="24" font-family="Arial">Case Index RT Mobile</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'screenshot-mobile.svg'), mobileSvg);

console.log('Created all placeholder icons as SVG files');
