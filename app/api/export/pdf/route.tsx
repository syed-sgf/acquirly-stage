export const runtime = "nodejs";

import React from "react";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import IndicativeTermsPDF from "@/components/pdf/IndicativeTermsPDF";

export async function POST(request: Request) {
  const terms = await request.json().catch(() => ({}));
  const pdfBuffer = await renderToBuffer(<IndicativeTermsPDF terms={terms} />);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="indicative-terms.pdf"',
    },
  });
}

// Optional GET for smoke testing
export async function GET() {
  const demo = { note: "hello from GET" };
  const pdfBuffer = await renderToBuffer(<IndicativeTermsPDF terms={demo} />);
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="indicative-terms.pdf"',
    },
  });
}
