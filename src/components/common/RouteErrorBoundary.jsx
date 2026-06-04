import { Component } from "react";

export default class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[route-error]", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center">
          <h1 className="text-lg font-bold text-[#020e7c]">Something went wrong</h1>
          <p className="max-w-md text-sm text-slate-600">
            {this.state.error?.message || "The page could not load."}
          </p>
          <button
            type="button"
            onClick={() => window.location.assign("/doctor-dashboard")}
            className="rounded-xl bg-[#020e7c] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Reload dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
