import { useState } from "react";
import {
  FaEnvelope,
  FaInstagram,
  FaLinkedin,
  FaPhone,
  FaWhatsapp,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
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
        <title>Contact Us</title>
        <meta name="description" content="Reach out to us anytime" />
      </div>

      <div className="relative h-full bg-white overflow-hidden">
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
            <div className="flex items-center gap-2 font-sans font-normal leading-5 hover:text-blue-500">
              <FaPhone size={15} />
              <span className="text-sm font-bold">+234 808 041 4379</span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 font-sans font-normal leading-5 hover:text-blue-500">
              <FaEnvelope size={20} />
              <span className="text-sm font-bold">
                hello@medfairtechnologies.com
              </span>
            </div>

            {/* X (Twitter) */}
            <Link
              to="https://x.com/The_Medfair?t=g2wtGfTCvyZ3cN63C5qn0w&s=09"
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="flex  items-center gap-2">
                <FaXTwitter size={20} />
                <span className="text-sm font-bold">Twitter</span>
              </div>
            </Link>

            {/* WhatsApp */}
            <div className="flex items-center gap-2 font-sans font-normal leading-5 hover:text-blue-500">
              <FaWhatsapp size={20} />
              <span className="text-sm font-bold">+234 808 041 4379</span>
            </div>

            {/* Instagram */}
            <Link to="https://www.instagram.com/the_medfair?igsh=cHM2M3hiMm9lZXQ1">
              <div className="flex items-center gap-2 font-sans font-normal leading-5 hover:text-blue-500">
                <FaInstagram size={20} />
                <span className="text-sm font-bold">Instagram</span>
              </div>
            </Link>

            {/* LinkedIn */}
            <Link
              to="https://www.linkedin.com/company/the-medfair/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="flex items-center gap-2 font-sans font-normal leading-5 hover:text-blue-500">
                <FaLinkedin size={20} />
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
