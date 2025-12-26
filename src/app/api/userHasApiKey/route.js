import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const result = Boolean(user.apikey?.content);

    return NextResponse.json({hasKey:result});
  } catch (err) {
    console.error("GET User error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
