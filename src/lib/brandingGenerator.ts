// Branding Generator for Case Index RT
// Creates logo and branding materials for Stripe payment pages

export interface BrandingAssets {
  logo: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  fonts: {
    primary: string
    secondary: string
  }
  tagline: string
  description: string
}

export const CASE_INDEX_RT_BRANDING: BrandingAssets = {
  logo: `
    <svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="200" height="60" fill="#1a1a2e" rx="8"/>
      
      <!-- Logo Icon -->
      <g transform="translate(10, 10)">
        <!-- Scale Icon -->
        <path d="M8 2 L8 18 L2 18 L2 2 Z" fill="#4f46e5" stroke="#6366f1" stroke-width="1"/>
        <path d="M8 2 L14 2 L14 18 L8 18 Z" fill="#7c3aed" stroke="#8b5cf6" stroke-width="1"/>
        <path d="M14 2 L20 2 L20 18 L14 18 Z" fill="#dc2626" stroke="#ef4444" stroke-width="1"/>
        
        <!-- Justice Symbol -->
        <circle cx="11" cy="10" r="3" fill="none" stroke="#ffffff" stroke-width="1.5"/>
        <path d="M9 10 L13 10" stroke="#ffffff" stroke-width="1.5"/>
        <path d="M11 8 L11 12" stroke="#ffffff" stroke-width="1.5"/>
      </g>
      
      <!-- Text -->
      <text x="50" y="25" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff">
        Case Index RT
      </text>
      <text x="50" y="40" font-family="Arial, sans-serif" font-size="10" fill="#a1a1aa">
        Legal Workflow Automation
      </text>
    </svg>
  `,
  colors: {
    primary: '#4f46e5',      // Indigo
    secondary: '#7c3aed',     // Purple
    accent: '#dc2626',        // Red
    background: '#1a1a2e',   // Dark blue
    text: '#ffffff'           // White
  },
  fonts: {
    primary: 'Inter, system-ui, sans-serif',
    secondary: 'Arial, sans-serif'
  },
  tagline: 'Revolutionary Legal Workflow Automation',
  description: 'Advanced case tracking, AI-powered analysis, and automated court integrations for modern law firms.'
}

