import { Component } from 'react';

// Catches any error thrown while rendering a page. Without this, one
// bad value (e.g. an unexpected API response) makes React unmount the
// whole app and the user sees a blank white screen with no way out.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8 text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Something went wrong</h1>
          <p className="text-slate-600 mb-6">
            This page ran into a problem. Please reload, or go back to the home page.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700"
            >
              Reload
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="px-5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
