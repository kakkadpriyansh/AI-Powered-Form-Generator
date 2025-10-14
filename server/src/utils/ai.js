const fetch = global.fetch || require('node-fetch');

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + apiKey;
  const systemText = `You are a form schema generator. Output ONLY valid JSON with keys: title, description, fields[]. Each field has name, label, type (text|email|number|textarea|select|radio|checkbox|date|image), required (boolean), options (array for select/radio/checkbox). No prose, no markdown.`;
  const body = {
    systemInstruction: { role: 'system', parts: [{ text: systemText }] },
    contents: [{ role: 'user', parts: [{ text: prompt }]}],
    generationConfig: { temperature: 0.2 },
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  try {
    const parts = data.candidates?.[0]?.content?.parts || [];
    const textPart = parts.find((p) => typeof p.text === 'string')?.text || '';
    const cleaned = textPart.replace(/```json/g, '```').replace(/```/g, '').trim();
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    const trimmed = cleaned.slice(jsonStart, jsonEnd + 1);
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

async function callOpenRouter(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  const url = 'https://api.openrouter.ai/v1/chat/completions';
  const system = `You are a form schema generator. Output ONLY JSON (no code fences) with {title, description, fields:[{name,label,type,required,options?}]}.`;
  const body = {
    model: 'openai/gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  try {
    const text = data.choices?.[0]?.message?.content || '';
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function callGroq(prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const system = `You are a form schema generator. Output ONLY JSON (no code fences) with {title, description, fields:[{name,label,type,required,options?}]}.`;
  const body = {
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  try {
    const text = data.choices?.[0]?.message?.content || '';
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function validateSchema(schema) {
  if (!schema || typeof schema !== 'object') return false;
  if (!schema.title || !Array.isArray(schema.fields)) return false;
  for (const f of schema.fields) {
    if (!f || !f.name || !f.label || !f.type) return false;
  }
  return true;
}

function heuristicSchemaFromPrompt(prompt = '') {
  const p = (prompt || '').toLowerCase();
  const fields = [];

  // Always include name/email if mentioned, else we’ll add at least one
  if (p.includes('name')) fields.push({ name: 'name', label: 'Name', type: 'text', required: true });
  if (p.includes('email')) fields.push({ name: 'email', label: 'Email', type: 'email', required: true });

  if (p.includes('phone')) fields.push({ name: 'phone', label: 'Phone', type: 'text', required: false });
  if (p.includes('age')) fields.push({ name: 'age', label: 'Age', type: 'number', required: false });
  if (p.includes('date')) fields.push({ name: 'date', label: 'Date', type: 'date', required: false });
  if (p.includes('address')) fields.push({ name: 'address', label: 'Address', type: 'text', required: false });

  if (p.includes('gender')) fields.push({ name: 'gender', label: 'Gender', type: 'select', required: false, options: ['Male', 'Female', 'Other'] });
  if (p.includes('country')) fields.push({ name: 'country', label: 'Country', type: 'text', required: false });

  if (p.includes('rating') || p.includes('score')) fields.push({ name: 'rating', label: 'Rating', type: 'radio', required: false, options: ['1', '2', '3', '4', '5'] });
  if (p.includes('feedback') || p.includes('comments') || p.includes('comment')) fields.push({ name: 'comments', label: 'Comments', type: 'textarea', required: false });

  if (p.includes('image') || p.includes('photo') || p.includes('screenshot')) fields.push({ name: 'image', label: 'Image', type: 'image', required: false });

  // Ensure at least two sensible fields
  if (fields.length === 0) {
    fields.push({ name: 'name', label: 'Name', type: 'text', required: true });
    fields.push({ name: 'email', label: 'Email', type: 'email', required: true });
  }

  // Basic title derivation
  let title = 'Generated Form';
  if (p.includes('feedback')) title = 'Feedback Form';
  else if (p.includes('survey')) title = 'Survey Form';
  else if (p.includes('registration')) title = 'Registration Form';
  else if (p.includes('contact')) title = 'Contact Form';

  return {
    title,
    description: 'Auto-generated schema (heuristic)',
    fields,
  };
}

async function generateSchemaFromPrompt(prompt) {
  let schema = await callGemini(prompt);
  if (!schema) schema = await callOpenRouter(prompt);
  if (!schema) schema = await callGroq(prompt);
  if (!schema || !validateSchema(schema)) {
    // Heuristic fallback based on the prompt content
    schema = heuristicSchemaFromPrompt(prompt);
  }
  return schema;
}

module.exports = { generateSchemaFromPrompt };