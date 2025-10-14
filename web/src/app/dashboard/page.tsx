"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { isAuthed, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

type Form = {
  _id: string;
  title: string;
  description?: string;
  publicId: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!isAuthed()) {
      router.push('/login');
      return;
    }
    apiFetch('/forms')
      .then((res) => setForms(res.forms))
      .catch((e) => setError(e.message));
  }, [router]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <Link href="/generator" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Create Form</Link>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {forms.map((f) => (
          <div key={f._id} className="border rounded p-4">
            <h2 className="text-xl font-medium">{f.title}</h2>
            {f.description && <p className="text-gray-600">{f.description}</p>}
            <div className="mt-2 flex gap-3">
              <Link href={`/form/${f.publicId}`} className="underline text-blue-600">Public Link</Link>
              <Link href={`/dashboard/${f.publicId}/submissions`} className="underline text-blue-600">View Submissions</Link>
            </div>
          </div>
        ))}
        {forms.length === 0 && (
          <p>No forms yet. Click "Create Form" to add one.</p>
        )}
      </div>
    </div>
  );
}