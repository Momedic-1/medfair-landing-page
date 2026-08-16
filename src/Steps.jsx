import React from "react";

const Steps = ({ stepLabels, currentStep }) => {
  return (
    <ol className="mb-6 flex w-full items-center justify-center gap-1 sm:gap-2">
      {stepLabels.map((label, index) => {
        const active = currentStep >= index + 1;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center last:flex-none">
            <div className="flex min-w-0 flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  active
                    ? "bg-[#020e7c] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </span>
              <span
                className={`max-w-[4.5rem] truncate text-center text-[11px] font-medium sm:max-w-none sm:text-left sm:text-sm ${
                  active ? "text-[#020e7c]" : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </div>
            {index < stepLabels.length - 1 ? (
              <span
                className={`mx-1 hidden h-px flex-1 sm:block ${
                  currentStep > index + 1 ? "bg-[#020e7c]/40" : "bg-gray-200"
                }`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
};

export default Steps;
