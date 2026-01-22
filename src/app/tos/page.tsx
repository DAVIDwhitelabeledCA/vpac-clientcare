import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Terms of Service | VPAC Client Care',
  description: 'Terms of Service for VPAC Client Care platform',
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Terms of Service</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using VPAC Client Care ("the Platform", "we", "us", or "our"), you accept and agree to be bound by these 
              Terms of Service ("Terms"). If you do not agree to these Terms, you must not use our services. These Terms apply to all 
              users, including clients, healthcare providers, and administrative staff.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              VPAC Client Care is a healthcare client management and appointment booking platform that facilitates:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
              <li>Appointment scheduling and management</li>
              <li>Client record and document management</li>
              <li>Communication between clients and healthcare providers</li>
              <li>Secure storage and access to health information</li>
              <li>Integration with calendar and communication systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">3. User Accounts and Registration</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold mb-2">3.1 Account Creation</h3>
                <p className="text-muted-foreground">
                  To use certain features of the Platform, you must create an account. You agree to:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information to keep it accurate</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">3.2 Account Security</h3>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account password and for all activities that occur 
                  under your account. You must immediately notify us of any unauthorized use of your account.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">4. Acceptable Use</h2>
            <p className="text-muted-foreground mb-3">
              You agree not to use the Platform in any way that:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
              <li>Violates any applicable laws or regulations</li>
              <li>Infringes upon the rights of others</li>
              <li>Is harmful, threatening, abusive, or harassing</li>
              <li>Contains false, misleading, or fraudulent information</li>
              <li>Attempts to gain unauthorized access to the Platform or other accounts</li>
              <li>Interferes with or disrupts the Platform's operation</li>
              <li>Transmits viruses, malware, or other harmful code</li>
              <li>Uses automated systems to access the Platform without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">5. Appointments and Services</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold mb-2">5.1 Appointment Scheduling</h3>
                <p className="text-muted-foreground">
                  Appointments scheduled through the Platform are subject to availability and confirmation by healthcare providers. 
                  We do not guarantee appointment availability or acceptance.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">5.2 Cancellation and Rescheduling</h3>
                <p className="text-muted-foreground">
                  You may cancel or reschedule appointments in accordance with the cancellation policy of your healthcare provider. 
                  Late cancellations or no-shows may be subject to fees as determined by your provider.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">5.3 Medical Services</h3>
                <p className="text-muted-foreground">
                  The Platform facilitates appointment scheduling and communication but does not provide medical services. All medical 
                  services are provided by licensed healthcare providers, and we are not responsible for the quality, outcomes, or 
                  results of any medical services.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">6. Health Information and Privacy</h2>
            <p className="text-muted-foreground">
              Your use of the Platform involves the collection and storage of health information. Our handling of this information 
              is governed by our Privacy Policy and applicable health privacy laws, including HIPAA. By using the Platform, you 
              consent to the collection, use, and disclosure of your health information as described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground">
              The Platform, including its design, features, functionality, and content, is owned by VPAC Client Care and protected 
              by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative 
              works of the Platform without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">8. User Content</h2>
            <p className="text-muted-foreground mb-3">
              You retain ownership of any content you submit to the Platform ("User Content"). By submitting User Content, you grant 
              us a license to:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
              <li>Use, store, and display your User Content to provide our services</li>
              <li>Share your User Content with authorized healthcare providers</li>
              <li>Use your User Content for platform improvement and analytics (in anonymized form)</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              You represent that you have the right to grant this license and that your User Content does not violate any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">9. Disclaimers and Limitations of Liability</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold mb-2">9.1 Service Availability</h3>
                <p className="text-muted-foreground">
                  We strive to provide reliable service but do not guarantee that the Platform will be available, uninterrupted, or error-free. 
                  We may suspend or discontinue the Platform at any time without notice.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">9.2 Medical Disclaimer</h3>
                <p className="text-muted-foreground">
                  The Platform is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your 
                  physician or qualified health provider with any questions regarding a medical condition. Never disregard professional medical 
                  advice or delay seeking it because of information obtained through the Platform.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">9.3 Limitation of Liability</h3>
                <p className="text-muted-foreground">
                  To the maximum extent permitted by law, VPAC Client Care shall not be liable for any indirect, incidental, special, 
                  consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or 
                  any loss of data, use, goodwill, or other intangible losses resulting from your use of the Platform.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">10. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify, defend, and hold harmless VPAC Client Care and its officers, directors, employees, and agents from 
              any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Platform, your 
              violation of these Terms, or your violation of any rights of another party.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">11. Termination</h2>
            <p className="text-muted-foreground">
              We may terminate or suspend your account and access to the Platform immediately, without prior notice, for any reason, 
              including if you breach these Terms. Upon termination, your right to use the Platform will cease immediately. We may 
              delete your account and data in accordance with our Privacy Policy and applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">12. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated 
              Terms on this page and updating the "Last updated" date. Your continued use of the Platform after such changes constitutes 
              your acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">13. Governing Law and Dispute Resolution</h2>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict 
              of law provisions. Any disputes arising from these Terms or your use of the Platform shall be resolved through binding 
              arbitration in accordance with the rules of [Arbitration Organization], except where prohibited by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">14. Severability</h2>
            <p className="text-muted-foreground">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to 
              the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">15. Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-3 p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">
                <strong>VPAC Client Care</strong><br />
                Email: legal@vpac.ca<br />
                Phone: [Contact Number]
              </p>
            </div>
          </section>

          <section className="mt-8 pt-6 border-t">
            <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
              <a 
                href="https://whitelabeled.ca" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground underline transition-colors"
              >
                Whitelabeled.ca
              </a>
              <span>•</span>
              <a 
                href="https://vitalpathaddictionclinic.ca" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground underline transition-colors"
              >
                Vital Path Addiction Clinic
              </a>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
