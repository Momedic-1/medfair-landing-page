import { Link } from "react-router-dom";
import { FaCalendarCheck, FaStethoscope, FaMobileAlt, FaArrowRight } from "react-icons/fa";

const ContactUs = () => {
  return (
    <section
      className="relative w-full overflow-hidden bg-gradient-to-br from-[#020e7c] via-blue-700 to-indigo-800 px-4 py-10 sm:px-6 sm:py-12"
      id="contact-us"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-blue-200/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-indigo-300/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm sm:p-8 lg:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
              Ready when you are
            </p>
            <h3 className="mt-2 text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
              Start your consultation in minutes.
            </h3>
            <p className="mt-3 max-w-2xl text-sm text-blue-100 sm:text-base">
              Skip the wait. Choose your care path, talk to a clinician, and continue your
              treatment journey all in one secure Medfair experience.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#020e7c] transition hover:bg-blue-50"
              >
                Book as patient
                <FaArrowRight className="text-xs" />
              </Link>
              <Link
                to="/doctor_signup"
                className="inline-flex items-center gap-2 rounded-xl border border-white/60 bg-transparent px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Join as doctor
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-white">
                  <FaCalendarCheck />
                </div>
                <p className="text-sm font-semibold text-white">Fast booking</p>
                <p className="mt-1 text-xs text-blue-100">Start within minutes</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-white">
                  <FaStethoscope />
                </div>
                <p className="text-sm font-semibold text-white">Expert clinicians</p>
                <p className="mt-1 text-xs text-blue-100">Trusted care specialists</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-white">
                  <FaMobileAlt />
                </div>
                <p className="text-sm font-semibold text-white">Install as app</p>
                <p className="mt-1 text-xs text-blue-100">Use Medfair like mobile app</p>
              </div>
            </div>
          </div>
          <div>
            <article className="overflow-hidden rounded-2xl border border-white/20 bg-white/10">
              <img
                src="https://res.cloudinary.com/da79pzyla/image/upload/v1737299447/tele3_nknjae.jpg"
                alt="Telemedicine consultation"
                className="h-64 w-full object-cover sm:h-72"
              />
              <div className="p-4">
                <p className="text-sm font-bold text-white">Telemedicine consultation</p>
                <p className="mt-1 text-xs text-blue-100">
                  Remote consultations help patients speak with clinicians earlier and reduce
                  unnecessary pressure on physical hospital queues.
                </p>
              </div>
            </article>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactUs;
