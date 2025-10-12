'use client'

export default function TermsPage() {
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
          <h1 className="text-white text-4xl font-bold mb-4 tracking-tight">Terms of Service</h1>
          <p className="text-purple-300 text-lg">Last updated: October 11, 2025</p>
        </div>

        <div className="apple-card p-8">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-white text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              By accessing and using Case Index RT ("the Service"), you accept and agree to be bound 
              by the terms and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Case Index RT provides legal case tracking and search services for California court cases. 
              Our service includes AI-powered case summaries, calendar integration, and case management 
              tools designed for legal professionals.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and password. 
              You agree to accept responsibility for all activities that occur under your account 
              or password. We reserve the right to refuse service, terminate accounts, or remove 
              content at our sole discretion.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              You agree not to use the Service for any unlawful purpose or any purpose prohibited 
              under this clause. You may not use the Service in any manner that could damage, 
              disable, overburden, or impair any server, or the network(s) connected to any server.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">5. Subscription and Billing</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Subscription fees are billed in advance on a monthly or annual basis. All fees are 
              non-refundable except as required by law. We may change our fees at any time by 
              providing notice of the change on the Service or by sending you an email notification.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              The Service and its original content, features, and functionality are and will remain 
              the exclusive property of Case Index RT and its licensors. The Service is protected 
              by copyright, trademark, and other laws.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">7. Privacy Policy</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy, which also governs 
              your use of the Service, to understand our practices.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">8. Disclaimers</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              The information on this Service is provided on an "as is" basis. To the fullest extent 
              permitted by law, Case Index RT excludes all representations, warranties, conditions 
              and terms relating to our Service and the use of this Service.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              In no event shall Case Index RT, nor its directors, employees, partners, agents, 
              suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, 
              or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
              or other intangible losses.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">10. Termination</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              We may terminate or suspend your account and bar access to the Service immediately, 
              without prior notice or liability, under our sole discretion, for any reason whatsoever 
              and without limitation, including but not limited to a breach of the Terms.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">11. Governing Law</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              These Terms shall be interpreted and governed by the laws of the State of California, 
              without regard to its conflict of law provisions. Our failure to enforce any right 
              or provision of these Terms will not be considered a waiver of those rights.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">12. Changes to Terms</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any 
              time. If a revision is material, we will provide at least 30 days notice prior to any 
              new terms taking effect.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-white/5 rounded-2xl p-6">
              <p className="text-gray-300 mb-2">
                <strong className="text-white">Email:</strong> legal@caseindexrt.com
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
