import { ChevronRight } from "lucide-react";

const ActionCard = ({
  title,
  description,
  icon,
  image,
  onClick,
  disabled = false,
  accent = "blue",
}) => {
  const accents = {
    blue: "from-[#020e7c] to-blue-700",
    teal: "from-teal-600 to-teal-500",
    violet: "from-violet-700 to-violet-600",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative w-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 text-left shadow-sm transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#020e7c]/30 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:shadow-sm sm:p-6`}
    >
      <div
        className={`absolute right-0 top-0 h-24 w-24 rounded-bl-[4rem] bg-gradient-to-br opacity-10 ${accents[accent] || accents.blue}`}
      />
      <div className="relative flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${accents[accent] || accents.blue}`}
        >
          {image ? (
            <img src={image} alt="" className="h-8 w-8 object-contain" />
          ) : (
            icon
          )}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-base font-bold text-[#020e7c] sm:text-lg">{title}</p>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              {description}
            </p>
          )}
        </div>
        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#020e7c]" />
      </div>
    </button>
  );
};

export default ActionCard;
