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
          <p className="text-purple-300 text-lg">Last updated: January 15, 2025</p>
        </div>

        <div className="apple-card p-8">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-white text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
              We collect information you provide directly to us and information we obtain automatically when you use our Service.
            </p>
            
            <h3 className="text-white text-xl font-semibold mb-3">Information You Provide:</h3>
            <ul className="text-gray-300 mb-6 space-y-2 ml-6">
              <li>• Account information (name, email address) via Google OAuth</li>
              <li>• Case information you choose to track and save</li>
              <li>• Search queries and case numbers you search for</li>
              <li>• Calendar events and case deadlines you create</li>
              <li>• Documents you upload or download through our Service</li>
              <li>• Communication with our support team</li>
            </ul>

            <h3 className="text-white text-xl font-semibold mb-3">Information We Collect Automatically:</h3>
            <ul className="text-gray-300 mb-6 space-y-2 ml-6">
              <li>• Usage data (pages visited, features used, time spent)</li>
              <li>• Device information (browser type, operating system)</li>
              <li>• IP address and general location information</li>
              <li>• Performance data and error logs</li>
              <li>• Cookies and similar tracking technologies</li>
            </ul>

            <h2 className="text-white text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
              We use the information we collect to provide, maintain, and improve our Service:
            </p>
            <ul className="text-gray-300 mb-6 space-y-2 ml-6">
              <li>• Provide case search, tracking, and management services</li>
              <li>• Generate AI-powered case summaries and analysis</li>
              <li>• Sync calendar events and court hearing information</li>
              <li>• Integrate with Clio CRM and other third-party services</li>
              <li>• Process payments and manage subscriptions</li>
              <li>• Send notifications about case updates and deadlines</li>
              <li>• Provide customer support and respond to inquiries</li>
              <li>• Analyze usage patterns to improve our Service</li>
              <li>• Ensure security and prevent fraud</li>
            </ul>

            <h2 className="text-white text-2xl font-semibold mb-4">3. Information Sharing and Disclosure</h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
            </p>
            
            <h3 className="text-white text-xl font-semibold mb-3">Third-Party Service Providers:</h3>
            <ul className="text-gray-300 mb-4 space-y-2 ml-6">
              <li>• <strong>Google:</strong> For authentication and calendar integration</li>
              <li>• <strong>Clio CRM:</strong> For practice management integration (with your consent)</li>
              <li>• <strong>OpenAI:</strong> For AI-powered case analysis and summaries</li>
              <li>• <strong>Stripe:</strong> For secure payment processing</li>
              <li>• <strong>San Diego County Courts:</strong> For real-time case data access</li>
            </ul>

            <h3 className="text-white text-xl font-semibold mb-3">Legal Requirements:</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              We may disclose your information if required by law, court order, or legal process, 
              or to protect our rights, property, or safety, or that of our users or the public.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">4. Data Security</h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
              We implement comprehensive security measures to protect your information:
            </p>
            <ul className="text-gray-300 mb-6 space-y-2 ml-6">
              <li>• Encryption in transit (TLS/SSL) and at rest (AES-256)</li>
              <li>• Secure authentication via Google OAuth 2.0</li>
              <li>• Regular security audits and vulnerability assessments</li>
              <li>• Access controls and authentication requirements</li>
              <li>• Secure data centers with physical security measures</li>
              <li>• Employee training on data protection and privacy</li>
            </ul>

            <h2 className="text-white text-2xl font-semibold mb-4">5. Data Retention</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              We retain your information for as long as necessary to provide our Service and fulfill 
              the purposes outlined in this Privacy Policy. We will delete your personal information 
              when you delete your account, unless we are required to retain it for legal or regulatory 
              purposes. Case data and search history may be retained for up to 7 years for legal 
              compliance and service improvement purposes.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
              You have the following rights regarding your personal information:
            </p>
            <ul className="text-gray-300 mb-6 space-y-2 ml-6">
              <li>• <strong>Access:</strong> Request a copy of your personal information</li>
              <li>• <strong>Correction:</strong> Update or correct inaccurate information</li>
              <li>• <strong>Deletion:</strong> Request deletion of your personal information</li>
              <li>• <strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li>• <strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li>• <strong>Account Control:</strong> Delete your account at any time</li>
            </ul>

            <h2 className="text-white text-2xl font-semibold mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
              We use cookies and similar technologies to enhance your experience:
            </p>
            <ul className="text-gray-300 mb-6 space-y-2 ml-6">
              <li>• <strong>Essential Cookies:</strong> Required for basic Service functionality</li>
              <li>• <strong>Analytics Cookies:</strong> Help us understand how you use our Service</li>
              <li>• <strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li>• <strong>Security Cookies:</strong> Protect against fraud and unauthorized access</li>
            </ul>
            <p className="text-gray-300 mb-6 leading-relaxed">
              You can control cookies through your browser settings, but disabling certain cookies 
              may affect Service functionality.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">8. Third-Party Integrations</h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Our Service integrates with third-party services that have their own privacy policies:
            </p>
            <ul className="text-gray-300 mb-6 space-y-2 ml-6">
              <li>• <strong>Google:</strong> <a href="https://policies.google.com/privacy" className="text-blue-400 hover:text-blue-300">Google Privacy Policy</a></li>
              <li>• <strong>Clio:</strong> <a href="https://www.clio.com/legal/privacy/" className="text-blue-400 hover:text-blue-300">Clio Privacy Policy</a></li>
              <li>• <strong>OpenAI:</strong> <a href="https://openai.com/privacy/" className="text-blue-400 hover:text-blue-300">OpenAI Privacy Policy</a></li>
              <li>• <strong>Stripe:</strong> <a href="https://stripe.com/privacy" className="text-blue-400 hover:text-blue-300">Stripe Privacy Policy</a></li>
            </ul>

            <h2 className="text-white text-2xl font-semibold mb-4">9. International Data Transfers</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your information in accordance 
              with applicable data protection laws, including standard contractual clauses and adequacy 
              decisions where applicable.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Our Service is not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If you are a parent or guardian 
              and believe your child has provided us with personal information, please contact us 
              to have the information removed.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">11. California Privacy Rights</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              If you are a California resident, you have additional rights under the California Consumer 
              Privacy Act (CCPA), including the right to know what personal information we collect, 
              the right to delete personal information, and the right to opt-out of the sale of 
              personal information. We do not sell personal information.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material 
              changes by posting the new Privacy Policy on this page and updating the "Last updated" 
              date. We encourage you to review this Privacy Policy periodically for any changes.
            </p>

            <h2 className="text-white text-2xl font-semibold mb-4">13. Contact Us</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-gray-300 mb-2"><strong>Email:</strong> privacy@caseindexrt.com</p>
              <p className="text-gray-300 mb-2"><strong>Website:</strong> https://caseindexrt.com</p>
              <p className="text-gray-300"><strong>Address:</strong> Case Index RT, San Diego, CA</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}