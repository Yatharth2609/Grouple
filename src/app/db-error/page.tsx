import { Button } from "@/components/ui/button";
import { AlertCircle, Database } from "lucide-react";
import Link from "next/link";

export default function DatabaseErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="flex flex-col items-center max-w-md text-center">
        <div className="bg-red-500/10 p-3 rounded-full mb-4">
          <Database className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Database Connection Error</h1>
        <div className="flex items-center gap-2 mb-4 bg-red-500/10 px-3 py-1 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-500">Service temporarily unavailable</p>
        </div>
        <p className="text-gray-400 mb-6">
          We're having trouble connecting to our database. This could be due to maintenance or a temporary outage. 
          Please try again later.
        </p>
        <div className="flex gap-4">
          <Link href="/">
            <Button variant="outline" className="rounded-xl">
              Go Home
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button className="rounded-xl">
              Try Again
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 