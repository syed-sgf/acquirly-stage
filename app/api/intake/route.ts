import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Deal intake received:", body);
    
    return NextResponse.json({
      success: true,
      message: "Deal information received successfully",
      id: `deal_${Date.now()}`
    }, { status: 200 });
  } catch (error) {
    console.error("Error processing intake:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to process deal information"
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/intake",
    method: "POST",
    description: "Submit deal information for analysis"
  });
}
