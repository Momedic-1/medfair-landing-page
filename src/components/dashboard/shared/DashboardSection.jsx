export function DashboardSection({
  title,
  subtitle,
  action,
  children,
  className = "",
  noPadding,
}) {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            {title && (
              <h2 className="text-base font-bold text-[#020e7c] sm:text-lg">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-4 sm:p-5"}>{children}</div>
    </section>
  );
}

export default DashboardSection;
