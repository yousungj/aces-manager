'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";

type TemplateOption = {
  id: string;
  name: string;
  filePath: string;
};

const TEMPLATES: TemplateOption[] = [
  { id: "mega-super", name: "Mega Super", filePath: "/templates/aces/data/mega-super-ids.json" },
  { id: "sc-wo-ihr", name: "Seat Cover WO IHR", filePath: "/templates/aces/data/sc-wo-ihr-ids.json" },
  { id: "swc-15inch", name: "SWC 15 inch", filePath: "/templates/aces/data/swc-15inch-ids.json" },
  { id: "vc0", name: "Vehicle Cover Small", filePath: "/templates/aces/data/vc0-ids.json" },
  { id: "vc1", name: "Vehicle Cover Medium", filePath: "/templates/aces/data/vc1-ids.json" },
  { id: "vc2", name: "Vehicle Cover Large", filePath: "/templates/aces/data/vc2-ids.json" },
  { id: "vc3", name: "Vehicle Cover XL", filePath: "/templates/aces/data/vc3-ids.json" },
];

export default function TemplateEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption | null>(null);
  const [vehicleIds, setVehicleIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [newIdInput, setNewIdInput] = useState("");
  const [bulkIdInput, setBulkIdInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Load template data
  const loadTemplate = async (template: TemplateOption) => {
    setLoading(true);
    try {
      const response = await fetch(template.filePath);
      const data = await response.json();
      setVehicleIds(data.sort((a: number, b: number) => a - b));
      setSelectedTemplate(template);
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Failed to load template data');
    } finally {
      setLoading(false);
    }
  };

  // Add single vehicle ID
  const handleAddId = () => {
    const id = parseInt(newIdInput.trim());
    if (isNaN(id)) {
      alert('Please enter a valid number');
      return;
    }
    if (vehicleIds.includes(id)) {
      alert('This ID already exists');
      return;
    }
    setVehicleIds([...vehicleIds, id].sort((a, b) => a - b));
    setNewIdInput("");
  };

  // Add multiple IDs from bulk input
  const handleBulkAdd = () => {
    const lines = bulkIdInput.split(/[\n,]/).map(line => line.trim()).filter(Boolean);
    const newIds: number[] = [];
    
    for (const line of lines) {
      const id = parseInt(line);
      if (!isNaN(id) && !vehicleIds.includes(id)) {
        newIds.push(id);
      }
    }
    
    if (newIds.length === 0) {
      alert('No valid new IDs found');
      return;
    }
    
    setVehicleIds([...vehicleIds, ...newIds].sort((a, b) => a - b));
    setBulkIdInput("");
    alert(`Added ${newIds.length} new vehicle IDs`);
  };

  // Remove vehicle ID
  const handleRemoveId = (id: number) => {
    if (!confirm(`Remove vehicle ID ${id}?`)) return;
    setVehicleIds(vehicleIds.filter(vid => vid !== id));
  };

  // Download updated template
  const handleDownload = () => {
    if (!selectedTemplate) return;
    
    const jsonContent = JSON.stringify(vehicleIds, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate.id}-ids.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter IDs based on search
  const filteredIds = searchTerm 
    ? vehicleIds.filter(id => id.toString().includes(searchTerm))
    : vehicleIds;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent" style={{ letterSpacing: '-0.04em' }}>
              Template Editor
            </h1>
            <p className="text-gray-500 mt-2">Add or remove vehicle IDs from templates</p>
          </div>
          <Link href="/" className="apple-btn apple-btn-secondary px-6 py-3">
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Template Selection */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Select Template</h2>
              <div className="space-y-3">
                {TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => loadTemplate(template)}
                    className={`w-full text-left px-5 py-4 rounded-xl font-medium transition-all duration-200 ${
                      selectedTemplate?.id === template.id
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Editor */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="glass-card rounded-3xl p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading template...</p>
              </div>
            ) : selectedTemplate ? (
              <div className="space-y-6">
                {/* Header with stats */}
                <div className="glass-card rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-semibold text-gray-900">{selectedTemplate.name}</h2>
                      <p className="text-gray-500 mt-1">{vehicleIds.length} vehicle IDs</p>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="apple-btn apple-btn-primary px-6 py-3"
                    >
                      💾 Download Updated JSON
                    </button>
                  </div>

                  {/* Add Single ID */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Single Vehicle ID</label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        placeholder="Enter BaseVehicle ID"
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                        value={newIdInput}
                        onChange={e => setNewIdInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleAddId()}
                      />
                      <button
                        onClick={handleAddId}
                        className="apple-btn apple-btn-secondary px-6 py-3"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Bulk Add */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bulk Add (one per line or comma-separated)</label>
                    <textarea
                      className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 font-mono text-sm resize-none"
                      placeholder="123&#10;456&#10;789&#10;or: 123, 456, 789"
                      value={bulkIdInput}
                      onChange={e => setBulkIdInput(e.target.value)}
                    />
                    <button
                      onClick={handleBulkAdd}
                      className="mt-3 apple-btn apple-btn-secondary px-6 py-3"
                    >
                      Bulk Add
                    </button>
                  </div>
                </div>

                {/* Vehicle ID List */}
                <div className="glass-card rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900">Vehicle IDs</h3>
                    <input
                      type="text"
                      placeholder="Search IDs..."
                      className="px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 text-sm"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-96 overflow-y-auto">
                    {filteredIds.map(id => (
                      <div
                        key={id}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:border-red-300 transition-all group"
                      >
                        <span className="text-sm font-medium text-gray-700">{id}</span>
                        <button
                          onClick={() => handleRemoveId(id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs font-bold transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {filteredIds.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No vehicle IDs found</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-8 text-center">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a template</h3>
                <p className="text-gray-500">Choose a template from the left to start editing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
