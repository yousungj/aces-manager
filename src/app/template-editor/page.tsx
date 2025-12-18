'use client';

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";

type TemplateOption = {
  id: string;
  name: string;
  filePath: string;
};

type BaseVehicle = {
  BaseVehicleID: number;
  YearID: number;
  MakeID: number;
  ModelID: number;
};

type Make = {
  MakeID: number;
  MakeName: string;
};

type Model = {
  ModelID: number;
  ModelName: string;
};

type VehicleInfo = {
  id: number;
  make: string;
  model: string;
  year: number;
};

const TEMPLATES: TemplateOption[] = [
  { id: "mega-super", name: "Mega Super", filePath: "/data/mega-super-ids.json" },
  { id: "sc-wo-ihr", name: "Seat Cover WO IHR", filePath: "/data/sc-wo-ihr-ids.json" },
  { id: "swc-15inch", name: "SWC 15 inch", filePath: "/data/swc-15inch-ids.json" },
  { id: "vc0", name: "Vehicle Cover Small", filePath: "/data/vc0-ids.json" },
  { id: "vc1", name: "Vehicle Cover Medium", filePath: "/data/vc1-ids.json" },
  { id: "vc2", name: "Vehicle Cover Large", filePath: "/data/vc2-ids.json" },
  { id: "vc3", name: "Vehicle Cover XL", filePath: "/data/vc3-ids.json" },
];

