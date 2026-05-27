import Navbar from "../Navbar/Navbar";
import Footer from "../reuseable/Footer";
import Works from "../works/Works";
import ContactUs from "../Contact/ContactUs";
import FAQs from "../FAQs/FAQs";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const specialties = [
  {
    title: "General Practice",
    subtitle: "Instant virtual consultation",
    icon: "🩺",
    tone: "from-blue-500 to-cyan-500",
  },
  {
    title: "Mental Health",
    subtitle: "Confidential specialist care",
    icon: "🧠",
    tone: "from-violet-500 to-purple-500",
  },
  {
    title: "Women's Health",
    subtitle: "Private and guided support",
    icon: "🌸",
    tone: "from-pink-500 to-rose-500",
  },
  {
    title: "Chronic Care",
    subtitle: "Continuous monitoring and follow-up",
    icon: "💙",
    tone: "from-emerald-500 to-teal-500",
  },
];

const pillars = [
  {
    title: "Book in minutes",
    text: "Find the right doctor fast and schedule easily from any device.",
  },
  {
    title: "Consult securely",
    text: "Video visits and records are protected with healthcare-grade privacy.",
  },
  {
    title: "Stay on track",
    text: "Get follow-up reminders, notes, and care continuity in one place.",
  },
];

const conditionCards = [
  { name: "Cold & flu", icon: "🤒", tone: "from-blue-500 to-cyan-500", description: "Quick relief plan with same-day virtual guidance." },
  { name: "Malaria", icon: "🦟", tone: "from-emerald-500 to-teal-500", description: "Early symptom review and treatment support." },
  { name: "Anxiety", icon: "🧠", tone: "from-violet-500 to-purple-500", description: "Confidential specialist care for emotional wellness." },
  { name: "Women’s health", icon: "🌸", tone: "from-pink-500 to-rose-500", description: "Private, respectful support across every stage." },
  { name: "Skin care", icon: "✨", tone: "from-amber-500 to-orange-500", description: "Personalized plans for common skin concerns." },
  { name: "ENT", icon: "👂", tone: "from-indigo-500 to-blue-500", description: "Fast review for ear, nose, and throat issues." },
  { name: "Weight support", icon: "⚖️", tone: "from-sky-500 to-blue-600", description: "Clinician-led coaching for sustainable progress." },
  { name: "Prescription refill", icon: "💊", tone: "from-cyan-500 to-teal-600", description: "Simple refill requests with medical oversight." },
];

