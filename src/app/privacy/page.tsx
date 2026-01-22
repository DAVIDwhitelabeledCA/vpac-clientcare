import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Privacy Policy | VPAC Client Care',
  description: 'Privacy Policy for VPAC Client Care platform',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Privacy Policy</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to VPAC Client Care. We are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our healthcare client 
              management and appointment booking system.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">2. Information We Collect</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold mb-2">2.1 Personal Information</h3>
                <p className="text-muted-foreground">
                  We collect personal information that you provide to us, including:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>Name, email address, and phone number</li>
                  <li>Date of birth and medical information</li>
                  <li>Insurance information and identification documents</li>
                  <li>Appointment history and preferences</li>
                  <li>Account credentials and authentication information</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">2.2 Automatically Collected Information</h3>
                <p className="text-muted-foreground">
                  When you use our platform, we automatically collect certain information, including:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>Device information and IP address</li>
                  <li>Browser type and version</li>
                  <li>Usage patterns and interaction data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-3">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
              <li>To provide, maintain, and improve our services</li>
              <li>To process appointments and manage your healthcare records</li>
              <li>To communicate with you about appointments, services, and important updates</li>
              <li>To send appointment reminders and notifications via SMS or email</li>
              <li>To comply with legal obligations and healthcare regulations</li>
              <li>To protect the security and integrity of our platform</li>
              <li>To personalize your experience and provide customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-muted-foreground mb-3">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
              <li><strong>Healthcare Providers:</strong> With authorized healthcare professionals and treatment centers</li>
              <li><strong>Service Providers:</strong> With third-party service providers who assist in operating our platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you have explicitly authorized us to share your information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your personal information, including encryption, 
              secure data storage, and access controls. However, no method of transmission over the internet or electronic 
              storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">6. Your Rights and Choices</h2>
            <p className="text-muted-foreground mb-3">
              You have certain rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
              <li>Access and review your personal information</li>
              <li>Request corrections to inaccurate or incomplete information</li>
              <li>Request deletion of your personal information (subject to legal requirements)</li>
              <li>Opt-out of certain communications and marketing materials</li>
              <li>Request a copy of your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">7. Health Information (HIPAA)</h2>
            <p className="text-muted-foreground">
              As a healthcare platform, we are committed to complying with the Health Insurance Portability and Accountability Act (HIPAA). 
              Protected Health Information (PHI) is handled with additional safeguards and is only used and disclosed as permitted by HIPAA 
              and as described in our Notice of Privacy Practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">8. Cookies and Tracking Technologies</h2>
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and improve our services. 
              You can control cookie preferences through your browser settings, though this may affect certain features of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">9. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from 
              children. If we become aware that we have collected information from a child, we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy 
              Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-6 mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-3 p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">
                <strong>VPAC Client Care</strong><br />
                Email: privacy@vpac.ca<br />
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
