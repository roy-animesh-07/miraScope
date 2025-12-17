"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      try{
        fetch("/api/reports")
        .then((res) => res.json())
        .then((data) => {
          setReports(data);
          setLoading(false);
        });
      }
      catch(err) {
        console.log(err)
      }
      
    }
  }, [status]);

  if (status === "loading" || loading) {
    return <div>Loading...</div>;
  }
  const handleView = (id) => {
    router.push(`/view/${id}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="grow px-6 py-10">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-lg mb-6">Welcome, {session.user.name}!</p>
        {reports.length === 0 ? (
          <p className="text-gray-500">No reports saved yet.</p>
        ) : (
          <div className="grid gap-4">
            {reports.map((r) => (
              <div
                key={r._id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm
             hover:shadow-md transition-shadow flex flex-col gap-2"
              >
                <p className="text-lg font-bold text-gray-500 truncate">
                   {r.report?.fileName ?? "Untitled Report"}
                </p>

                <p className="text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleString()}
                </p>

                <p className="text-sm font-medium text-gray-700">
                  {r.report.questions.length} questions analyzed
                </p>

                <button
                  className="mt-3 self-start rounded-lg bg-black px-4 py-1.5
               text-sm text-white hover:bg-gray-800 transition"
               onClick={() => handleView(r._id)}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