const HomePage = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPromptEvent) {
      window.alert(
        "To install Medfair App now, open your browser menu and tap 'Install app' or 'Add to Home screen'."
      );
      return;
    }
    installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
  };

  return (
    <div className="max-w-full bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <Navbar />

      <section className="relative mx-auto mt-20 w-full max-w-7xl px-4 pb-10 pt-8 sm:px-6 md:mt-24 lg:px-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-8 left-8 h-24 w-24 rounded-full bg-blue-100 blur-2xl" />
          <div className="absolute right-10 top-20 h-32 w-32 rounded-full bg-cyan-100 blur-3xl" />
        </div>
        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {!isStandalone && (
              <button
                type="button"
                onClick={handleInstallApp}
                className="inline-flex w-full animate-pulse items-center justify-center rounded-2xl border-2 border-[#020e7c] bg-yellow-300 px-5 py-3 text-sm font-extrabold uppercase tracking-wide text-[#020e7c] shadow-lg ring-4 ring-yellow-200/80 transition hover:scale-[1.01] hover:bg-yellow-200 sm:w-auto"
              >
                Download Medfair App
              </button>
            )}
            <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Smarter telemedicine, built for real patient care.
            </h1>
            <p className="max-w-xl text-sm text-slate-600 sm:text-base">
              Book doctors, start instant consultations, manage appointments, and
              keep your care journey connected in one platform.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/patient_signup"
                className="rounded-xl bg-[#020e7c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Get started as patient
              </Link>
              <Link
                to="/doctor_signup"
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Join as doctor
              </Link>
              {!isStandalone && (
                <button
                  type="button"
                  onClick={handleInstallApp}
                  className="animate-pulse rounded-xl border-2 border-[#020e7c] bg-[#020e7c] px-5 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-blue-800"
                >
                  Install Medfair App
                </button>
              )}
            </div>
            <div className="grid max-w-lg grid-cols-3 gap-3">
              <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                <p className="text-lg font-bold text-slate-900">24/7</p>
                <p className="text-xs text-slate-500">Access</p>
              </div>
              <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                <p className="text-lg font-bold text-slate-900">Secure</p>
                <p className="text-xs text-slate-500">Platform</p>
              </div>
              <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                <p className="text-lg font-bold text-slate-900">Fast</p>
                <p className="text-xs text-slate-500">Booking</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-blue-300/40 via-indigo-300/40 to-cyan-300/40 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white p-2 shadow-2xl">
              <motion.img
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                src="https://res.cloudinary.com/da79pzyla/image/upload/v1737299447/tele7_cowogr.jpg"
                alt="Telemedicine consultation"
                className="h-72 w-full rounded-2xl object-cover sm:h-80"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Care paths designed for everyday health needs
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Choose your care category and start in minutes.
              </p>
            </div>
            <Link
              to="/login"
              className="text-sm font-semibold text-[#020e7c] hover:text-blue-700"
            >
              Explore all services →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {specialties.map((item) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${item.tone} text-2xl text-white shadow-md`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Virtual care
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
                  <Link
                    to="/login"
                    className="mt-3 inline-flex text-sm font-semibold text-[#020e7c] hover:text-blue-700"
                  >
                    Start now
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-gradient-to-r from-[#020e7c] to-blue-700 p-6 text-white shadow-xl sm:p-8"
        >
          <div className="grid gap-4 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-2xl border border-white/20 bg-white/10 p-4"
              >
                <h3 className="font-semibold">{pillar.title}</h3>
                <p className="mt-2 text-sm text-blue-50">{pillar.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-indigo-100/70 blur-3xl" />

          <Link
            to="/login"
            className="relative mb-5 block rounded-2xl p-1 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                  Care navigator
                </p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Popular conditions we treat online
                </h3>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Pick a condition to get matched quickly with the right care path on Medfair.
                </p>
              </div>
              <span className="text-sm font-semibold text-[#020e7c] hover:text-blue-700">
                View all care options →
              </span>
            </div>
          </Link>

          <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {conditionCards.map((item, idx) => (
              <Link to="/login" key={item.name}>
                <motion.article
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  whileHover={{ y: -5, scale: 1.01 }}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r ${item.tone} text-lg text-white shadow-md`}
                    >
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 transition group-hover:text-slate-600">
                      Online now
                    </span>
                  </div>
                  <p className="text-base font-semibold text-slate-900">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.description}
                  </p>
                  <div className="mt-3 flex items-center text-xs font-semibold text-[#020e7c]">
                    Start consultation
                    <span className="ml-1 transition group-hover:translate-x-1">→</span>
                  </div>
                </motion.article>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative mx-auto mt-6 w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        <Works />
      </section>

      <section className="mx-auto mt-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#020e7c]">
              Local communities need better access
            </p>
            <h3 className="mt-2 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
              Too many people wait too long for care.
            </h3>
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-600 sm:text-base">
              In many Nigerian communities, overcrowded general hospitals and long queues delay
              treatment for conditions that could be handled earlier. Medfair telemedicine helps
              reduce this pressure by moving suitable consultations online, so patients can speak
              with clinicians faster and physical facilities can focus on urgent in-person care.
            </p>
          </div>
        </article>
      </section>

      <section className="relative mx-auto mt-8 w-full max-w-7xl rounded-3xl border border-slate-200 bg-white shadow-sm">
        <ContactUs />
      </section>

      <section className="relative mx-auto mt-8 mb-10 w-full max-w-7xl rounded-3xl border border-slate-200 bg-white shadow-sm">
        <FAQs />
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
