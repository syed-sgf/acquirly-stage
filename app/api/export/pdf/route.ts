import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import IndicativeTermsPDF, { Terms } from "@/app/pdfs/IndicativeTermsPDF";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const terms: Terms = body.terms;

    // Validate the terms data
    if (!terms || !terms.borrower || !terms.business) {
      return NextResponse.json(
        { error: "Invalid terms data provided" },
        { status: 400 }
      );
    }

    // Render the PDF component to a buffer
    const pdfBuffer = await renderToBuffer(<IndicativeTermsPDF terms={terms} />);

    // Return the PDF as a downloadable file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="indicative-terms-${terms.business.replace(/\s+/g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for testing
export async function GET() {
  return NextResponse.json({
    message: "PDF Export API",
    method: "POST",
    body: {
      terms: {
        borrower: "string",
        business: "string",
        program: "SBA7a | SBA504 | Conventional",
        loanAmount: "number",
        rateNote: "string",
        termYears: "number",
        // ... other fields
      },
    },
  });
}
