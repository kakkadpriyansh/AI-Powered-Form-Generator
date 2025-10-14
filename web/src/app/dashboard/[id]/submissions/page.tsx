"use client";
import React from "react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type Submission = {
  _id: string;
  data: Record<string, any>;
  createdAt: string;
};

export default function SubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { id } = React.use(params);

  useEffect(() => {
    apiFetch(`/forms/${id}/submissions`)
      .then((res) => setSubs(res.submissions))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading submissions...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Submissions</h1>
        <Link href="/dashboard" className="underline text-blue-600">Back to Dashboard</Link>
      </div>
      {subs.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <div className="space-y-3">
          {subs.map((s) => (
            <div key={s._id} className="border rounded p-3">
              <p className="text-sm text-gray-500">{new Date(s.createdAt).toLocaleString()}</p>
              <pre className="text-sm overflow-auto bg-gray-100 p-2 rounded">{JSON.stringify(s.data, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}