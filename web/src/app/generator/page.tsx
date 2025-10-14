"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import FormRenderer, { FormSchema } from "@/components/FormRenderer";
import { isAuthed, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function GeneratorPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthed()) {
      router.push('/login');
    }
  }, [router]);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/ai/generate-schema', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      setSchema(res.schema);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const saveForm = async () => {
    if (!schema) return;
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch('/forms', {
        method: 'POST',
        body: JSON.stringify(schema),
      });
      window.location.href = `/form/${res.form.publicId}`;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">AI Form Generator</h1>
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
      <div className="space-y-2">
        <textarea
          className="border rounded px-3 py-2 w-full min-h-24"
          placeholder="Describe the form you need..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded" onClick={generate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Form Schema'}
        </button>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      {schema && (
        <div className="border rounded p-4">
          <FormRenderer schema={schema} onSubmit={async () => {}} submitLabel="Preview Only" />
          <div className="mt-3">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" onClick={saveForm} disabled={saving}>
              {saving ? 'Saving...' : 'Save Form'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}