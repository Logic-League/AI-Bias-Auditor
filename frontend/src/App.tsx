import React, { useState } from "react";
import { generateBiasAudit } from "./services/geminiService";
import Dashboard from "./components/Dashboard";
import Loader from "./components/Loader";

export default function App() {
  const [selectedDataset, setSelectedDataset] = useState("");
  const [customDataset, setCustomDataset] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState<Set<string>>(new Set());
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleToggle = (attr: string) => {
    setSelectedAttributes(prev => {
      const copy = new Set(prev);
      copy.has(attr) ? copy.delete(attr) : copy.add(attr);
      return copy;
    });
  };

  const handleRunAnalysis = async () => {
    if (!selectedDataset && !customDataset) return setError("Select or enter a dataset.");
    if (selectedAttributes.size === 0) return setError("Select at least one attribute.");

    setIsLoading(true);
    setError("");

    const data = await generateBiasAudit(
      customDataset || selectedDataset,
      Array.from(selectedAttributes)
    );
    setAnalysisResult(data);
    setIsLoading(false);
  };

  if (isLoading) return <Loader />;
  if (analysisResult) return <Dashboard result={analysisResult} />;

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">AI Bias Auditor</h1>
      {error && <p className="text-red-500">{error}</p>}
      <select
        value={selectedDataset}
        onChange={e => setSelectedDataset(e.target.value)}
        className="border p-2 mb-3 w-full"
      >
        <option value="">-- Choose a Dataset --</option>
        <option value="Loan Model">Loan Model</option>
        <option value="Hiring Model">Hiring Model</option>
        <option value="Custom">Custom Input</option>
      </select>
      {selectedDataset === "Custom" && (
        <textarea
          className="border p-2 w-full mb-3"
          rows={3}
          placeholder="Describe your dataset..."
          value={customDataset}
          onChange={e => setCustomDataset(e.target.value)}
        />
      )}
      <div className="flex flex-col mb-3">
        {["Gender", "Race", "Age", "Region"].map(a => (
          <label key={a} className="flex items-center">
            <input type="checkbox" className="mr-2" onChange={() => handleToggle(a)} />
            {a}
          </label>
        ))}
      </div>
      <button
        onClick={handleRunAnalysis}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Run Bias Analysis
      </button>
    </div>
  );
}
