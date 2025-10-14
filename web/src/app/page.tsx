import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold">AI-Powered Form Generator</h1>
      <p className="text-gray-600 max-w-2xl">
        Generate dynamic forms from natural language prompts using Gemini (or free APIs),
        share public links, collect submissions, and support image uploads via Cloudinary.
      </p>
      <div className="flex gap-3">
        <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Sign up</Link>
        <Link href="/login" className="border border-blue-600 text-blue-700 hover:bg-blue-50 px-4 py-2 rounded">Log in</Link>
        <Link href="/dashboard" className="text-indigo-700 hover:underline">Dashboard</Link>
      </div>
    </div>
  );
}
