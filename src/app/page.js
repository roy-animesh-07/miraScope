"use client";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useState } from "react";
import OutputResult from "@/components/OutputResult";


export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [showData, setShowData] = useState(false);

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
  };

  return (
    <div className="min-h-screen flex flex-col">
  <Navbar />

  <main className="grow flex items-center justify-center">
    <div className="flex flex-col gap-4 p-6 bg-gray-100 rounded-lg shadow">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="border p-2 rounded bg-white"
      />

      <button
        onClick={handleUpload}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition"
      >
        Upload
      </button>

      {showData && result && (
        <OutputResult data={result} />
      )}
    </div>
  </main>

  <Footer />
</div>

  );
}
