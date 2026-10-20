import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/site/LegalLayout";
import { site } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern your use of Ogasela's website, mobile apps, testers programme and waiting list.",
};

export default function TermsPage() {
  return (
    <LegalLayout eyebrow="Legal" title="Terms & Conditions" lastUpdated="18 October 2026">
      <p>
        These Terms &amp; Conditions (&quot;Terms&quot;) are an agreement between you and{" "}
        {site.legalName}
        {site.rcNumber ? ` (RC ${site.rcNumber})` : ""} (&quot;we&quot;, &quot;our&quot; or
        &quot;us&quot;), the company that owns and operates Ogasela. They govern your use of our website, mobile apps and
        related services (together, the &quot;Services&quot;). By creating an account, joining
        our waiting list or testers programme, or otherwise using the Services, you agree to these
        Terms and to our <Link href="/privacy-policy">Privacy Policy</Link>. If you don&apos;t
        agree, please don&apos;t use the Services.
      </p>

      <h2 id="eligibility">1. Eligibility</h2>
      <p>
        You must be at least 18 years old and able to enter into a binding contract under Nigerian
        law. If you use Ogasela for a business, you confirm you&apos;re authorised to bind that
        business to these Terms.
      </p>

      <h2 id="account">2. Your account</h2>
      <ul>
        <li>Give accurate, current information, and keep it up to date. Changes to your phone number, email or business details may need our approval.</li>
        <li>Keep your password and one-time codes private. You&apos;re responsible for activity on your account. Tell us straight away if you think someone else has accessed it.</li>
        <li>One person, one account, unless we agree otherwise. Don&apos;t create accounts to get around a suspension or the Free plan limits.</li>
      </ul>

      <h2 id="our-role">3. Our role</h2>
      <p>
        Ogasela is a marketplace that connects buyers and sellers. Except for Office Pickup orders
        (section 9), we are not a party to the sale between users, we don&apos;t own the items
        listed, and we don&apos;t guarantee their quality, safety, legality or the accuracy of ads.
        You&apos;re responsible for deciding who to deal with and for the outcome of your deals,
        including in-person meetups.
      </p>

      <h2 id="verification">4. Seller verification</h2>
      <p>
        To post ads you must verify your identity by submitting a government-issued ID, proof of
        address and a live face check, which our team reviews. Verification shows that a seller
        passed our checks when they were made; it isn&apos;t a guarantee of how a seller will
        behave. We may refuse, pause or revoke verification if documents are invalid, details
        change, or we suspect fraud. How we handle this data, including your explicit consent to
        the face check, is set out in our <Link href="/privacy-policy#sensitive-data">Privacy Policy</Link>.
      </p>

      <h2 id="listings">5. Ads and prohibited items</h2>
      <p>
        You&apos;re responsible for your ads: they must describe a real item or service you&apos;re
        entitled to sell, at a genuine price, with your own photos or photos you have the right to
        use. You must not list:
      </p>
      <ul>
        <li>Anything illegal to sell or own in Nigeria, or stolen, counterfeit, smuggled or recalled goods.</li>
        <li>Firearms, ammunition, explosives, or weapons of any kind.</li>
        <li>Illegal drugs, controlled substances, prescription-only medicines, or drug paraphernalia.</li>
        <li>Human remains, body parts or organs, and protected or endangered wildlife.</li>
        <li>Adult or sexual content or services.</li>
        <li>Government-issued documents, SIM cards registered to someone else, or other people&apos;s personal data.</li>
        <li>Investment, loan, &quot;doubling&quot;, pyramid or other get-rich-quick schemes, and gambling.</li>
        <li>Hazardous chemicals or materials, or items that need a licence you don&apos;t hold.</li>
        <li>Job ads that charge applicants a fee, or property ads you aren&apos;t authorised to market.</li>
        <li>Content that is fraudulent, misleading, hateful, defamatory, or infringes someone else&apos;s intellectual property or privacy.</li>
      </ul>

      <h2 id="moderation">6. Review and moderation</h2>
      <p>
        We may review ads before or after they go live, using automated checks and our moderation
        team. We may decline, edit the category of, pause or remove any ad, and suspend accounts,
        that break these Terms or put users at risk. Where we can, we&apos;ll tell you why. If you
        think we got it wrong, contact us and a member of staff will look again.
      </p>

      <h2 id="plans">7. Ad plans, promotions and fees</h2>
      <ul>
        <li>
          <strong>Free plan.</strong> Available in eligible categories, for a limited run and
          number of photos, with a limit on how many Free ads you can have live at once. We may
          change these limits.
        </li>
        <li>
          <strong>Paid plans.</strong> Basic, Standard and Premium plans offer a longer run, more
          photos or video, a boost in search and other features described in the app. The price
          and what&apos;s included are shown before you pay. A boost improves where your ad
          appears; it doesn&apos;t guarantee views, enquiries or a sale.
        </li>
        <li>
          <strong>Promotion on TikTok and Facebook.</strong> If you connect an account and promote
          an ad, the promotion also runs under that platform&apos;s own terms and ad policies,
          which may reject it. Any ad credit included in a plan can only be used for promotions
          through Ogasela.
        </li>
        <li>
          <strong>Refunds.</strong> If an ad you paid for is rejected in review, the plan fee is
          refunded to your original payment method. Otherwise, plan and promotion fees aren&apos;t
          refundable once the ad has gone live, except where the law requires or we&apos;ve
          charged you in error. Removing an ad for breaking these Terms doesn&apos;t entitle you
          to a refund.
        </li>
        <li>
          <strong>No commission.</strong> We don&apos;t charge a commission on deals you agree
          directly with another user.
        </li>
      </ul>

      <h2 id="payments">8. Payments</h2>
      <p>
        Payments are processed by licensed payment providers (currently Paystack and Flutterwave),
        whose terms also apply. You pay on their secure checkout by card, bank transfer or USSD;
        we never see your full card number or PIN. There is no stored balance or wallet on your
        account: apart from Office Pickup orders (section 9), money you pay us is for the service
        you&apos;re buying at that moment. We may reverse or cancel a purchase made
        in error or through fraud.
      </p>

      <h2 id="office-pickup">9. Office Pickup</h2>
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
          cancelled; raise a dispute instead.
        </li>
        <li>
          <strong>Sellers.</strong> If a buyer requests Office Pickup on your ad, you agree to
          drop the item at the chosen branch promptly and in the condition described in the ad.
          If an item fails inspection or the order is cancelled after you have dropped it off,
          you must collect it from the branch.
        </li>
      </ul>

      <h2 id="conduct">10. Messages, reviews and conduct</h2>
      <p>You must not:</p>
      <ul>
        <li>Harass, threaten, scam or abuse other users, or ask them to pay outside the agreed method in order to defraud them.</li>
        <li>Impersonate anyone, or misrepresent who you are or who you work for.</li>
        <li>Post fake, paid-for or retaliatory reviews, or review yourself.</li>
        <li>Send spam, chain messages or unsolicited advertising.</li>
        <li>Collect other users&apos; personal data, or use it for anything other than the deal you&apos;re discussing.</li>
        <li>Get around our security, verification, moderation or fee systems, or use bots or scrapers without our written permission.</li>
        <li>Upload viruses or anything that could harm the Services or other users.</li>
      </ul>
      <p>
        We may review messages and content that are reported to us, or flagged by our safety
        checks, to protect users and enforce these Terms.
      </p>

      <h2 id="disputes-between-users">11. Reports and disputes</h2>
      <p>
        You can report an ad or user, and open a dispute about a deal, in the app. Our team will
        review the information both sides provide and may take action such as removing ads,
        suspending accounts or, for Office Pickup orders, issuing refunds under section 9. For
        deals made directly between users, our role is to help and to protect the community; we
        can&apos;t force either party to pay or return an item. None of this affects your right to
        go to the police, the Federal Competition and Consumer Protection Commission, or the
        courts.
      </p>

      <h2 id="ai">12. AI listing tools</h2>
      <p>
        Our AI tools can draft descriptions, suggest prices and enhance photos. Their output is a
        suggestion: check it before you publish, because you&apos;re responsible for everything in
        your ad. Price suggestions are estimates from similar ads, not valuations. Enhanced photos
        must still show the real item honestly.
      </p>

      <h2 id="testers">13. Testers programme and waiting list</h2>
      <ul>
        <li>Joining the waiting list or testers programme doesn&apos;t create an Ogasela account and doesn&apos;t guarantee you&apos;ll be invited to test or given access by a particular date.</li>
        <li>Test builds are pre-release software. They may contain bugs, lose data, change or stop working, and are provided &quot;as is&quot;. Please don&apos;t rely on them for important transactions.</li>
        <li>Please keep test builds and unreleased features to yourself, and don&apos;t share download links or invitations.</li>
        <li>If you send us feedback or ideas, we may use them to improve Ogasela without owing you payment or credit.</li>
        <li>We may end the testers programme, or your place in it, at any time. You can leave at any time by emailing <a href={`mailto:${site.privacyEmail}`}>{site.privacyEmail}</a>.</li>
      </ul>

      <h2 id="donations">14. Donations</h2>
      <p>
        You can support Ogasela with a voluntary donation through our Paystack donation page.
        Donations are gifts to {site.legalName} to help build and run Ogasela. They don&apos;t buy
        shares, ownership, rewards, goods or services, and don&apos;t give you any special
        treatment on the platform. {site.legalName} is not a registered charity, so donations
        aren&apos;t tax-deductible. Donations aren&apos;t refundable, except where a payment was
        made in error, without your authorisation, or where the law requires; contact us within
        14 days if that happens.
      </p>

      <h2 id="ip">15. Intellectual property</h2>
      <p>
        &quot;Ogasela&quot; and the Ogasela logo are trademarks of {site.legalName}. You may not use
        them, or anything confusingly similar, without our written permission. The Ogasela apps,
        website and software belong to us or our licensors. You keep
        ownership of content you post, but you give us a non-exclusive, worldwide, royalty-free
        licence to host, display, adapt (for example resize or enhance) and distribute it to run
        and promote the Services, including in promotions you request on other platforms. This
        licence ends when you delete the content or your account, except where it has already been
        shared or we need to keep it for legal reasons.
      </p>

      <h2 id="third-parties">16. Third-party services</h2>
      <p>
        The Services link to or rely on services we don&apos;t control, such as app stores,
        payment providers, sign-in providers, maps and advertising platforms. Their own terms
        apply and we aren&apos;t responsible for them.
      </p>

      <h2 id="disclaimers">17. Disclaimers</h2>
      <p>
        We work hard to keep Ogasela running safely, but the Services are provided &quot;as is&quot;
        and &quot;as available&quot;. To the extent the law allows, we don&apos;t promise that the
        Services will be uninterrupted or error-free, that ads are accurate, or that users will
        behave as they should.
      </p>

      <h2 id="liability">18. Limitation of liability</h2>
      <p>
        To the extent the law allows, Ogasela won&apos;t be liable for indirect, incidental, special
        or consequential losses, or for loss of profits, business, data or goodwill, arising from
        your use of the Services or from deals with other users. Nothing in these Terms limits
        liability that can&apos;t be limited under Nigerian law, including for fraud, for death or
        personal injury caused by negligence, or your rights under the Federal Competition and
        Consumer Protection Act 2018.
      </p>

      <h2 id="indemnity">19. Indemnity</h2>
      <p>
        You agree to cover Ogasela for reasonable losses and costs (including legal fees) that
        arise from your breach of these Terms, your ads or content, or your deals with other users,
        except to the extent we caused them.
      </p>

      <h2 id="termination">20. Suspension and closing your account</h2>
      <p>
        We may suspend or close your account, remove content, or refuse service if you break these
        Terms, if we reasonably suspect fraud or a risk to others, or if the law requires it. Where
        it&apos;s safe to, we&apos;ll tell you why. You can stop using Ogasela and ask us to delete
        your account at any time on our{" "}
        <Link href="/account-deletion">Account / Data Deletion</Link> page. Sections that by their
        nature should continue (such as fees owed, intellectual property, liability and governing
        law) survive closure.
      </p>

      <h2 id="changes">21. Changes to these Terms</h2>
      <p>
        We may update these Terms as Ogasela grows. We&apos;ll post the new version here with a new
        &quot;Last updated&quot; date and, for significant changes, tell you in the app or by email
        before they take effect. If you keep using the Services after that, the new Terms apply.
      </p>

      <h2 id="law">22. Governing law and resolving disagreements</h2>
      <p>
        These Terms are governed by the laws of the Federal Republic of Nigeria. If you have a
        complaint about Ogasela, please contact us first; we&apos;ll try to resolve it within 30
        days. If we can&apos;t, either of us may refer it to mediation in Lagos and, failing that,
        to the courts of Lagos State, which will have jurisdiction. This doesn&apos;t limit your
        right to complain to a regulator, such as the Federal Competition and Consumer Protection
        Commission or the Nigeria Data Protection Commission.
      </p>

      <h2 id="contact">23. Contact us</h2>
      <p>
        {site.legalName}, {site.location}. Email{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> for questions about these
        Terms, or <a href={`mailto:${site.privacyEmail}`}>{site.privacyEmail}</a> for privacy
        matters.
      </p>
    </LegalLayout>
  );
}
