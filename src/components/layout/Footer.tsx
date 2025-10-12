'use client'

export default function Footer() {
  return (
    <footer 
      id="footer-main"
      className="border-t border-purple-400/10 lg:ml-60"
      style={{
        background: '#0f0520',
        padding: '48px 24px 24px'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Trusted By Section */}
        <div className="text-center mb-8">
          <p className="text-gray-400 text-sm mb-4">Trusted by Professionals and Teams</p>
          <div className="flex justify-center items-center gap-4 sm:gap-6 lg:gap-12 flex-wrap opacity-60">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-layer-group text-gray-400 text-lg sm:text-xl" />
              <span className="text-gray-400 text-xs sm:text-sm font-medium">Layers</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-feather text-gray-400 text-lg sm:text-xl" />
              <span className="text-gray-400 text-xs sm:text-sm font-medium">FeatherDev</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-arrow-up-right-dots text-gray-400 text-lg sm:text-xl" />
              <span className="text-gray-400 text-xs sm:text-sm font-medium">Alt+Shift</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-box text-gray-400 text-lg sm:text-xl" />
              <span className="text-gray-400 text-xs sm:text-sm font-medium">Lightbox</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-chart-pie text-gray-400 text-lg sm:text-xl" />
              <span className="text-gray-400 text-xs sm:text-sm font-medium">Segment</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-cloud text-gray-400 text-lg sm:text-xl" />
              <span className="text-gray-400 text-xs sm:text-sm font-medium">Sisyphus</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-6 border-t border-purple-400/10">
          <p className="text-gray-500 text-xs">
            &copy; 2025 Case Index RT. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            <a href="#" className="text-purple-400 no-underline hover:text-purple-300">Privacy Policy</a> |{' '}
            <a href="#" className="text-purple-400 no-underline">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  )
}


