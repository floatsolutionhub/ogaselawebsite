import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/site/LegalLayout";
import { site } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Ogasela collects, uses, shares and protects your personal data under the Nigeria Data Protection Act 2023, and the rights you have.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout eyebrow="Legal" title="Privacy Policy" lastUpdated="18 October 2026">
      <p>
        Ogasela is a product of {site.legalName}. This Privacy Policy explains how{" "}
        {site.legalName} (&quot;we&quot;, &quot;our&quot; or &quot;us&quot;) collects, uses, shares and protects personal data when
        you use our website ({site.domain}), our mobile apps, and related services (together, the
        &quot;Services&quot;), including when you join our waiting list or testers programme.
      </p>
      <p>
        We process personal data in line with the Nigeria Data Protection Act 2023 (the
        &quot;NDPA&quot;), the Nigeria Data Protection Regulation 2019 where it still applies, the
        General Application and Implementation Directive issued by the Nigeria Data Protection
        Commission (&quot;NDPC&quot;), and other applicable law.
      </p>

      <h2 id="who-we-are">1. Who we are and how to reach us</h2>
      <p>
        {site.legalName}
        {site.rcNumber ? ` (RC ${site.rcNumber})` : ""}, {site.location}, is the data controller
        for the personal data described in this policy. For any privacy question or request,
        contact our Data Protection Officer at{" "}
        <a href={`mailto:${site.privacyEmail}`}>{site.privacyEmail}</a>.
      </p>

      <h2 id="what-we-collect">2. Personal data we collect</h2>
      <h3>Information you give us</h3>
      <ul>
        <li>
          <strong>Account details:</strong> your name, phone number, email address, password
          (stored only as a secure hash), profile photo, and, for sellers, your business name,
          store address and social media links.
        </li>
        <li>
          <strong>Verification details (sellers):</strong> the type and number of your
          government-issued ID, images of the ID, a proof-of-address document, and photos captured
          during a live face check.
        </li>
        <li>
          <strong>Ads and content:</strong> photos, videos, descriptions, prices, categories and the
          location of items you list, and reviews you write.
        </li>
        <li>
          <strong>Messages:</strong> chats with other users, and messages and files you send in a
          report or dispute.
        </li>
        <li>
          <strong>Payments:</strong> ad-plan and promotion purchases, Office Pickup
          orders and refunds, including amounts, references and status. Card and bank details are
          entered on our payment providers&apos; pages; we don&apos;t receive or store your full
          card number or PIN.
        </li>
        <li>
          <strong>Office Pickup:</strong> the branch you chose, and a delivery address if you ask
          for delivery.
        </li>
        <li>
          <strong>Website forms:</strong> what you submit through our contact form, account or
          data deletion form, waiting list or testers form (name, email, and optionally phone
          number, state, whether you plan to buy or sell, and for testers the type of phone you
          use).
        </li>
      </ul>
      <h3>Information collected automatically</h3>
      <ul>
        <li>
          <strong>Device and usage data:</strong> device type, operating system, app version, IP
          address, push notification token, crash and performance data, and how you use the
          Services, such as ads viewed, saved or messaged about.
        </li>
        <li>
          <strong>Location:</strong> the state and city you choose for browsing, and your
          device&apos;s location only if you give the app permission.
        </li>
        <li>
          <strong>Website storage:</strong> see section 11 (Cookies).
        </li>
      </ul>
      <h3>Information from others</h3>
      <ul>
        <li>
          <strong>Sign-in providers:</strong> if you sign in with Google, Apple or Facebook, we
          receive your name, email address and an account identifier from that provider.
        </li>
        <li>
          <strong>Payment providers:</strong> confirmation of whether a payment succeeded, and its
          reference.
        </li>
        <li>
          <strong>Other users:</strong> reviews, reports or dispute messages that mention you.
        </li>
      </ul>

      <h2 id="how-we-use">3. How we use your data, and our lawful basis</h2>
      <p>The NDPA requires a lawful basis for each use of personal data. Ours are:</p>
      <div className="not-prose overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink-900/10 text-ink-900">
              <th className="py-2 pr-4 font-semibold">Purpose</th>
              <th className="py-2 font-semibold">Lawful basis</th>
            </tr>
          </thead>
          <tbody className="text-ink-500">
            {[
              ["Creating and running your account, signing you in, and sending one-time codes", "Performance of our contract with you"],
              ["Publishing ads, search, chat, reviews, notifications, ad plans and Office Pickup", "Performance of our contract with you"],
              ["Verifying sellers with ID, proof of address and a live face check", "Your explicit consent (face data is sensitive personal data); and our legitimate interest in preventing fraud"],
              ["Reviewing ads, flagging likely fraud, investigating reports and resolving disputes", "Our legitimate interests in keeping the marketplace safe; and legal obligations"],
              ["AI listing tools (descriptions, price suggestions, photo enhancement) when you choose to use them", "Performance of our contract with you"],
              ["Waiting list and testers programme", "Your consent, given on the form"],
              ["Replying to messages and data requests you send us", "Our legitimate interests; and legal obligations"],
              ["News and offers about Ogasela", "Your consent, which you can withdraw at any time"],
              ["Keeping financial records, tax compliance and responding to lawful requests", "Legal obligation"],
              ["Improving and securing the Services, using aggregated or de-identified data where we can", "Our legitimate interests"],
            ].map(([purpose, basis]) => (
              <tr key={purpose} className="border-b border-ink-900/5 align-top">
                <td className="py-2.5 pr-4">{purpose}</td>
                <td className="py-2.5">{basis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Where we rely on legitimate interests, we have weighed them against your rights and
        freedoms. You can object at any time (section 9).
      </p>

      <h2 id="sensitive-data">4. Face checks and other sensitive data</h2>
      <p>
        Seller verification includes a live face check that confirms a real person is behind the
        account. Face data is biometric, which the NDPA treats as sensitive personal data. We only
        do this with your explicit consent, which we ask for in the app before the check starts.
      </p>
      <ul>
        <li>The raw photos from the check are deleted automatically within 30 days.</li>
        <li>After that we keep only a face identifier and the result of the check, so we can show that verification happened and prevent the same face being used on many accounts.</li>
        <li>You can refuse or withdraw consent. You can still buy on Ogasela, but you won&apos;t be able to become a verified seller.</li>
      </ul>

      <h2 id="automated-decisions">5. Automated checks</h2>
      <p>
        We use automated checks to flag ads that look risky, for example a price far below
        similar ads, requests to pay outside the platform, or a very new account. A flag sends the
        ad to our moderation team; a person makes the decision. We don&apos;t make decisions that
        have legal or similarly significant effects on you based solely on automated processing.
        If you disagree with a moderation decision, contact us and a member of staff will review
        it.
      </p>

      <h2 id="sharing">6. Who we share data with</h2>
      <p>
        <strong>We never sell your personal data.</strong> We share it only as follows:
      </p>
      <ul>
        <li>
          <strong>Other users:</strong> your public profile (name, business name, verified badge,
          reviews, join date) and your ads are visible to everyone. If you&apos;re a seller, your
          phone number and store address are shown on your ads so buyers can call or visit you.
          Buyers&apos; phone numbers aren&apos;t shown to sellers. Messages are visible to the
          people you send them to.
        </li>
        <li>
          <strong>Service providers</strong> who process data for us under contract and only on
          our instructions:
          <ul>
            <li>Cloud hosting, file storage and face verification: Amazon Web Services</li>
            <li>Payments and refunds: Paystack and Flutterwave</li>
            <li>SMS one-time codes: Termii</li>
            <li>Email: Brevo</li>
            <li>Push notifications: Google Firebase</li>
            <li>Bot protection on our website forms: Cloudflare Turnstile</li>
            <li>AI listing tools: Google (Gemini) and Anthropic (Claude), which receive only the ad details and photos you ask them to work on</li>
            <li>Sign-in: Google, Apple and Facebook, if you choose them</li>
          </ul>
        </li>
        <li>
          <strong>Advertising platforms:</strong> if you connect a TikTok or Facebook account to
          promote an ad, we send that platform the ad content needed to run the promotion, and
          receive performance figures back. We don&apos;t send them your contact details.
        </li>
        <li>
          <strong>Office Pickup:</strong> the buyer and seller on an order see the details needed
          to complete it, such as the item, branch and status.
        </li>
        <li>
          <strong>Authorities:</strong> regulators, law enforcement or courts where the law
          requires it, or where needed to protect people from fraud or harm.
        </li>
        <li>
          <strong>A change of ownership:</strong> if Ogasela is merged or sold, your data may pass
          to the new owner, who must keep protecting it as this policy describes.
        </li>
      </ul>

      <h2 id="transfers">7. Transfers outside Nigeria</h2>
      <p>
        Some of our providers store or process data outside Nigeria, including in the United
        Kingdom, the European Union and the United States. We only transfer personal data abroad
        as Part VIII of the NDPA allows: to countries or organisations that provide an adequate
        level of protection, under binding contractual safeguards, or on another basis the NDPA
        permits. You can ask us for more detail about these safeguards.
      </p>

      <h2 id="retention">8. How long we keep data</h2>
      <p>We keep personal data only as long as we need it for the purposes above:</p>
      <ul>
        <li><strong>Account, profile and ads:</strong> while your account is open. When you delete it, we delete or anonymise them, except as below.</li>
        <li><strong>Raw face-check photos:</strong> deleted within 30 days. The face identifier and result are kept while you&apos;re a seller and deleted when your account is deleted.</li>
        <li><strong>ID and proof-of-address documents:</strong> while you&apos;re a seller, and for up to 12 months after your account closes if needed to deal with fraud or a dispute.</li>
        <li><strong>Payment and transaction records:</strong> six years after the transaction, as Nigerian tax and company law requires.</li>
        <li><strong>Chats:</strong> while your account is open. Messages that form part of a report or dispute are kept until it is resolved and for up to two years after.</li>
        <li><strong>Waiting list and testers signups:</strong> until 12 months after the app launches, or until you ask us to remove you, whichever comes first.</li>
        <li><strong>Contact form and data-request messages:</strong> up to two years after we&apos;ve dealt with them.</li>
      </ul>

      <h2 id="your-rights">9. Your rights</h2>
      <p>Under the NDPA you have the right to:</p>
      <ul>
        <li><strong>Be informed</strong> about how we use your data (this policy).</li>
        <li><strong>Access</strong> the personal data we hold about you and get a copy.</li>
        <li><strong>Correct</strong> data that is inaccurate or incomplete. You can edit most details in the app.</li>
        <li><strong>Erase</strong> your data, subject to the legal exceptions in section 8.</li>
        <li><strong>Restrict</strong> how we use your data while a concern is looked into.</li>
        <li><strong>Data portability:</strong> receive data you gave us in a common, machine-readable format, or have it sent to another organisation.</li>
        <li><strong>Object</strong> to processing based on our legitimate interests, and to direct marketing at any time.</li>
        <li><strong>Withdraw consent</strong> at any time, without affecting what we did before you withdrew it.</li>
        <li><strong>Not be subject to a decision based solely on automated processing</strong> that significantly affects you (see section 5).</li>
        <li>
          <strong>Complain</strong> to the Nigeria Data Protection Commission at{" "}
          <a href="https://ndpc.gov.ng" target="_blank" rel="noopener noreferrer">ndpc.gov.ng</a>.
          We&apos;d appreciate the chance to put things right first, so please contact us.
        </li>
      </ul>
      <p>
        To use any of these rights, email{" "}
        <a href={`mailto:${site.privacyEmail}`}>{site.privacyEmail}</a> or use our{" "}
        <Link href="/account-deletion">Account / Data Deletion</Link> page. We may need to confirm
        your identity first. We respond within 30 days, and there&apos;s no charge unless a request
        is clearly unfounded or excessive.
      </p>

      <h2 id="marketing">10. Waiting list, testers and marketing messages</h2>
      <p>
        If you join our waiting list or testers programme, we use your details only to tell you
        about the launch or about testing, as you agreed on the form. We&apos;ll send you news and
        offers only if you&apos;ve opted in. Every marketing email lets you unsubscribe, and you can
        ask us to remove you from any list by emailing{" "}
        <a href={`mailto:${site.privacyEmail}`}>{site.privacyEmail}</a>.
      </p>

      <h2 id="cookies">11. Cookies and similar technologies</h2>
      <p>Our website doesn&apos;t use advertising or analytics cookies. It uses:</p>
      <ul>
        <li><strong>Your browser&apos;s local storage,</strong> to remember that you&apos;ve seen our cookie notice.</li>
        <li><strong>Cloudflare Turnstile</strong> on our forms, which processes technical signals such as your IP address and browser details to tell people from bots.</li>
        <li><strong>Google Maps</strong> on our Locate us page, only after you choose to load the map. Google may then set its own cookies under its privacy policy.</li>
      </ul>
      <p>
        The mobile app stores your sign-in session and preferences securely on your device. You
        can clear website storage in your browser settings at any time.
      </p>

      <h2 id="security">12. How we protect your data</h2>
      <p>
        We use encrypted connections (HTTPS/TLS), store passwords only as one-way hashes, encrypt
        sensitive tokens, and limit staff access by role. Staff actions on user data are logged
        and audited. No system is perfectly secure, so please use a strong, unique password and
        never share your one-time codes. If a personal data breach is likely to put your rights
        and freedoms at risk, we&apos;ll notify the NDPC within 72 hours of becoming aware of it, and
        tell you without undue delay if the risk to you is high.
      </p>

      <h2 id="children">13. Children</h2>
      <p>
        Ogasela is only for people aged 18 or over. We don&apos;t knowingly collect personal data
        from anyone under 18. If you believe a child has given us personal data, contact us and
        we&apos;ll delete it.
      </p>

      <h2 id="changes">14. Changes to this policy</h2>
      <p>
        We&apos;ll post any update on this page with a new &quot;Last updated&quot; date. If a
        change significantly affects how we use your data, we&apos;ll tell you in the app or by
        email before it takes effect, and ask for fresh consent where the law requires it.
      </p>

      <h2 id="contact">15. Contact us</h2>
      <p>
        Data Protection Officer, {site.legalName}, {site.location}:{" "}
        <a href={`mailto:${site.privacyEmail}`}>{site.privacyEmail}</a>. For general support, email{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
      </p>
    </LegalLayout>
  );
}
