import { Camera, Loader2 } from "lucide-react";

export const profileLabelClass =
  "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5";
export const profileInputClass =
  "block w-full h-11 rounded-xl border border-gray-200 bg-gray-50/80 px-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-[#020e7c] focus:bg-white focus:ring-2 focus:ring-[#020e7c]/15";
export const profileTextareaClass =
  "block w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all resize-y focus:border-[#020e7c] focus:bg-white focus:ring-2 focus:ring-[#020e7c]/15";

export function ProfileHero({
  fullName,
  email,
  imageUrl,
  uploadingImage,
  onImageChange,
  chips = [],
}) {
  const initials = (fullName || "?")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#020e7c] via-[#0a1f9c] to-[#1e3a8a] px-5 py-6 text-white shadow-lg sm:px-8 sm:py-8">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-blue-400/20 blur-2xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-white/20 bg-white/10 shadow-xl sm:h-28 sm:w-28">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white/90">
                {initials}
              </div>
            )}
          </div>
          <label
            htmlFor="profile-hero-upload"
            className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-[#020e7c] bg-white text-[#020e7c] shadow-md transition hover:scale-105"
          >
            {uploadingImage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            <input
              id="profile-hero-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageChange}
              disabled={uploadingImage}
            />
          </label>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-200/90">
            My health profile
          </p>
          <h1 className="mt-1 truncate text-2xl font-bold sm:text-3xl">
            {fullName || "Patient"}
          </h1>
          {email && (
            <p className="mt-1 truncate text-sm text-blue-100/90">{email}</p>
          )}
          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm"
                >
                  <span className="text-blue-200/80">{chip.label}</span>
                  <span className="text-white">{chip.value}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProfileSectionCard({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      {(title || description) && (
        <div className="mb-5 border-b border-gray-100 pb-4">
          {title && (
            <h2 className="text-base font-semibold text-[#020e7c]">{title}</h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export function ProfileSaveButton({ loading, label = "Save changes" }) {
  return (
    <div className="flex justify-end border-t border-gray-100 pt-5">
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#020e7c] px-6 text-sm font-semibold text-white shadow-md transition hover:bg-[#0a1a8f] focus:outline-none focus:ring-2 focus:ring-[#020e7c] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Saving…" : label}
      </button>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-36 rounded-2xl bg-gray-200" />
      <div className="h-12 rounded-xl bg-gray-100" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-11 rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
