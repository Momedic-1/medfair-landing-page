const SignUpTop = ({ title = "Doctor signup", subtitle = "Join Medfair and care for patients online." }) => {
  return (
    <div className="mb-6 text-center lg:text-left">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#020e7c]/70">
        Medfair
      </p>
      <h1 className="mt-1 text-2xl font-bold text-[#020e7c] sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
    </div>
  );
};

export default SignUpTop;
