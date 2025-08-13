import React from "react";
import Navbar from "../components/Home/Navbar/Navbar";

const CookiesPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 gap-10">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 my-12">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-2">Cookies Policy</h1>
        <p className="text-sm text-gray-500 mb-6">
          Effective Date: August 7, 2025
        </p>

        {/* Sections */}
        <div className="space-y-6">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              At Medfair, your privacy is important to us. As a telemedicine
              platform, we are committed to maintaining the highest standards of
              transparency and data protection. This Cookies Policy explains
              what cookies are, how and why we use them, and your choices
              regarding their use. This policy should be read alongside our
              Privacy Policy.
            </p>
          </section>

          {/* What Are Cookies */}
          <section>
            <h2 className="text-xl font-semibold mb-2">2. What Are Cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files that are stored on your device
              (computer, smartphone, or tablet) when you visit a website. They
              help websites recognize your device, remember your preferences,
              improve functionality, and tailor user experiences. Cookies can
              be:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Session cookies – deleted when you close your browser.</li>
              <li>
                Persistent cookies – stored until they expire or are manually
                deleted.
              </li>
            </ul>
          </section>

          {/* Why We Use Cookies */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              3. Why We Use Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar technologies to ensure our platform
              functions effectively and securely while also enhancing your
              experience. The types of cookies we use include:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>
                <strong>Strictly Necessary Cookies:</strong> Essential for the
                platform to operate, including secure login, user
                authentication, session management, and fraud prevention.
              </li>
              <li>
                <strong>Performance and Analytics Cookies:</strong> Help us
                understand how users interact with our platform so we can
                improve usability and performance.
              </li>
              <li>
                <strong>Functionality Cookies:</strong> Remember your
                preferences (e.g., language, region, login details) to provide a
                personalized experience.
              </li>
              <li>
                <strong>Advertising and Targeting Cookies:</strong> Allow us and
                our partners to deliver relevant advertisements based on your
                behavior and interactions.
              </li>
              <li>
                <strong>Security Cookies:</strong> Support and enhance security
                features, including detecting unauthorized access and suspicious
                activities.
              </li>
            </ul>
          </section>

          {/* Third Party Cookies */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              4. Third-Party Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may allow selected third-party partners (such as analytics
              providers, payment processors, or customer support tools) to set
              cookies when you interact with certain features. These partners
              may use cookies in accordance with their own policies. We do not
              control the technologies used by third parties and encourage you
              to review their policies directly.
            </p>
          </section>

          {/* Your Cookie Preferences */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              5. Your Cookie Preferences
            </h2>
            <p className="text-gray-700 leading-relaxed">
              You have the right to control and manage your cookie preferences.
              You can:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>
                Adjust your browser settings to accept, reject, or delete
                cookies.
              </li>
              <li>
                Opt-out of analytics or targeted advertising by visiting
                third-party opt-out platforms (e.g., Google Ads Settings or the
                Network Advertising Initiative).
              </li>
              <li>
                Use the cookie management tools or banners available on our
                platform where applicable.
              </li>
            </ul>
            <p className="text-gray-700 mt-2">
              Please note that disabling essential cookies may affect the core
              functionality of the platform, including secure login and access
              to medical services.
            </p>
          </section>

          {/* Retention */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              6. Retention of Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are retained for different durations based on their
              purpose:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Essential Cookies: Up to 2 years</li>
              <li>Performance and Analytics Cookies: Up to 24 months</li>
              <li>Functionality Cookies: Up to 12 months</li>
              <li>Advertising Cookies: Up to 13 months</li>
            </ul>
            <p className="text-gray-700 mt-2">
              Retention periods may vary depending on the cookie provider.
            </p>
          </section>

          {/* DNT Signals */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              7. Do Not Track (DNT) Signals
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Some browsers offer a “Do Not Track” (DNT) signal. At this time,
              Medfair does not respond to DNT signals, as there is no consistent
              industry standard for compliance. We remain committed to offering
              you meaningful choices regarding your privacy.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              8. Changes to This Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookies Policy periodically to reflect changes
              in technology, regulation, or our business practices. The updated
              version will always be available on our platform with a revised
              effective date. We encourage you to review it regularly.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold mb-2">9. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions or concerns about our use of cookies,
              please contact:
            </p>
            <p className="mt-2 text-gray-700">
              <strong>Medfair Privacy Office</strong> <br />
              Email:{" "}
              <a
                href="mailto:hello@medfairtechnologies.com"
                className="text-blue-600 underline"
              >
                hello@medfairtechnologies.com
              </a>
              <br />
              Website:{" "}
              <a
                href="https://www.medfairtechnologies.com"
                className="text-blue-600 underline"
                target="_blank"
                rel="noreferrer"
              >
                www.medfairtechnologies.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiesPolicy;
