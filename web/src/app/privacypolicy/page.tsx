import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How HealthOptix collects, uses, and protects personal information.",
  alternates: { canonical: "/privacypolicy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-white px-6 py-16 text-[#303030]">
      <p className="text-center">
        <strong className="text-2xl">Privacy Policy</strong>
      </p>
      <p className="mt-6 italic">Effective Date: 10 November 2023</p>

      <p className="mt-6 leading-relaxed">
        HEALTHOPTIX PTE LTD is committed to protecting the privacy and
        confidentiality of our users&apos; personal information. This Privacy
        Policy outlines how we collect, use, process, and protect the personal
        information provided by our users. By using our services and providing
        your personal information, you agree to the terms and practices
        described in this Privacy Policy.
      </p>

      <p className="mt-6 leading-relaxed">
        We use the same mobile application (referred to as
        &quot;Symbionat-Micronutrition&quot; App) &amp; backend server with our
        business partner company SYMBIONAT HEALTH located in Hongkong, where we
        will store your personal data.
      </p>

      <p className="mt-8 font-semibold">1. Information Collected</p>
      <p className="mt-2 leading-relaxed">
        &quot;Personal Data&quot; refers to any data of an individual whether
        true or not, about an individual who can be identified from that data,
        or in combination with any other information to which the organisation
        has or is likely to have access. You may be requested to provide your
        Personal Data. This may include the following examples (including but
        not limited to):
      </p>
      <p className="mt-2">
        - Name, mobile phone number, email address, gender, date of birth
      </p>
      <p className="mt-2">
        - Credit card related information &amp; delivery address (only for
        purchasing our products)
      </p>
      <p className="mt-4 leading-relaxed">
        In addition, we collect some other information such as height, weight
        and some health-related parameters measured by our devices, including
        but not limited to heart rate, body impedance, and other relevant health
        indicators. Based on this information, we calculate metrics such as body
        fat percentage, hydration level, stress index, cholesterol levels,
        blood sugar, etc., to generate personalized health reports.
      </p>

      <p className="mt-8 font-semibold">2. Personal data acquisition</p>
      <p className="mt-2 leading-relaxed">
        When users make online / offline registration prior to health scanning,
        personal data as well as physical data are requested to provided. When
        users enter our website or &quot;Symbionat-Micronutrition&quot; App, no
        personal information is needed unless users want to join our membership
        or make a purchase.
      </p>

      <p className="mt-8 font-semibold">3. Use of Personal data</p>
      <p className="mt-2">We use the collected personal data for the following purposes:</p>
      <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed">
        <li>To provide and improve our health assessment and monitoring services.</li>
        <li>To generate personalized health reports.</li>
        <li>
          To communicate with users regarding their health results and provide
          relevant recommendations.
        </li>
        <li>
          To share reports with our health professional partners, such as
          nutritionists, physical therapists, psychologists, personal trainers,
          yoga coaches, and etc., in Singapore or outside Singapore, for the
          provision of health advice and services.
        </li>
        <li>To share with supplement or product suppliers for your purchasing activities.</li>
        <li>
          To conduct internal research and analysis to enhance our services and
          develop new features.
        </li>
        <li>
          To comply with legal obligations and protect the rights and safety of
          our users and our company.
        </li>
      </ul>

      <p className="mt-8 font-semibold">4. Data Security</p>
      <p className="mt-2 leading-relaxed">
        We implement appropriate technical and organizational measures to protect
        the personal information collected from unauthorized access, disclosure,
        alteration, or destruction. We have Data Protection Agreements with any
        of our 3rd party suppliers/contractors/partners. We regularly review
        and update our security practices to ensure the integrity and
        confidentiality of the data.
      </p>
      <p className="mt-4 leading-relaxed">
        To protect users&apos; personal privacy and security, account information
        in HEALTHOPTIX PTE LTD &amp; &quot;Symbionat-Micronutrition&quot; App is
        protected by a password. HEALTHOPTIX PTE LTD will not sell or disclose
        your personal data to any non-related parties (out of scope as
        mentioned in paragraph 3) without your consent, except in the following
        cases:
      </p>

      <p className="mt-8 font-semibold">5. Cookies</p>
      <p className="mt-2 leading-relaxed">
        HEALTHOPTIX PTE LTD &amp; &quot;Symbionat-Micronutrition&quot; App may use
        cookie technology to provide services that are more suitable for users;
        cookies are a technique used by web hosts to communicate with
        users&apos; browsers. It may store certain information on users&apos;
        computers, but users can cancel or restrict this function via
        browser&apos;s settings.
      </p>

      <p className="mt-8 font-semibold">6. Data Retention</p>
      <p className="mt-2 leading-relaxed">
        We retain personal information for as long as necessary to fulfill the
        purposes outlined in this Privacy Policy unless receiving a withdraw
        notification from the users. We will securely delete personal data and
        anonymize personal information.
      </p>

      <p className="mt-8 font-semibold">7. User Rights</p>
      <p className="mt-2 leading-relaxed">
        Users have the right to access, correct, and request the deletion of
        their personal information. You may also withdraw your consent for the
        processing of personal information or limit its use for specific
        purposes.
      </p>
      <p className="mt-4">
        - To access to your personal information, you can log in on our APP/
        website.
      </p>
      <p className="mt-2">
        - To correct or request the deletion of your personal inforamtion, or
        withdraw your consent, you can contact our DPO using the email address
        provided at the end of this Policy.
      </p>

      <p className="mt-8 font-semibold">8. Updates to the Privacy Policy</p>
      <p className="mt-2 leading-relaxed">
        We may update this Privacy Policy from time to time to reflect changes
        in our practices or applicable laws. We will notify users of any material
        changes through our website or other appropriate means. Users are
        encouraged to review the Privacy Policy periodically on our website (
        <Link href="/privacypolicy" className="text-[#003F73] underline">
          Privacy Policy
        </Link>
        ).
      </p>

      <p className="mt-8 font-semibold">9. Contact Us</p>
      <p className="mt-2 leading-relaxed">
        If you have any questions, concerns, or requests regarding this Privacy
        Policy or the handling of your personal information, please contact our
        DPO at:
      </p>
      <p className="mt-4">
        <a
          href="mailto:info@health-optix.com"
          className="text-[#003F73] underline"
        >
          info@health-optix.com
        </a>
      </p>

      <p className="mt-12 text-center text-sm">© 2023 HEALTHOPTIX PTE LTD</p>
      <p className="mt-8 text-center">
        <Link href="/" className="text-[#003F73] underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
