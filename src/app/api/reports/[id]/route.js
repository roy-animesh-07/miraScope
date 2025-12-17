import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Report from "@/models/Report";
import { getServerSession } from "next-auth";
import User from "@/models/User";

export async function GET(req,context) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const { id } = await context.params;
    const user = await User.findOne({email:session.user.email});

    const report = await Report.findOne({
      _id: id,
      user:user._id
    });
    

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(report);

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
