"use client";
import OutputResult from "@/components/OutputResult";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";

export default function ViewReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/reports/${id}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        if (res.status === 401) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setReport(data);
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return <div className="p-6">Loading report...</div>;
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-2">Report not found</h1>
        <p className="text-gray-500 mb-4">
          This report doesn’t exist or you don’t have access.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <OutputResult data={report.report} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
