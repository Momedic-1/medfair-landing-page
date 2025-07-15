import { useState } from "react";
import { Link } from "react-router-dom";

const ContactUs = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const subject = encodeURIComponent("Contact Form Submission");
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    );

    window.location.href = `mailto:hello@medfairtechnologies.com?subject=${subject}&body=${body}`;
  };
  return (
    <div className="p-4 md:p-8 rounded-lg">
      <div>
        <title>Contact Us | YourSite</title>
        <meta name="description" content="Reach out to us anytime" />
      </div>

      <div className="relative h-full bg-white overflow-hidden">
        {/* Top Artistic SVG */}
        <div className="absolute top-0 left-0 w-full">
          <svg viewBox="0 0 1440 320" className="w-full h-40">
            <path
              fill="#2563eb"
              fillOpacity="0.3"
              d="M0,160L48,165.3C96,171,192,181,288,192C384,203,480,213,576,197.3C672,181,768,139,864,144C960,149,1056,203,1152,208C1248,213,1344,171,1392,149.3L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            ></path>
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10 pb-12">
          <h1 className="text-4xl font-bold text-blue-600 text-center mb-6">
            Contact Us
          </h1>
          <p className="text-center text-gray-600 mb-3">
            We&rsquo;re happy to hear from you. Please fill out the form below
            and we&rsquo;ll respond as soon as possible.
          </p>

          {/* Social & Contact Icons Row */}
          <div className="flex flex-wrap justify-center items-center mx-auto w-[90%] gap-6 mb-6 text-blue-600">
            {/* Phone */}
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3l2 5-2 1a11 11 0 005 5l1-2 5 2v3a2 2 0 01-2 2h-1a16 16 0 01-10-10V5z"
                />
              </svg>

              <span className="text-sm font-bold">+234 808 041 4379</span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v1.2l-10 6.25L2 7.2V6c0-1.1.9-2 2-2zm0 4.25l8 5 8-5V18c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8.25z" />
              </svg>

              <span className="text-sm font-bold">hello@medfairtechnologies.com</span>
            </div>

            {/* X (Twitter) */}
            <Link
              to="https://x.com/The_Medfair?t=g2wtGfTCvyZ3cN63C5qn0w&s=09"
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="flex  items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5.5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>

                <span className="text-sm font-bold">X</span>
              </div>
            </Link>

            {/* WhatsApp */}
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.52 3.48A11.76 11.76 0 0012 0 11.78 11.78 0 000 12a11.68 11.68 0 001.61 6L0 24l6.33-1.64a11.77 11.77 0 0017.27-10.3 11.65 11.65 0 00-3.08-8.58zM12 21.33a9.34 9.34 0 01-4.75-1.3l-.34-.2-3.75 1 1-3.66-.22-.37a9.2 9.2 0 011.44-11.37A9.3 9.3 0 0112 2.67a9.23 9.23 0 019.33 9.34A9.32 9.32 0 0112 21.33zm5.2-6.86c-.29-.15-1.7-.83-1.96-.93s-.46-.15-.66.15-.76.93-.94 1.13-.35.21-.64.06a7.6 7.6 0 01-3.27-2.84c-.25-.43.25-.4.73-1.33a.56.56 0 000-.54c-.06-.15-.67-1.62-.92-2.22s-.49-.49-.67-.5h-.57a1.1 1.1 0 00-.8.37 3.4 3.4 0 00-1 2.48 5.9 5.9 0 001.25 3.05 13.7 13.7 0 005.24 4.5c.73.31 1.3.5 1.74.64a4.17 4.17 0 001.9.12 3.35 3.35 0 002.2-1.57 2.77 2.77 0 00.19-1.58c-.09-.13-.26-.2-.54-.34z" />
              </svg>
              <span className="text-sm font-bold">+234 808 041 4379</span>
            </div>

            {/* Instagram */}
            <Link to="https://www.instagram.com/the_medfair?igsh=cHM2M3hiMm9lZXQ1">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.25 2.43.418a4.9 4.9 0 011.78 1.15 4.9 4.9 0 011.15 1.78c.168.46.362 1.26.418 2.43.058 1.265.07 1.648.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.25 1.97-.418 2.43a4.9 4.9 0 01-1.15 1.78 4.9 4.9 0 01-1.78 1.15c-.46.168-1.26.362-2.43.418-1.265.058-1.648.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.25-2.43-.418a4.9 4.9 0 01-1.78-1.15 4.9 4.9 0 01-1.15-1.78c-.168-.46-.362-1.26-.418-2.43-.058-1.265-.07-1.648-.07-4.85s.012-3.584.07-4.85c.056-1.17.25-1.97.418-2.43a4.9 4.9 0 011.15-1.78 4.9 4.9 0 011.78-1.15c.46-.168 1.26-.362 2.43-.418 1.265-.058 1.648-.07 4.85-.07zm0-2.2C8.7 0 8.284.012 7.003.07 5.67.128 4.655.33 3.77.72 2.87 1.12 2.05 1.65 1.35 2.35.65 3.05.12 3.87-.28 4.77c-.39.885-.592 1.9-.65 3.233C-.012 8.284 0 8.7 0 12s.012 3.716.07 5c.058 1.333.26 2.348.65 3.233.4.9.93 1.72 1.63 2.42.7.7 1.52 1.23 2.42 1.63.885.39 1.9.592 3.233.65C8.284 23.988 8.7 24 12 24s3.716-.012 5-.07c1.333-.058 2.348-.26 3.233-.65.9-.4 1.72-.93 2.42-1.63.7-.7 1.23-1.52 1.63-2.42.39-.885.592-1.9.65-3.233.058-1.284.07-1.7.07-5s-.012-3.716-.07-5c-.058-1.333-.26-2.348-.65-3.233-.4-.9-.93-1.72-1.63-2.42-.7-.7-1.52-1.23-2.42-1.63-.885-.39-1.9-.592-3.233-.65C15.716.012 15.3 0 12 0zM12 5.838A6.162 6.162 0 1018.162 12 6.17 6.17 0 0012 5.838zm0 10.162A3.998 3.998 0 1116 12a3.994 3.994 0 01-4 4zm6.406-11.845a1.44 1.44 0 11-1.44-1.44 1.44 1.44 0 011.44 1.44z" />
                </svg>
                <span className="text-sm font-bold">Instagram</span>
              </div>
            </Link>

            {/* LinkedIn */}
            <Link
              to="https://www.linkedin.com/company/the-medfair/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 24h4V7.98h-4V24zM8.5 7.98H12v2.16c.48-.76 1.4-2.16 3.4-2.16 3.64 0 4.3 2.4 4.3 5.52V24h-4v-7.92c0-1.88-.04-4.3-2.62-4.3-2.64 0-3.04 2.06-3.04 4.18V24h-4V7.98z" />
                </svg>
                <span className="text-sm pt-1 font-bold">Linkdln</span>
              </div>
            </Link>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-xl border border-blue-100 rounded-xl p-8 space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
