/** Compact prev/next pager — page is 0-based. */
export default function SimplePager({
  page = 0,
  totalPages = 0,
  totalElements = 0,
  pageSize = 5,
  onPrev,
  onNext,
  disabled = false,
  className = "",
}) {
  if (totalPages <= 1 && totalElements <= pageSize) return null;

  const safeTotalPages = Math.max(totalPages, 1);
  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div
      className={`mt-4 flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      <p className="text-xs text-slate-500">
        Showing {from}–{to} of {totalElements}
        {safeTotalPages > 0 ? ` · Page ${page + 1} of ${safeTotalPages}` : ""}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled || page <= 0}
          onClick={onPrev}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={disabled || page >= safeTotalPages - 1}
          onClick={onNext}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
