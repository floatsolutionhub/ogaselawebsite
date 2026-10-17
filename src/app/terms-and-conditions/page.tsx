import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern your use of Ogasela's website and mobile applications.",
};

export default function TermsPage() {
  return (
    <LegalLayout eyebrow="Legal" title="Terms & Conditions" lastUpdated="17 October 2026">
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
        in-app payments to reduce risk. The one exception is an Office Pickup order (section 6),
        where Ogasela receives your payment and inspects the item before handing it over.
      </p>

      <h2>5. Payments and wallet</h2>
      <p>
        Wallet funding, withdrawals, and certain paid features (such as listing promotions) are
        processed through licensed third-party payment providers. By using these features, you
        agree to any additional terms required by those providers. Fees, where applicable, will
        be disclosed to you before you confirm a transaction.
      </p>

      <h2>6. Office Pickup</h2>
      <p>
        Office Pickup lets a buyer pay Ogasela for an item, have the seller drop it at an Ogasela
        branch, and collect it there after we have inspected it. It is only offered on ads in the
        categories and subcategories we select, and we may change which categories qualify, or
        which branches are open, at any time.
      </p>
      <ul>
        <li>
          <strong>Fee.</strong> An Office Pickup fee of 3% of the item&apos;s displayed price is
          added to that price. The full amount is shown before you pay, and is paid through our
          payment provider (Paystack). A receipt is sent to the email address on your account.
        </li>
        <li>
          <strong>How it works.</strong> Once your payment is confirmed we notify the seller,
          who must drop the item at the branch you chose. We inspect the item against its ad and
          tell you when it is ready. You can collect it at the branch by quoting your Office
          Pickup reference, or ask us to deliver it to you where home delivery is available. We
          notify you in the app at each stage: payment confirmed, item delivered to our office,
          inspection result, and item available for pickup or delivery.
        </li>
        <li>
          <strong>Inspection.</strong> Our inspection is a check that the item matches its ad. It
          is not a manufacturer&apos;s warranty or a guarantee of how long the item will last.
        </li>
        <li>
          <strong>Refunds and cancellation.</strong> If the item fails inspection, or you decide
          not to go ahead before you have collected the item or it has been sent out for
          delivery, we will refund the amount you paid less a processing and cancellation fee of
          1% of the item&apos;s price. Refunds are paid to your original payment method through
          our payment provider; how long they take to reach you depends on your bank. Once you
          have collected the item, or it has been delivered, the order can no longer be
          cancelled - raise a dispute instead.
        </li>
        <li>
          <strong>Sellers.</strong> If a buyer requests Office Pickup on your ad, you agree to
          drop the item at the chosen branch promptly and in the condition described in the ad.
          If an item fails inspection or the order is cancelled after you have dropped it off,
          you must collect it from the branch.
        </li>
      </ul>

      <h2>7. Verification (KYC)</h2>
      <p>
        Sellers may be required to complete identity verification, which can include submitting
        government-issued identification, NIN, or business registration (RC) details. We use
        this information solely to verify identity and reduce fraud, as described in our{" "}
        <a href="/privacy-policy">Privacy Policy</a>.
      </p>

      <h2>8. Prohibited conduct</h2>
      <ul>
        <li>Impersonating another person or misrepresenting your affiliation with any person or entity.</li>
        <li>Harassing, threatening, or abusing other users.</li>
        <li>Attempting to circumvent our security, verification, or content-moderation systems.</li>
        <li>Using automated means (bots, scrapers) to access the Services without our written permission.</li>
        <li>Posting spam or unauthorized commercial communications.</li>
      </ul>

      <h2>9. Intellectual property</h2>
      <p>
        The Ogasela name, logo, and platform are owned by Ogasela and protected by applicable
        intellectual property laws. You retain ownership of content you post (such as listing
        photos and descriptions), but grant Ogasela a non-exclusive, worldwide, royalty-free
        license to host, display, and distribute that content in connection with operating the
        Services.
      </p>

      <h2>10. Disclaimers</h2>
      <p>
        The Services are provided &quot;as is&quot; and &quot;as available&quot; without
        warranties of any kind, express or implied. Ogasela does not guarantee the accuracy of
        listings, the conduct of users, or that the Services will be uninterrupted or error-free.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Ogasela shall not be liable for any indirect,
        incidental, special, or consequential damages, or for any loss of profits, data, or
        goodwill, arising out of or related to your use of the Services or transactions with
        other users.
      </p>

      <h2>12. Termination</h2>
      <p>
        We may suspend or terminate your access to the Services at any time, with or without
        notice, for conduct that violates these Terms or is otherwise harmful to other users, us,
        or third parties. You may stop using the Services and request deletion of your account at
        any time via our{" "}
        <a href="/account-deletion">Account / Data Deletion</a> page.
      </p>

      <h2>13. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Services after changes
        take effect constitutes acceptance of the revised Terms.
      </p>

      <h2>14. Governing law</h2>
      <p>
        These Terms are governed by the laws of the Federal Republic of Nigeria, without regard
        to conflict-of-law principles.
      </p>

      <h2>15. Contact us</h2>
      <p>
        Questions about these Terms can be sent to{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
      </p>
    </LegalLayout>
  );
}
