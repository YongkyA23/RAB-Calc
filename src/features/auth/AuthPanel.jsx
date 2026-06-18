import { useState } from "react";
import { Button } from "../../components/ui/Button";

export function AuthPanel({ error, loading, onGoogleSignIn }) {
  const [showAccessRequest, setShowAccessRequest] = useState(false);

  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-slate-950">
          RAB Calculator Login
        </h1>
        <p className="mt-3 text-slate-600">
          Use your approved Google account to continue.
        </p>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {showAccessRequest ? (
          <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Contact an administrator and ask them to add your Google email to
            the approved list.
          </div>
        ) : null}

        <Button
          className="mt-8 w-full"
          disabled={loading}
          onClick={onGoogleSignIn}
          variant="primary"
        >
          Sign in with Google
        </Button>
      </div>
    </section>
  );
}
