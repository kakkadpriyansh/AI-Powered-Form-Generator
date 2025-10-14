"use client";
import { useState } from "react";
import { uploadImage } from "@/lib/api";

export type Field = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
};

export type FormSchema = {
  title: string;
  description?: string;
  fields: Field[];
};

export default function FormRenderer({
  schema,
  onSubmit,
  submitLabel = "Submit",
}: {
  schema: FormSchema;
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (name: string, value: any) => {
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleUpload = async (name: string, file?: File | null) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      handleChange(name, url);
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Basic validation: ensure required fields are present/non-empty
      for (const f of schema.fields) {
        if (!f.required) continue;
        const val = values[f.name];
        if (f.type === 'checkbox') {
          if (!Array.isArray(val) || val.length === 0) {
            setLoading(false);
            setError(`${f.label} is required`);
            return;
          }
        } else if (f.type === 'image') {
          if (!val || typeof val !== 'string') {
            setLoading(false);
            setError(`${f.label} image is required`);
            return;
          }
        } else if (f.type === 'select' || f.type === 'radio') {
          if (!val) {
            setLoading(false);
            setError(`${f.label} is required`);
            return;
          }
        } else {
          if (val === undefined || val === null || String(val).trim() === '') {
            setLoading(false);
            setError(`${f.label} is required`);
            return;
          }
        }
      }
      await onSubmit(values);
    } catch (e: any) {
      setError(e?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-semibold">{schema.title}</h2>
      {schema.description && <p className="text-gray-600">{schema.description}</p>}
      <div className="space-y-3">
        {schema.fields.map((f) => (
          <div key={f.name} className="flex flex-col gap-1">
            <label className="font-medium">
              {f.label}
              {f.required && <span className="text-red-500"> *</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea
                className="border rounded px-3 py-2"
                required={f.required}
                value={values[f.name] || ""}
                onChange={(e) => handleChange(f.name, e.target.value)}
              />
            ) : f.type === "select" ? (
              <select
                className="border rounded px-3 py-2"
                required={f.required}
                value={values[f.name] || ""}
                onChange={(e) => handleChange(f.name, e.target.value)}
              >
                <option value="">Select...</option>
                {(f.options || []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : f.type === "radio" ? (
              <div className="flex gap-3">
                {(f.options || []).map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={f.name}
                      value={opt}
                      checked={values[f.name] === opt}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ) : f.type === "checkbox" ? (
              <div className="flex gap-3">
                {(f.options || []).map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(values[f.name] || []).includes(opt)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const current = values[f.name] || [];
                        const next = checked
                          ? [...current, opt]
                          : current.filter((x: string) => x !== opt);
                        handleChange(f.name, next);
                      }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ) : f.type === "image" ? (
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(f.name, e.target.files?.[0])}
                />
                {values[f.name] && (
                  <a href={values[f.name]} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    View image
                  </a>
                )}
              </div>
            ) : (
              <input
                className="border rounded px-3 py-2"
                type={f.type}
                required={f.required}
                value={values[f.name] || ""}
                onChange={(e) => handleChange(f.name, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
      {error && <p className="text-red-600">{error}</p>}
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Working..." : submitLabel}
      </button>
    </form>
  );
}