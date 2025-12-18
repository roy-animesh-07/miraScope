"use client";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useState } from "react";
import OutputResult from "@/components/OutputResult";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [showData, setShowData] = useState(false);
  const { data: session } = useSession();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Upload a CSV first!");

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });
    const data = await res.json();

    const finalres = await fetch("/api/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const processed = await finalres.json();
    setShowData(true);
    setResult(processed);

    if (session) {
      await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processed),
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
    
            <div >
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Get Survey Reports
                <span className="text-green-600"> in Seconds</span>
              </h1>

              <ul className="mt-10 space-y-6">
                {[
                  {
                    title: "Upload & Auto-Understand Surveys",
                    desc:
                      "Drop a raw CSV and the system auto-separates text, ratings, and categorical columns.",
                  },
                  {
                    title: "Deep Text Feedback Analysis",
                    desc:
                      "Runs sentiment analysis and theme extraction to capture real user opinions.",
                  },
                  {
                    title: "Instant Quantitative Insights",
                    desc:
                      "Computes averages, medians, distributions, and trends with clean visuals.",
                  },
                  {
                    title: "AI-Generated Actionable Reports",
                    desc:
                      "Turns insights into prioritized recommendations and exports secure PDFs.",
                  },
                ].map((item, i) => (
                  <li key={i} className="relative pl-6">
                    <span className="absolute left-0 top-1 text-green-600">
                      →
                    </span>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 border rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-semibold mb-2">
                Upload your CSV
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Works with large survey files and mixed question types.
              </p>

              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-black file:text-white hover:file:bg-gray-900"
              />

              <button
                onClick={handleUpload}
                className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-900 transition"
              >
                <Link href={"#result"}>Generate Report</Link>
              </button>
            </div>
          </div>
        </section>

        <section
          id="result"
        >
          {showData && result && <div className="max-w-7xl mx-auto px-6 py-20"> <OutputResult data={result} /></div>}
          
        </section>
      </main>

      <Footer />
    </div>
  );
}
