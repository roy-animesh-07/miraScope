import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import User from "@/models/User";
import { encrypt } from "@/lib/crypto";

export async function POST(req) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    if (!data) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    user.apikey = encrypt(data.apiKey);
    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
