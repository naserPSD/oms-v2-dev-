"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-200 px-4">
      <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl text-center">

        <Image
          src="/assets/images/empty/but-fix.png"
          alt="Error Illustration"
          width={240}
          height={240}
          className="mx-auto mb-6"
        />

        <h1 className="text-5xl font-extrabold text-red-600 mb-4">Uh-oh!</h1>
        <p className="text-lg text-gray-700 mb-3">
          Something went wrong. We&apos;re working to fix it as soon as
          possible.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          If the issue persists, please reach out to our support team.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/" passHref>
            <Button className="px-6 py-2">Home</Button>
          </Link>
          <Button variant="secondary" className="px-6 py-2" onClick={reset}>
            Try Again
          </Button>
        </div>

        <div className="mt-8 bg-gray-100 p-4 rounded-md text-sm text-gray-600">
          <span className="font-medium">Error Details:</span>{" "}
          <code className="text-red-500 break-words">{error?.message}</code>
          {error?.stack && (
            <pre className="mt-2 text-xs text-left overflow-auto max-h-60 text-gray-700 bg-gray-200 p-2 rounded whitespace-pre-wrap font-mono">
              {error.stack}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
