"use client";
import React from "react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import FormRenderer, { FormSchema } from "@/components/FormRenderer";

export default function PublicFormPage({ params }: { params: Promise<{ id: string }> }) {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { id } = React.use(params);

  useEffect(() => {
    apiFetch(`/forms/${id}`)
      .then((res) => setSchema({ title: res.form.title, description: res.form.description, fields: res.form.fields }))
      .catch((e) => setError(e.message));
  }, [id]);

  const handleSubmit = async (data: Record<string, any>) => {
    await apiFetch(`/forms/${id}/submissions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setSubmitted(true);
  };

  if (error) return <p className="text-red-600">{error}</p>;
  if (!schema) return <p>Loading form...</p>;
  if (submitted) return <p>Thanks! Your response has been recorded.</p>;

  return <FormRenderer schema={schema} onSubmit={handleSubmit} />;
}