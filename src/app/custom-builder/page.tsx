'use client';

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import type { Make, Model, BaseVehicle, VehicleData } from "../../lib/vehicle-data";
import { processVehicleData, searchVehicles } from "../../lib/vehicle-data";

const BRAND_OPTIONS = [
  { code: "DGQS", name: "Motor Trend" },
  { code: "JZXV", name: "CAT" },
  { code: "GFLT", name: "BDK" },
  { code: "JZBF", name: "Motor Box" },
  { code: "JNLD", name: "Carbella" },
];

const PART_TYPE_OPTIONS = [
  { name: "Car cover", id: "1020" },
  { name: "Tonneau Cover", id: "1188" },
  { name: "SWC", id: "57008" },
  { name: "Trunk Mat", id: "47593" },
  { name: "Tailgate mat", id: "16121" },
  { name: "Mat", id: "1300" },
  { name: "Seat Cover", id: "1316" },
  { name: "Trunk Organizer", id: "14290" },
  { name: "Wiper Blade", id: "8852" },
  { name: "Windshield Snow Cover", id: "71066" },
];

type SelectedVehicle = {
  vehicle: VehicleData;
  selectedYears: number[];
  allYears: boolean;
};

export default function CustomBuilder() {
  const [partNumber, setPartNumber] = useState("");
  const [brandCode, setBrandCode] = useState("GFLT");
  const [partTypeId, setPartTypeId] = useState("1300");
  
  // Vehicle data loading
  const [vehicleData, setVehicleData] = useState<Map<string, VehicleData[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedVehicles, setSelectedVehicles] = useState<SelectedVehicle[]>([]);
  const [currentVehicle, setCurrentVehicle] = useState<VehicleData | null>(null);
  const [yearSelection, setYearSelection] = useState<number[]>([]);
  const [allYearsMode, setAllYearsMode] = useState(true);

  // Load vehicle data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [makesRes, modelsRes, baseVehiclesRes] = await Promise.all([
          fetch('/data/Make.json'),
          fetch('/data/Model.json'),
          fetch('/data/BaseVehicle.json')
        ]);

        const makes: Make[] = await makesRes.json();
        const models: Model[] = await modelsRes.json();
        const baseVehicles: BaseVehicle[] = await baseVehiclesRes.json();

        const processed = processVehicleData(makes, models, baseVehicles);
        setVehicleData(processed);
        setLoading(false);
      } catch (error) {
        console.error('Error loading vehicle data:', error);
        alert('Failed to load vehicle data. Please refresh the page.');
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter vehicles based on search
  const filteredVehicles = useMemo(() => {
    if (!searchTerm) {
      // Return all vehicles grouped by make
      const all: VehicleData[] = [];
      vehicleData.forEach(vehicles => all.push(...vehicles));
      return all;
    }
    return searchVehicles(vehicleData, searchTerm);
  }, [vehicleData, searchTerm]);

  // Get unique makes for dropdown
  const makes = useMemo(() => {
    return Array.from(vehicleData.keys()).sort();
  }, [vehicleData]);

  const handleAddVehicle = () => {
    if (!currentVehicle) {
      alert("Please select a vehicle first!");
      return;
    }

    const yearsToAdd = allYearsMode 
      ? currentVehicle.years.map(y => y.year)
      : yearSelection;
    
    if (yearsToAdd.length === 0) {
      alert("Please select at least one year!");
      return;
    }

    setSelectedVehicles([...selectedVehicles, {
      vehicle: currentVehicle,
      selectedYears: yearsToAdd,
      allYears: allYearsMode
    }]);

    // Reset
    setCurrentVehicle(null);
    setYearSelection([]);
    setAllYearsMode(true);
    setSearchTerm("");
  };

  const handleRemoveVehicle = (index: number) => {
    setSelectedVehicles(selectedVehicles.filter((_, i) => i !== index));
  };

  const toggleYear = (year: number) => {
    if (yearSelection.includes(year)) {
      setYearSelection(yearSelection.filter(y => y !== year));
    } else {
      setYearSelection([...yearSelection, year]);
    }
  };

  const handleGenerate = () => {
    if (!partNumber) {
      alert("Please enter a part number!");
      return;
    }

    if (selectedVehicles.length === 0) {
      alert("Please add at least one vehicle!");
      return;
    }

    // Build XML
    const currentDate = new Date().toISOString().split('T')[0];
    const header = `<?xml version="1.0" encoding="utf-8"?>
<ACES version="3.0">
  <Header>
    <Company>BDK Auto</Company>
    <SenderName>BDK User</SenderName>
    <SenderPhone>000-000-0000</SenderPhone>
    <TransferDate>${currentDate}</TransferDate>
    <BrandAAIAID>${brandCode}</BrandAAIAID>
    <DocumentTitle>${partNumber}</DocumentTitle>
    <EffectiveDate>${currentDate}</EffectiveDate>
    <ApprovedFor>US</ApprovedFor>
    <SubmissionType>FULL</SubmissionType>
    <VcdbVersionDate>2022-06-24</VcdbVersionDate>
    <QdbVersionDate>2015-05-26</QdbVersionDate>
    <PcdbVersionDate>2022-07-08</PcdbVersionDate>
  </Header>`;

    let appId = 1;
    const apps: string[] = [];

    selectedVehicles.forEach(sv => {
      sv.selectedYears.forEach(selectedYear => {
        const yearData = sv.vehicle.years.find(y => y.year === selectedYear);
        const baseVehicleId = yearData?.baseVehicleId.toString() || "0";
        apps.push(`  <App action="A" id="${appId}">
    <BaseVehicle id="${baseVehicleId}" /><Note></Note>
    <Qty>1</Qty>
    <PartType id="${partTypeId}" />
    <Part>${partNumber}</Part>
  </App>`);
        appId++;
      });
    });

    const xmlContent = `${header}\n${apps.join('\n')}\n</ACES>`;

    // Download
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aces-custom-${partNumber}-${currentDate}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent" style={{ letterSpacing: '-0.04em' }}>Custom Builder</h1>
            <p className="text-gray-500 mt-2">Select vehicles and generate custom ACES XML</p>
          </div>
          <Link href="/" className="apple-btn apple-btn-secondary px-6 py-3">
            ← Back to Templates
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Part Information */}
          <div className="glass-card rounded-3xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Part Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Part Number</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                  placeholder="Enter part number"
                  value={partNumber}
                  onChange={e => setPartNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                  value={brandCode}
                  onChange={e => setBrandCode(e.target.value)}
                >
                  {BRAND_OPTIONS.map(b => (
                    <option key={b.code} value={b.code}>{b.code} - {b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Part Type</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                  value={partTypeId}
                  onChange={e => setPartTypeId(e.target.value)}
                >
                  {PART_TYPE_OPTIONS.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Vehicles Summary */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Vehicles ({selectedVehicles.length})</h3>
              {selectedVehicles.length === 0 ? (
                <p className="text-gray-500 text-sm">No vehicles selected yet</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedVehicles.map((sv, index) => (
                    <div key={index} className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{sv.vehicle.make} {sv.vehicle.model}</p>
                        <p className="text-sm text-gray-600">
                          {sv.allYears ? `All years (${sv.selectedYears.length})` : `${sv.selectedYears.length} year(s): ${sv.selectedYears.join(', ')}`}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleRemoveVehicle(index)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={handleGenerate}
              className="w-full apple-btn apple-btn-primary px-6 py-4 mt-8 text-lg"
              disabled={selectedVehicles.length === 0 || !partNumber}
            >
              Generate XML ({selectedVehicles.reduce((sum, sv) => sum + sv.selectedYears.length, 0)} vehicles)
            </button>
          </div>

          {/* Right: Vehicle Selection */}
          <div className="glass-card rounded-3xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Add Vehicles</h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading vehicle data...</p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search Vehicles</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                      placeholder="Search by make or model..."
                      value={searchTerm}
                      onChange={e => {
                        setSearchTerm(e.target.value);
                        setCurrentVehicle(null);
                      }}
                    />
                  </div>

                  {/* Vehicle Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Vehicle {searchTerm && `(${filteredVehicles.length} results)`}
                    </label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                      value={currentVehicle ? `${currentVehicle.make}-${currentVehicle.model}` : ""}
                      onChange={e => {
                        const [make, model] = e.target.value.split('-');
                        const vehicles = vehicleData.get(make);
                        const vehicle = vehicles?.find(v => v.model === model);
                        setCurrentVehicle(vehicle || null);
                        setYearSelection([]);
                      }}
                      disabled={filteredVehicles.length === 0}
                    >
                      <option value="">Choose a vehicle...</option>
                      {filteredVehicles.map(v => (
                        <option key={`${v.make}-${v.model}`} value={`${v.make}-${v.model}`}>
                          {v.make} {v.model} ({v.years.length} years)
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentVehicle && (
                    <>
                      {/* Year Selection Mode */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Year Selection</label>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setAllYearsMode(true)}
                            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                              allYearsMode 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            All Years
                          </button>
                          <button
                            onClick={() => setAllYearsMode(false)}
                            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                              !allYearsMode 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Select Years
                          </button>
                        </div>
                      </div>

                      {/* Year Grid (only show if not all years mode) */}
                      {!allYearsMode && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Available Years for {currentVehicle.make} {currentVehicle.model}
                          </label>
                          <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                            {currentVehicle.years.map(yearData => (
                              <button
                                key={yearData.year}
                                onClick={() => toggleYear(yearData.year)}
                                className={`px-3 py-2 rounded-lg font-medium transition-all ${
                                  yearSelection.includes(yearData.year)
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {yearData.year}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleAddVehicle}
                        className="w-full apple-btn apple-btn-secondary px-6 py-3"
                      >
                        Add Vehicle
                      </button>
                    </>
                  )}
                </div>

                {/* Info Box */}
                <div className="mt-8 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
                  <p className="text-sm text-green-800">
                    <strong>✓ Real VCDB Data:</strong> {makes.length} makes, {Array.from(vehicleData.values()).reduce((sum, models) => sum + models.length, 0)} models loaded
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
