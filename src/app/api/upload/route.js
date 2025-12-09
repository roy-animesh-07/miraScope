import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const records = parse(buffer, {
      columns: true,   
      skip_empty_lines: true,
    });

    const result = records.map((r) => ({
      ...r,
    }));

    return NextResponse.json({ result });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
