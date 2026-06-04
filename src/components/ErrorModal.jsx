import React from "react";
import { formatAuthError } from "../utils/parseApiError";

export default function ErrorModal({ message, onClose }) {
  const text = formatAuthError(message, typeof message === "string" ? message : "");
  if (!text) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-red-600">Something went wrong</h2>
        <p className="mb-6 text-gray-700">{text}</p>
        <button
          onClick={onClose}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
