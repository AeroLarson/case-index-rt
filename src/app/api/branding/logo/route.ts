import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'svg'
    
    if (format === 'jpeg' || format === 'jpg') {
      // For JPEG, we'll return the SVG with instructions to convert
      const svgLogo = `
        <svg width="400" height="120" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
          <!-- Background -->
          <rect width="400" height="120" fill="#ffffff" rx="16"/>
          <rect x="2" y="2" width="396" height="116" fill="#1a1a2e" rx="14"/>
          
          <!-- Logo Icon -->
          <g transform="translate(20, 30)">
            <!-- Scale Icon -->
            <path d="M16 4 L16 36 L4 36 L4 4 Z" fill="#4f46e5" stroke="#6366f1" stroke-width="2"/>
            <path d="M16 4 L28 4 L28 36 L16 36 Z" fill="#7c3aed" stroke="#8b5cf6" stroke-width="2"/>
            <path d="M28 4 L40 4 L40 36 L28 36 Z" fill="#dc2626" stroke="#ef4444" stroke-width="2"/>
            
            <!-- Justice Symbol -->
            <circle cx="22" cy="20" r="6" fill="none" stroke="#ffffff" stroke-width="3"/>
            <path d="M18 20 L26 20" stroke="#ffffff" stroke-width="3"/>
            <path d="M22 16 L22 24" stroke="#ffffff" stroke-width="3"/>
          </g>
          
          <!-- Text -->
          <text x="80" y="50" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#ffffff">
            Case Index RT
          </text>
          <text x="80" y="80" font-family="Arial, sans-serif" font-size="20" fill="#a1a1aa">
            Revolutionary Legal Workflow Automation
          </text>
        </svg>
      `
      
      return new NextResponse(svgLogo, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': 'attachment; filename="case-index-rt-logo.svg"'
        }
      })
    }
    
    // Default SVG response
    const svgLogo = `
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
    `
    
    return new NextResponse(svgLogo, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': 'attachment; filename="case-index-rt-logo.svg"'
      }
    })
    
  } catch (error) {
    console.error('Error generating logo:', error)
    return NextResponse.json({ error: 'Failed to generate logo' }, { status: 500 })
  }
}