export class BrandingGenerator {
  static generateLogoHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Case Index RT - Logo</title>
        <style>
          body { margin: 0; padding: 20px; background: #f8fafc; font-family: Inter, sans-serif; }
          .logo-container { 
            background: white; 
            padding: 40px; 
            border-radius: 12px; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 600px;
            margin: 0 auto;
          }
          .logo { margin: 20px 0; }
          .brand-info { 
            margin-top: 30px; 
            text-align: left; 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px;
          }
          .color-palette { 
            display: flex; 
            gap: 10px; 
            margin: 20px 0; 
            flex-wrap: wrap;
          }
          .color-swatch { 
            width: 60px; 
            height: 60px; 
            border-radius: 8px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-size: 10px; 
            text-align: center;
          }
          .download-btn {
            background: #4f46e5;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            margin: 10px;
          }
        </style>
      </head>
      <body>
        <div class="logo-container">
          <h1>Case Index RT Branding</h1>
          
          <div class="logo">
            ${CASE_INDEX_RT_BRANDING.logo}
          </div>
          
          <div class="brand-info">
            <h3>Brand Colors</h3>
            <div class="color-palette">
              <div class="color-swatch" style="background: ${CASE_INDEX_RT_BRANDING.colors.primary}">
                Primary<br/>#4f46e5
              </div>
              <div class="color-swatch" style="background: ${CASE_INDEX_RT_BRANDING.colors.secondary}">
                Secondary<br/>#7c3aed
              </div>
              <div class="color-swatch" style="background: ${CASE_INDEX_RT_BRANDING.colors.accent}">
                Accent<br/>#dc2626
              </div>
              <div class="color-swatch" style="background: ${CASE_INDEX_RT_BRANDING.colors.background}">
                Background<br/>#1a1a2e
              </div>
            </div>
            
            <h3>Typography</h3>
            <p><strong>Primary Font:</strong> ${CASE_INDEX_RT_BRANDING.fonts.primary}</p>
            <p><strong>Secondary Font:</strong> ${CASE_INDEX_RT_BRANDING.fonts.secondary}</p>
            
            <h3>Brand Message</h3>
            <p><strong>Tagline:</strong> ${CASE_INDEX_RT_BRANDING.tagline}</p>
            <p><strong>Description:</strong> ${CASE_INDEX_RT_BRANDING.description}</p>
            
            <h3>Usage Guidelines</h3>
            <ul>
              <li>Use the logo on a white or light background for best visibility</li>
              <li>Maintain minimum clear space of 20px around the logo</li>
              <li>Do not alter colors or proportions</li>
              <li>Use primary color (#4f46e5) for buttons and CTAs</li>
              <li>Use secondary color (#7c3aed) for highlights and accents</li>
            </ul>
          </div>
          
          <button class="download-btn" onclick="downloadLogo()">Download Logo as SVG</button>
          <button class="download-btn" onclick="downloadBranding()">Download Branding Guide</button>
        </div>
        
        <script>
          function downloadLogo() {
            const svg = \`${CASE_INDEX_RT_BRANDING.logo}\`;
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'case-index-rt-logo.svg';
            a.click();
            URL.revokeObjectURL(url);
          }
          
          function downloadBranding() {
            const content = \`
# Case Index RT Branding Guide

## Logo
${CASE_INDEX_RT_BRANDING.logo}

## Colors
- Primary: ${CASE_INDEX_RT_BRANDING.colors.primary}
- Secondary: ${CASE_INDEX_RT_BRANDING.colors.secondary}
- Accent: ${CASE_INDEX_RT_BRANDING.colors.accent}
- Background: ${CASE_INDEX_RT_BRANDING.colors.background}
- Text: ${CASE_INDEX_RT_BRANDING.colors.text}

## Typography
- Primary: ${CASE_INDEX_RT_BRANDING.fonts.primary}
- Secondary: ${CASE_INDEX_RT_BRANDING.fonts.secondary}

## Brand Message
**Tagline:** ${CASE_INDEX_RT_BRANDING.tagline}
**Description:** ${CASE_INDEX_RT_BRANDING.description}

## Usage Guidelines
1. Use the logo on a white or light background for best visibility
2. Maintain minimum clear space of 20px around the logo
3. Do not alter colors or proportions
4. Use primary color (#4f46e5) for buttons and CTAs
5. Use secondary color (#7c3aed) for highlights and accents

## Stripe Integration
For Stripe payment pages, use:
- Company name: "Case Index RT"
- Description: "Revolutionary Legal Workflow Automation"
- Logo: Use the SVG logo provided above
- Colors: Primary (#4f46e5) and Secondary (#7c3aed)
            \`;
            
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'case-index-rt-branding-guide.md';
            a.click();
            URL.revokeObjectURL(url);
          }
        </script>
      </body>
      </html>
    `;
  }

  static generateStripeBranding(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Case Index RT - Stripe Branding</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: Inter, sans-serif;
            min-height: 100vh;
          }
          .container { 
            background: white; 
            padding: 40px; 
            border-radius: 16px; 
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            max-width: 800px;
            margin: 0 auto;
          }
          .logo-section {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: #f8fafc;
            border-radius: 12px;
          }
          .stripe-info {
            background: #4f46e5;
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin: 20px 0;
          }
          .download-section {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            justify-content: center;
            margin-top: 30px;
          }
          .download-btn {
            background: #4f46e5;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            transition: background 0.2s;
          }
          .download-btn:hover {
            background: #3730a3;
          }
          .logo-preview {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-section">
            <h1>Case Index RT</h1>
            <p style="color: #6b7280; font-size: 18px; margin: 10px 0;">Revolutionary Legal Workflow Automation</p>
            
            <div class="logo-preview">
              ${CASE_INDEX_RT_BRANDING.logo}
            </div>
          </div>
          
          <div class="stripe-info">
            <h2>Stripe Payment Page Branding</h2>
            <p><strong>Company Name:</strong> Case Index RT</p>
            <p><strong>Description:</strong> Revolutionary Legal Workflow Automation</p>
            <p><strong>Tagline:</strong> Advanced case tracking, AI-powered analysis, and automated court integrations for modern law firms.</p>
            <p><strong>Primary Color:</strong> #4f46e5 (Indigo)</p>
            <p><strong>Secondary Color:</strong> #7c3aed (Purple)</p>
            <p><strong>Accent Color:</strong> #dc2626 (Red)</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin: 20px 0;">
            <h3>Stripe Configuration</h3>
            <p><strong>Business Type:</strong> Software as a Service (SaaS)</p>
            <p><strong>Industry:</strong> Legal Technology</p>
            <p><strong>Website:</strong> https://caseindexrt.com</p>
            <p><strong>Support Email:</strong> support@caseindexrt.com</p>
            <p><strong>Privacy Policy:</strong> https://caseindexrt.com/privacy</p>
            <p><strong>Terms of Service:</strong> https://caseindexrt.com/terms</p>
          </div>
          
          <div class="download-section">
            <button class="download-btn" onclick="downloadSVG()">Download Logo (SVG)</button>
            <button class="download-btn" onclick="downloadPNG()">Download Logo (PNG)</button>
            <button class="download-btn" onclick="downloadBranding()">Download Branding Guide</button>
            <button class="download-btn" onclick="downloadStripeConfig()">Download Stripe Config</button>
          </div>
        </div>
        
        <script>
          function downloadSVG() {
            const svg = \`${CASE_INDEX_RT_BRANDING.logo}\`;
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'case-index-rt-logo.svg';
            a.click();
            URL.revokeObjectURL(url);
          }
          
          function downloadPNG() {
            // Create canvas to convert SVG to PNG
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 400;
            canvas.height = 120;
            
            const img = new Image();
            const svgBlob = new Blob([\`${CASE_INDEX_RT_BRANDING.logo}\`], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            
            img.onload = function() {
              ctx.drawImage(img, 0, 0, 400, 120);
              canvas.toBlob(function(blob) {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'case-index-rt-logo.png';
                a.click();
                URL.revokeObjectURL(url);
              });
            };
            img.src = url;
          }
          
          function downloadBranding() {
            const content = \`# Case Index RT Branding Guide

## Company Information
- **Name:** Case Index RT
- **Tagline:** Revolutionary Legal Workflow Automation
- **Description:** Advanced case tracking, AI-powered analysis, and automated court integrations for modern law firms.
- **Website:** https://caseindexrt.com
- **Industry:** Legal Technology / SaaS

## Logo Usage
${CASE_INDEX_RT_BRANDING.logo}

## Brand Colors
- **Primary:** #4f46e5 (Indigo) - Use for buttons, CTAs, and primary elements
- **Secondary:** #7c3aed (Purple) - Use for highlights and accents
- **Accent:** #dc2626 (Red) - Use for alerts and important elements
- **Background:** #1a1a2e (Dark Blue) - Use for dark sections
- **Text:** #ffffff (White) - Use for text on dark backgrounds

## Typography
- **Primary Font:** Inter, system-ui, sans-serif
- **Secondary Font:** Arial, sans-serif

## Stripe Integration Guidelines
1. Use the logo on a white background for Stripe checkout pages
2. Maintain brand consistency across all payment touchpoints
3. Use primary color (#4f46e5) for payment buttons
4. Include company description in Stripe product descriptions
5. Ensure logo is high resolution (minimum 200x60px)

## Contact Information
- **Support:** support@caseindexrt.com
- **Privacy Policy:** https://caseindexrt.com/privacy
- **Terms of Service:** https://caseindexrt.com/terms
            \`;
            
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'case-index-rt-branding-guide.md';
            a.click();
            URL.revokeObjectURL(url);
          }
          
          function downloadStripeConfig() {
            const config = \`{
  "company": {
    "name": "Case Index RT",
    "description": "Revolutionary Legal Workflow Automation",
    "website": "https://caseindexrt.com",
    "support_email": "support@caseindexrt.com",
    "privacy_policy": "https://caseindexrt.com/privacy",
    "terms_of_service": "https://caseindexrt.com/terms"
  },
  "branding": {
    "primary_color": "#4f46e5",
    "secondary_color": "#7c3aed",
    "accent_color": "#dc2626",
    "logo_url": "https://caseindexrt.com/logo.svg"
  },
  "products": {
    "professional": {
      "name": "Case Index RT Professional",
      "description": "Unlimited case searches, AI-powered summaries, calendar integration",
      "price": 99,
      "currency": "usd",
      "interval": "month"
    },
    "team": {
      "name": "Case Index RT Team",
      "description": "Everything in Professional + team features, Clio integration",
      "price": 299,
      "currency": "usd",
      "interval": "month"
    }
  }
}\`;
            
            const blob = new Blob([config], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'case-index-rt-stripe-config.json';
            a.click();
            URL.revokeObjectURL(url);
          }
        </script>
      </body>
      </html>
    `;
  }
}
