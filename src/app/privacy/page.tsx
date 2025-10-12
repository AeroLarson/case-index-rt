'use client'

export default function PrivacyPage() {
  return (
    <main 
      className="min-h-screen animated-aura"
      style={{
        background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
        padding: '40px 24px'
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-white text-4xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-purple-300 text-lg">Last updated: October 11, 2025</p>
        </div>

        <div className="apple-card p-8">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-white text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              We collect information you provide directly to us, such as when you create an account, 
              use our services, or contact us for support. This may include your name, email address, 
              phone number, and any case information you choose to track.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              We use the information we collect to provide, maintain, and improve our services, 
              process transactions, send you technical notices and support messages, and communicate 
              with you about products, services, and promotional offers.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except as described in this policy. We may share your information 
              with trusted third parties who assist us in operating our website and conducting our business.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">4. Data Security</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. All data is encrypted in 
              transit and at rest using industry-standard protocols.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">5. Cookies and Tracking</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience on our 
              website. You can control cookie settings through your browser preferences, though 
              some features may not function properly if cookies are disabled.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              You have the right to access, update, or delete your personal information. You may 
              also opt out of certain communications from us. To exercise these rights, please 
              contact us using the information provided below.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">7. Children's Privacy</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Our services are not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If we become aware that we have 
              collected personal information from a child under 13, we will take steps to delete such information.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes 
              by posting the new policy on this page and updating the "Last updated" date. Your continued 
              use of our services after any changes constitutes acceptance of the updated policy.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              If you have any questions about this privacy policy or our privacy practices, please 
              contact us at:
            </p>
            <div className="bg-white/5 rounded-2xl p-6">
              <p className="text-gray-300 mb-2">
                <strong className="text-white">Email:</strong> privacy@caseindexrt.com
              </p>
              <p className="text-gray-300 mb-2">
                <strong className="text-white">Phone:</strong> (555) 123-4567
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Address:</strong> 123 Legal Street, San Diego, CA 92101
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