export default function TemplateEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption | null>(null);
  const [vehicleIds, setVehicleIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulkIdInput, setBulkIdInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Vehicle data
  const [baseVehicles, setBaseVehicles] = useState<BaseVehicle[]>([]);
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [vehicleDataLoading, setVehicleDataLoading] = useState(true);
  
  // Vehicle selection
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  // Load vehicle data on mount
  useEffect(() => {
    const loadVehicleData = async () => {
      try {
        const [baseVehiclesRes, makesRes, modelsRes] = await Promise.all([
          fetch('/data/BaseVehicle.json'),
          fetch('/data/Make.json'),
          fetch('/data/Model.json')
        ]);
        
        const baseVehiclesData = await baseVehiclesRes.json();
        const makesData = await makesRes.json();
        const modelsData = await modelsRes.json();
        
        setBaseVehicles(baseVehiclesData);
        setMakes(makesData);
        setModels(modelsData);
      } catch (error) {
        console.error('Error loading vehicle data:', error);
        alert('Failed to load vehicle database');
      } finally {
        setVehicleDataLoading(false);
      }
    };
    loadVehicleData();
  }, []);

  // Create vehicle lookup map
  const vehicleLookup = useMemo(() => {
    const map = new Map<number, VehicleInfo>();
    const makeMap = new Map(makes.map(m => [m.MakeID, m.MakeName]));
    const modelMap = new Map(models.map(m => [m.ModelID, m.ModelName]));
    
    baseVehicles.forEach(bv => {
      map.set(bv.BaseVehicleID, {
        id: bv.BaseVehicleID,
        make: makeMap.get(bv.MakeID) || 'Unknown',
        model: modelMap.get(bv.ModelID) || 'Unknown',
        year: bv.YearID
      });
    });
    
    return map;
  }, [baseVehicles, makes, models]);

  // Get unique makes sorted
  const uniqueMakes = useMemo(() => {
    return makes
      .map(m => m.MakeName)
      .sort((a, b) => a.localeCompare(b));
  }, [makes]);

  // Get models for selected make
  const modelsForMake = useMemo(() => {
    if (!selectedMake) return [];
    
    const makeId = makes.find(m => m.MakeName === selectedMake)?.MakeID;
    if (!makeId) return [];
    
    const modelIds = new Set(
      baseVehicles
        .filter(bv => bv.MakeID === makeId)
        .map(bv => bv.ModelID)
    );
    
    return models
      .filter(m => modelIds.has(m.ModelID))
      .map(m => m.ModelName)
      .sort((a, b) => a.localeCompare(b));
  }, [selectedMake, makes, models, baseVehicles]);

  // Get years for selected make + model
  const yearsForMakeModel = useMemo(() => {
    if (!selectedMake || !selectedModel) return [];
    
    const makeId = makes.find(m => m.MakeName === selectedMake)?.MakeID;
    const modelId = models.find(m => m.ModelName === selectedModel)?.ModelID;
    
    if (!makeId || !modelId) return [];
    
    const years = baseVehicles
      .filter(bv => bv.MakeID === makeId && bv.ModelID === modelId)
      .map(bv => ({ year: bv.YearID, id: bv.BaseVehicleID }));
    
    return years.sort((a, b) => b.year - a.year);
  }, [selectedMake, selectedModel, makes, models, baseVehicles]);

  // Load template data
  const loadTemplate = async (template: TemplateOption) => {
    setLoading(true);
    try {
      const response = await fetch(template.filePath);
      const data = await response.json();
      // Convert strings to numbers and sort
      const ids = data.map((id: string | number) => typeof id === 'string' ? parseInt(id) : id);
      setVehicleIds(ids.sort((a: number, b: number) => a - b));
      setSelectedTemplate(template);
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Failed to load template data');
    } finally {
      setLoading(false);
    }
  };

  // Add vehicles from selection
  const handleAddFromSelection = () => {
    if (selectedYears.length === 0) {
      alert('Please select at least one year');
      return;
    }
    
    const newIds = selectedYears.filter(id => !vehicleIds.includes(id));
    if (newIds.length === 0) {
      alert('All selected vehicles already exist in template');
      return;
    }
    
    setVehicleIds([...vehicleIds, ...newIds].sort((a, b) => a - b));
    setSelectedYears([]);
    alert(`Added ${newIds.length} vehicles`);
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
    if (!confirm(`Remove this vehicle?`)) return;
    setVehicleIds(vehicleIds.filter(vid => vid !== id));
  };

  // Download updated template JSON
  const handleDownloadJson = () => {
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

  // Generate and download ACES XML
  const handleGenerateXml = () => {
    if (!selectedTemplate) return;
    
    if (vehicleIds.length === 0) {
      alert('No vehicles in this template. Please add vehicles first.');
      return;
    }

    // Build XML directly using current vehicle IDs
    const currentDate = new Date().toISOString().split('T')[0];
    const brandAaiaId = 'GFLT';
    const partTypeId = '1316';
    const partNumber = selectedTemplate.id;

    const header = `<?xml version="1.0" encoding="utf-8"?>
<ACES version="3.2">
  <Header>
    <Company>BDK Auto</Company>
    <SenderName>BDK User</SenderName>
    <SenderPhone>000-000-0000</SenderPhone>
    <TransferDate>${currentDate}</TransferDate>
    <BrandAAIAID>${brandAaiaId}</BrandAAIAID>
    <DocumentTitle>${partNumber}</DocumentTitle>
    <EffectiveDate>${currentDate}</EffectiveDate>
    <ApprovedFor>US</ApprovedFor>
    <SubmissionType>FULL</SubmissionType>
    <VcdbVersionDate>2022-06-24</VcdbVersionDate>
    <QdbVersionDate>2015-05-26</QdbVersionDate>
    <PcdbVersionDate>2022-07-08</PcdbVersionDate>
  </Header>
  <Apps>`;

    const apps = vehicleIds.map((baseVehicleId, index) => {
      return `    <App action="A" id="${index + 1}">
      <BaseVehicle id="${baseVehicleId}" />
      <Note />
      <Qty>1</Qty>
      <PartType id="${partTypeId}" />
      <Part>${partNumber}</Part>
    </App>`;
    }).join('\n');

    const footer = `\n  </Apps>\n</ACES>`;
    const xmlContent = header + '\n' + apps + footer;

    try {
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate.id}-${currentDate}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating XML:', error);
      alert('Failed to generate XML');
    }
  };

  // Get vehicle info with search
  const vehiclesWithInfo = useMemo(() => {
    return vehicleIds
      .map(id => vehicleLookup.get(id))
      .filter((v): v is VehicleInfo => v !== undefined)
      .filter(v => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          v.make.toLowerCase().includes(term) ||
          v.model.toLowerCase().includes(term) ||
          v.year.toString().includes(term) ||
          v.id.toString().includes(term)
        );
      });
  }, [vehicleIds, vehicleLookup, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent" style={{ letterSpacing: '-0.04em' }}>
              Template Editor
            </h1>
            <p className="text-gray-500 mt-2">Add or remove vehicles from templates</p>
          </div>
          <Link href="/" className="apple-btn apple-btn-secondary px-6 py-3">
            ← Back to Home
          </Link>
        </div>

        {vehicleDataLoading ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading vehicle database...</p>
          </div>
        ) : (
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
                        <p className="text-gray-500 mt-1">{vehicleIds.length} vehicles</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleDownloadJson}
                          className="apple-btn apple-btn-secondary px-6 py-3"
                        >
                          💾 Save JSON
                        </button>
                        <button
                          onClick={handleGenerateXml}
                          className="apple-btn apple-btn-primary px-6 py-3"
                        >
                          📄 Generate XML
                        </button>
                      </div>
                    </div>

                    {/* Vehicle Selector */}
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">Add Vehicle by Selection</label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                          className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                          value={selectedMake}
                          onChange={e => {
                            setSelectedMake(e.target.value);
                            setSelectedModel("");
                            setSelectedYears([]);
                          }}
                        >
                          <option value="">Select Make</option>
                          {uniqueMakes.map(make => (
                            <option key={make} value={make}>{make}</option>
                          ))}
                        </select>

                        <select
                          className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                          value={selectedModel}
                          onChange={e => {
                            setSelectedModel(e.target.value);
                            setSelectedYears([]);
                          }}
                          disabled={!selectedMake}
                        >
                          <option value="">Select Model</option>
                          {modelsForMake.map(model => (
                            <option key={model} value={model}>{model}</option>
                          ))}
                        </select>
                      </div>

                      {yearsForMakeModel.length > 0 && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <p className="text-sm font-medium text-gray-700 mb-3">Select Years:</p>
                          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                            {yearsForMakeModel.map(({ year, id }) => {
                              const isAlreadyAdded = vehicleIds.includes(id);
                              return (
                                <label
                                  key={id}
                                  className={`flex items-center justify-center px-3 py-2 rounded-lg transition-all ${
                                    isAlreadyAdded
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : selectedYears.includes(id)
                                      ? 'bg-blue-500 text-white cursor-pointer'
                                      : 'bg-white text-gray-700 hover:bg-gray-100 cursor-pointer'
                                  } border border-gray-200`}
                                >
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={selectedYears.includes(id)}
                                    disabled={isAlreadyAdded}
                                    onChange={e => {
                                      if (e.target.checked) {
                                        setSelectedYears([...selectedYears, id]);
                                      } else {
                                        setSelectedYears(selectedYears.filter(y => y !== id));
                                      }
                                    }}
                                  />
                                  <span className="text-sm font-medium">{year}</span>
                                </label>
                              );
                            })}
                          </div>
                          <button
                            onClick={handleAddFromSelection}
                            className="mt-4 w-full apple-btn apple-btn-primary px-6 py-3"
                            disabled={selectedYears.length === 0}
                          >
                            Add Selected ({selectedYears.length})
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bulk Add */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bulk Add by ID (one per line or comma-separated)</label>
                      <textarea
                        className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 font-mono text-sm resize-none"
                        placeholder="123, 456, 789"
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

                  {/* Vehicle List */}
                  <div className="glass-card rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-semibold text-gray-900">Vehicles in Template</h3>
                      <input
                        type="text"
                        placeholder="Search make, model, year..."
                        className="px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 text-sm w-64"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {vehiclesWithInfo.map(vehicle => (
                        <div
                          key={vehicle.id}
                          className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 hover:border-red-300 transition-all group"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-xs text-gray-500">ID: {vehicle.id}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveId(vehicle.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 font-bold transition-opacity px-3 py-1 rounded-lg hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    {vehiclesWithInfo.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        {searchTerm ? 'No vehicles found matching your search' : 'No vehicles in this template'}
                      </p>
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
        )}
      </div>
    </div>
  );
}
