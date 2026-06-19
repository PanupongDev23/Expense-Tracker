import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";

function buildPrompt(categoryLines: string) {
  return `You are a Thai payment slip / receipt parser. Analyze this image and extract all individual line items.

The user has these categories (format: "id | name | type"):
${categoryLines}

Return ONLY valid JSON (no markdown, no explanation) in this exact shape:
{
  "merchant": <string — store or payee name, in Thai if applicable>,
  "date": <string "YYYY-MM-DD" — transaction date, use today if unclear>,
  "type": <"expense" | "income">,
  "items": [
    {
      "note": <string — item name/description in Thai, max 60 chars>,
      "amount": <number — item price, positive, no currency symbol>,
      "categoryId": <string — best matching id from category list, or null>,
      "suggestedCategoryName": <string — matched category name, or new Thai suggestion if no match>
    }
  ]
}

Rules:
- Extract EACH individual product/service as a separate item in the array
- If the slip only shows a total (no line items), return a single item with the total amount
- amount for each item must be positive
- Do NOT include discount lines, tax lines, or subtotals as separate items — fold them into the relevant item or ignore
- categoryId must be an exact id from the list above, or null
- date must be in YYYY-MM-DD format
- For PromptPay / bank transfers where money is received → type "income", else "expense"`;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("slip") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP)" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "ขนาดไฟล์ต้องไม่เกิน 10MB" }, { status: 400 });
  }

  const categoryLines = formData.get("categories") as string | null;
  if (!categoryLines) {
    return NextResponse.json({ error: "Missing categories" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  let text: string;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://expense-tracker-eta-three-42.vercel.app",
        "X-Title": "Expense Tracker"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: buildPrompt(categoryLines) },
              { type: "image_url", image_url: { url: dataUrl } }
            ]
          }
        ]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `OpenRouter error ${res.status}: ${errText.slice(0, 120)}` }, { status: 502 });
    }

    const json = await res.json();
    text = (json.choices?.[0]?.message?.content ?? "").trim();
  } catch (err) {
    return NextResponse.json(
      { error: "ไม่สามารถเชื่อมต่อ OpenRouter ได้: " + (err instanceof Error ? err.message : String(err)).slice(0, 80) },
      { status: 502 }
    );
  }

  let parsed: unknown;
  try {
    const clean = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "");
    parsed = JSON.parse(clean);
  } catch {
    return NextResponse.json({ error: "AI ไม่สามารถอ่าน Slip นี้ได้ กรุณากรอกข้อมูลเอง" }, { status: 422 });
  }

  return NextResponse.json({ ok: true, data: parsed });
}
