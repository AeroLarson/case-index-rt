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
          <p className="text-purple-300 text-lg">Last updated: January 15, 2025</p>
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
              Case Index RT is a revolutionary legal workflow automation platform that provides:
            </p>
            <ul className="text-gray-300 mb-6 space-y-2 ml-6">
              <li>• Real-time case search and tracking for San Diego County court cases</li>
              <li>• AI-powered case analysis, summaries, and timeline generation</li>
              <li>• Automated calendar synchronization with court hearing dates and locations</li>
              <li>• Document management with county database integration</li>
              <li>• Clio CRM integration for seamless practice management</li>
              <li>• Advanced analytics and reporting for legal professionals</li>
              <li>• Court rules search and deadline tracking</li>
              <li>• Tentative ruling auto-download and case monitoring</li>
            </ul>

            <h2 className="text-white text-2xl font-semibold mb-4">3. User Accounts and Authentication</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and password. 
              Our service uses Google OAuth 2.0 for secure authentication. You agree to accept 
              responsibility for all activities that occur under your account. We reserve the right 
              to refuse service, terminate accounts, or remove content at our sole discretion.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">4. Acceptable Use Policy</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              You agree not to use the Service for any unlawful purpose or any purpose prohibited 
              under this clause. You may not:
            </p>
            <ul className="text-gray-300 mb-6 space-y-2 ml-6">
              <li>• Use the Service in any manner that could damage, disable, overburden, or impair any server</li>
              <li>• Attempt to gain unauthorized access to any portion of the Service</li>
              <li>• Use automated systems to access the Service without permission</li>
              <li>• Violate any applicable local, state, national, or international law</li>
              <li>• Transmit any harmful, threatening, or illegal content</li>
              <li>• Interfere with or disrupt the Service or servers connected to the Service</li>
            </ul>

            <h2 className="text-white text-2xl font-semibold mb-4">5. Subscription Plans and Billing</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              We offer the following subscription plans:
            </p>
            <ul className="text-gray-300 mb-6 space-y-2 ml-6">
              <li><strong>Free Plan:</strong> 1 case search per month, basic case information only</li>
              <li><strong>Professional Plan:</strong> $99/month - Unlimited searches, full case details, AI summaries, calendar integration, Clio CRM integration</li>
              <li><strong>Team Plan:</strong> $299/month - Up to 5 users, all Professional features, team collaboration tools, dedicated support</li>
              <li><strong>Enterprise Plan:</strong> Custom pricing for 5+ users - Contact sales for pricing</li>
            </ul>
            <p className="text-gray-300 mb-6 leading-relaxed">
              All subscriptions are billed monthly in advance. You may cancel your subscription at any time. 
              Refunds are not provided for partial months. We reserve the right to change our pricing with 
              30 days notice to existing subscribers.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">6. Data and Privacy</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your privacy is important to us. We collect and process data as described in our Privacy Policy. 
              By using our Service, you consent to the collection and use of information in accordance with 
              our Privacy Policy. We implement industry-standard security measures to protect your data.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">7. Third-Party Integrations</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Our Service integrates with third-party services including:
            </p>
            <ul className="text-gray-300 mb-6 space-y-2 ml-6">
              <li>• San Diego County Court systems for real-time case data</li>
              <li>• Clio CRM for practice management integration</li>
              <li>• Google Calendar and Microsoft Outlook for calendar synchronization</li>
              <li>• OpenAI for AI-powered case analysis and summaries</li>
              <li>• Stripe for secure payment processing</li>
            </ul>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your use of these third-party services is subject to their respective terms of service and privacy policies.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">8. Intellectual Property</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              The Service and its original content, features, and functionality are and will remain the 
              exclusive property of Case Index RT and its licensors. The Service is protected by copyright, 
              trademark, and other laws. Our trademarks and trade dress may not be used in connection with 
              any product or service without our prior written consent.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">9. Disclaimers and Limitations</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              The information provided through our Service is for informational purposes only and should 
              not be considered legal advice. We make no warranties about the accuracy, reliability, or 
              completeness of the information provided. The Service is provided "as is" without warranties 
              of any kind, either express or implied.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              In no event shall Case Index RT, nor its directors, employees, partners, agents, suppliers, 
              or affiliates, be liable for any indirect, incidental, special, consequential, or punitive 
              damages, including without limitation, loss of profits, data, use, goodwill, or other 
              intangible losses, resulting from your use of the Service.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">11. Termination</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              We may terminate or suspend your account and bar access to the Service immediately, without 
              prior notice or liability, under our sole discretion, for any reason whatsoever and without 
              limitation, including but not limited to a breach of the Terms.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              These Terms shall be interpreted and governed by the laws of the State of California, 
              without regard to its conflict of law provisions. Our failure to enforce any right or 
              provision of these Terms will not be considered a waiver of those rights.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">13. Changes to Terms</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
              If a revision is material, we will provide at least 30 days notice prior to any new terms 
              taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">14. Contact Information</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-gray-300 mb-2"><strong>Email:</strong> legal@caseindexrt.com</p>
              <p className="text-gray-300 mb-2"><strong>Website:</strong> https://caseindexrt.com</p>
              <p className="text-gray-300"><strong>Address:</strong> Case Index RT, San Diego, CA</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}