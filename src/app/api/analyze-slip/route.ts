import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

import { listCategories } from "@/actions/categories";
import { getCurrentUser } from "@/lib/auth";

function buildPrompt(categoryLines: string[]) {
  return `You are a Thai payment slip parser. Analyze this slip image and extract transaction details.

The user has these categories (format: "id | name | type"):
${categoryLines.join("\n")}

Return ONLY valid JSON (no markdown, no explanation) in this exact shape:
{
  "amount": <number, required — the total paid amount>,
  "merchant": <string, required — store or payee name>,
  "type": <"expense" | "income">,
  "categoryId": <string — best matching id from the list above, or null if none fits>,
  "suggestedCategoryName": <string — the category name you matched, or a new name suggestion if no match>,
  "date": <string "YYYY-MM-DD" — use today if unclear>,
  "note": <string — brief description, max 60 chars>
}

Rules:
- amount must be a positive number (no currency symbol)
- For PromptPay / bank transfers where money is received → type "income", else "expense"
- categoryId must be an exact id from the list, or null if truly no match
- date must be in YYYY-MM-DD format
- If slip is in Thai, keep merchant and note in Thai`;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
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

  // Fetch user's real categories
  const categories = await listCategories();
  const categoryLines = categories.map((c) => `${c.id} | ${c.name} | ${c.type}`);

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent([
    buildPrompt(categoryLines),
    {
      inlineData: {
        mimeType: file.type as "image/jpeg" | "image/png" | "image/webp" | "image/heic" | "image/heif",
        data: base64
      }
    }
  ]);

  const text = result.response.text().trim();

  let parsed: unknown;
  try {
    const clean = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "");
    parsed = JSON.parse(clean);
  } catch {
    return NextResponse.json({ error: "AI ไม่สามารถอ่าน Slip นี้ได้ กรุณากรอกข้อมูลเอง" }, { status: 422 });
  }

  return NextResponse.json({ ok: true, data: parsed });
}
