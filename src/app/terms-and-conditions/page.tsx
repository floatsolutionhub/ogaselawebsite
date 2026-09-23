import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern your use of Ogasela's website and mobile applications.",
};

export default function TermsPage() {
  return (
    <LegalLayout eyebrow="Legal" title="Terms & Conditions" lastUpdated="22 September 2026">
      <p>
        These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use of
        Ogasela&apos;s website, mobile applications, and related services (together, the
        &quot;Services&quot;). By creating an account or using the Services, you agree to be
        bound by these Terms.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        You must be at least 18 years old and capable of forming a binding contract under
        Nigerian law to use the Services. By using Ogasela, you confirm that you meet these
        requirements.
      </p>

      <h2>2. Your account</h2>
      <ul>
        <li>You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.</li>
        <li>You must provide accurate, current information when registering and completing seller verification (KYC).</li>
        <li>We may suspend or terminate accounts that provide false information, violate these Terms, or are used fraudulently.</li>
      </ul>

      <h2>3. Listings and prohibited items</h2>
      <p>
        As a seller, you are solely responsible for the accuracy of your listings, including
        descriptions, photos, pricing, and condition of items. You may not list:
      </p>
      <ul>
        <li>Illegal goods, services, or content, or items prohibited under Nigerian law.</li>
        <li>Weapons, ammunition, explosives, or controlled substances.</li>
        <li>Counterfeit, stolen, or recalled goods.</li>
        <li>Content that is fraudulent, misleading, defamatory, obscene, or infringes another party&apos;s intellectual property or privacy rights.</li>
      </ul>
      <p>We may remove any listing and suspend accounts that violate this section at our discretion.</p>

      <h2>4. Buying and selling</h2>
      <p>
        Ogasela provides a platform that connects buyers and sellers; we are not a party to the
        transactions between users. You are responsible for evaluating the counterparties you
        transact with and for the outcome of any exchange, including in-person meetups. We
        recommend using our in-app messaging and, where available, verified seller badges and
        in-app payments to reduce risk.
      </p>

      <h2>5. Payments and wallet</h2>
      <p>
        Wallet funding, withdrawals, and certain paid features (such as listing promotions) are
        processed through licensed third-party payment providers. By using these features, you
        agree to any additional terms required by those providers. Fees, where applicable, will
        be disclosed to you before you confirm a transaction.
      </p>

      <h2>6. Verification (KYC)</h2>
      <p>
        Sellers may be required to complete identity verification, which can include submitting
        government-issued identification, NIN, or business registration (RC) details. We use
        this information solely to verify identity and reduce fraud, as described in our{" "}
        <a href="/privacy-policy">Privacy Policy</a>.
      </p>

      <h2>7. Prohibited conduct</h2>
      <ul>
        <li>Impersonating another person or misrepresenting your affiliation with any person or entity.</li>
        <li>Harassing, threatening, or abusing other users.</li>
        <li>Attempting to circumvent our security, verification, or content-moderation systems.</li>
        <li>Using automated means (bots, scrapers) to access the Services without our written permission.</li>
        <li>Posting spam or unauthorized commercial communications.</li>
      </ul>

      <h2>8. Intellectual property</h2>
      <p>
        The Ogasela name, logo, and platform are owned by Ogasela and protected by applicable
        intellectual property laws. You retain ownership of content you post (such as listing
        photos and descriptions), but grant Ogasela a non-exclusive, worldwide, royalty-free
        license to host, display, and distribute that content in connection with operating the
        Services.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        The Services are provided &quot;as is&quot; and &quot;as available&quot; without
        warranties of any kind, express or implied. Ogasela does not guarantee the accuracy of
        listings, the conduct of users, or that the Services will be uninterrupted or error-free.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Ogasela shall not be liable for any indirect,
        incidental, special, or consequential damages, or for any loss of profits, data, or
        goodwill, arising out of or related to your use of the Services or transactions with
        other users.
      </p>

      <h2>11. Termination</h2>
      <p>
        We may suspend or terminate your access to the Services at any time, with or without
        notice, for conduct that violates these Terms or is otherwise harmful to other users, us,
        or third parties. You may stop using the Services and request deletion of your account at
        any time via our{" "}
        <a href="/account-deletion">Account / Data Deletion</a> page.
      </p>

      <h2>12. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Services after changes
        take effect constitutes acceptance of the revised Terms.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These Terms are governed by the laws of the Federal Republic of Nigeria, without regard
        to conflict-of-law principles.
      </p>

      <h2>14. Contact us</h2>
      <p>
        Questions about these Terms can be sent to{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
      </p>
    </LegalLayout>
  );
}
