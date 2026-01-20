'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

type Make = {
  MakeID: number;
  MakeName: string;
};

type Model = {
  ModelID: number;
  ModelName: string;
  VehicleTypeID: number;
};

type SubModel = {
  SubModelID: number;
  SubModelName: string;
};

type BaseVehicle = {
  BaseVehicleID: number;
  YearID: number;
  MakeID: number;
  ModelID: number;
};

type Vehicle = {
  VehicleID: number;
  BaseVehicleID: number;
  SubModelID: number;
};

export default function VehicleLookup() {
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [subModels, setSubModels] = useState<SubModel[]>([]);
  const [baseVehicles, setBaseVehicles] = useState<BaseVehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedSubModel, setSelectedSubModel] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<BaseVehicle[]>([]);

  // Load all data files
  useEffect(() => {
    const loadData = async () => {
      try {
        const [makesRes, modelsRes, subModelsRes, baseVehiclesRes] = await Promise.all([
          fetch('/data/Make.json').then(r => r.json()),
          fetch('/data/Model.json').then(r => r.json()),
          fetch('/data/SubModel.json').then(r => r.json()),
          fetch('/data/BaseVehicle.json').then(r => r.json()),
        ]);
        
        setMakes(makesRes);
        setModels(modelsRes);
        setSubModels(subModelsRes);
        setBaseVehicles(baseVehiclesRes);
        
        // Try to load Vehicle.json if it exists
        try {
          const vehiclesRes = await fetch('/data/Vehicle.json').then(r => r.json());
          setVehicles(vehiclesRes);
        } catch (error) {
          console.log('Vehicle.json not found - SubModel filtering unavailable');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load vehicle data:', error);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Get unique years from baseVehicles
  const availableYears = useMemo(() => {
    const years = new Set(baseVehicles.map(v => v.YearID));
    return Array.from(years).sort((a, b) => b - a);
  }, [baseVehicles]);

  // Filter makes based on selected year
  const availableMakes = useMemo(() => {
    if (!selectedYear) return makes;
    
    const makeIds = new Set(
      baseVehicles
        .filter(v => v.YearID === parseInt(selectedYear))
        .map(v => v.MakeID)
    );
    
    return makes.filter(m => makeIds.has(m.MakeID)).sort((a, b) => a.MakeName.localeCompare(b.MakeName));
  }, [selectedYear, makes, baseVehicles]);

  // Filter models based on selected year and make
  const availableModels = useMemo(() => {
    if (!selectedYear || !selectedMake) return [];
    
    const modelIds = new Set(
      baseVehicles
        .filter(v => v.YearID === parseInt(selectedYear) && v.MakeID === parseInt(selectedMake))
        .map(v => v.ModelID)
    );
    
    return models.filter(m => modelIds.has(m.ModelID)).sort((a, b) => a.ModelName.localeCompare(b.ModelName));
  }, [selectedYear, selectedMake, models, baseVehicles]);

  // Filter subModels based on selected year, make, and model
  const availableSubModels = useMemo(() => {
    if (!vehicles.length || !selectedYear || !selectedMake || !selectedModel) {
      // If no Vehicle.json, show limited list as reference
      return subModels.slice(0, 100);
    }
    
    // Get all base vehicle IDs for the selected year/make/model
    const baseVehicleIds = new Set(
      baseVehicles
        .filter(v => 
          v.YearID === parseInt(selectedYear) &&
          v.MakeID === parseInt(selectedMake) &&
          v.ModelID === parseInt(selectedModel)
        )
        .map(v => v.BaseVehicleID)
    );
    
    // Get submodel IDs that match these base vehicle IDs
    const subModelIds = new Set(
      vehicles
        .filter(v => baseVehicleIds.has(v.BaseVehicleID))
        .map(v => v.SubModelID)
    );
    
    return subModels.filter(s => subModelIds.has(s.SubModelID)).sort((a, b) => a.SubModelName.localeCompare(b.SubModelName));
  }, [selectedYear, selectedMake, selectedModel, vehicles, baseVehicles, subModels]);

  // Get base vehicle ID when all selections are made
  const baseVehicleResult = useMemo(() => {
    if (!selectedYear || !selectedMake || !selectedModel) return null;
    
    const result = baseVehicles.find(v => 
      v.YearID === parseInt(selectedYear) &&
      v.MakeID === parseInt(selectedMake) &&
      v.ModelID === parseInt(selectedModel)
    );
    
    return result || null;
  }, [selectedYear, selectedMake, selectedModel, baseVehicles]);

  // Get selected names for display
  const selectedMakeName = makes.find(m => m.MakeID === parseInt(selectedMake))?.MakeName || '';
  const selectedModelName = models.find(m => m.ModelID === parseInt(selectedModel))?.ModelName || '';
  const selectedSubModelName = subModels.find(s => s.SubModelID === parseInt(selectedSubModel))?.SubModelName || '';

  const handleSearch = () => {
    if (!selectedYear || !selectedMake || !selectedModel) {
      alert('Please select at least Year, Make, and Model');
      return;
    }
    
    const results = baseVehicles.filter(v => 
      v.YearID === parseInt(selectedYear) &&
      v.MakeID === parseInt(selectedMake) &&
      v.ModelID === parseInt(selectedModel)
    );
    
    setSearchResults(results);
  };

  const handleReset = () => {
    setSelectedYear('');
    setSelectedMake('');
    setSelectedModel('');
    setSelectedSubModel('');
    setSearchResults([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicle data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-6xl font-bold text-center mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent" style={{ letterSpacing: '-0.04em' }}>
              Vehicle ID Lookup
            </h1>
            <p className="text-center text-gray-500 text-lg">
              Find base vehicle IDs by year, make, model, and submodel
            </p>
          </div>
          <Link 
            href="/" 
            className="apple-btn apple-btn-secondary px-6 py-3 whitespace-nowrap"
          >
            ← Back to Main
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Search Form */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-3xl p-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6" style={{ letterSpacing: '-0.03em' }}>
                Vehicle Selection
              </h2>

              <div className="space-y-6">
                {/* Year Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setSelectedMake('');
                      setSelectedModel('');
                      setSelectedSubModel('');
                      setSearchResults([]);
                    }}
                  >
                    <option value="">Select Year</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Make Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Make <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                    value={selectedMake}
                    onChange={(e) => {
                      setSelectedMake(e.target.value);
                      setSelectedModel('');
                      setSelectedSubModel('');
                      setSearchResults([]);
                    }}
                    disabled={!selectedYear}
                  >
                    <option value="">Select Make</option>
                    {availableMakes.map(make => (
                      <option key={make.MakeID} value={make.MakeID}>
                        {make.MakeName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                    value={selectedModel}
                    onChange={(e) => {
                      setSelectedModel(e.target.value);
                      setSelectedSubModel('');
                      setSearchResults([]);
                    }}
                    disabled={!selectedMake}
                  >
                    <option value="">Select Model</option>
                    {availableModels.map(model => (
                      <option key={model.ModelID} value={model.ModelID}>
                        {model.ModelName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SubModel Selection (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SubModel {vehicles.length > 0 ? '' : '(Reference Only)'}
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                    value={selectedSubModel}
                    onChange={(e) => setSelectedSubModel(e.target.value)}
                    disabled={!selectedModel}
                  >
                    <option value="">
                      {vehicles.length > 0 ? 'Select SubModel' : 'Select SubModel (Reference - Limited to 100)'}
                    </option>
                    {availableSubModels.map(subModel => (
                      <option key={subModel.SubModelID} value={subModel.SubModelID}>
                        {subModel.SubModelName}
                      </option>
                    ))}
                  </select>
                  {vehicles.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 mt-2">
                      <p className="text-xs text-yellow-800">
                        ⚠️ <strong>Vehicle.json not found:</strong> Upload Vehicle.json to /public/data/ for accurate SubModel filtering and truck attributes (Cab Size, Bed Length, Body Type, etc.)
                      </p>
                    </div>
                  )}
                  {vehicles.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">
                      ✓ Showing {availableSubModels.length} SubModel(s) available for this vehicle
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSearch}
                    className="flex-1 apple-btn apple-btn-primary px-6 py-3.5"
                    disabled={!selectedYear || !selectedMake || !selectedModel}
                  >
                    🔍 Search Vehicle ID
                  </button>
                  <button
                    onClick={handleReset}
                    className="apple-btn apple-btn-secondary px-6 py-3.5"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Current Selection Display */}
              {(selectedYear || selectedMake || selectedModel) && (
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
                  <p className="text-sm font-medium text-blue-900 mb-2">Current Selection:</p>
                  <p className="text-sm text-blue-800">
                    {selectedYear && `${selectedYear} `}
                    {selectedMakeName && `${selectedMakeName} `}
                    {selectedModelName && `${selectedModelName} `}
                    {selectedSubModelName && `(${selectedSubModelName})`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Results Panel */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4" style={{ letterSpacing: '-0.02em' }}>
                Results
              </h3>

              {baseVehicleResult ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-green-900">Base Vehicle ID</span>
                      <button
                        onClick={() => copyToClipboard(baseVehicleResult.BaseVehicleID.toString())}
                        className="text-xs px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-4xl font-bold text-green-600">
                      {baseVehicleResult.BaseVehicleID}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year:</span>
                      <span className="font-medium text-gray-900">{baseVehicleResult.YearID}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Make ID:</span>
                      <span className="font-medium text-gray-900">{baseVehicleResult.MakeID}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model ID:</span>
                      <span className="font-medium text-gray-900">{baseVehicleResult.ModelID}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Make:</span>
                      <span className="font-medium text-gray-900">{selectedMakeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium text-gray-900">{selectedModelName}</span>
                    </div>
                    {selectedSubModelName && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">SubModel:</span>
                        <span className="font-medium text-gray-900">{selectedSubModelName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-3">
                    Found {searchResults.length} vehicle{searchResults.length > 1 ? 's' : ''}:
                  </p>
                  {searchResults.map((vehicle, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">
                          ID: {vehicle.BaseVehicleID}
                        </span>
                        <button
                          onClick={() => copyToClipboard(vehicle.BaseVehicleID.toString())}
                          className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-gray-500">
                    Select year, make, and model to find vehicle IDs
                  </p>
                </div>
              )}
            </div>

            {/* Info Panel */}
            <div className="glass-card rounded-3xl p-6 mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                ℹ️ Data Status
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Makes: {makes.length.toLocaleString()}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Models: {models.length.toLocaleString()}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>SubModels: {subModels.length.toLocaleString()}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Base Vehicles: {baseVehicles.length.toLocaleString()}</span>
                </li>
                <li className="flex items-start">
                  <span className={vehicles.length > 0 ? "text-green-500" : "text-yellow-500"}>{vehicles.length > 0 ? "✓" : "⚠"}</span>
                  <span className="ml-2">
                    Vehicles: {vehicles.length > 0 ? vehicles.length.toLocaleString() : 'Not loaded'}
                  </span>
                </li>
              </ul>
              
              {vehicles.length === 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs font-semibold text-blue-900 mb-1">Need Vehicle.json?</p>
                  <p className="text-xs text-blue-800">
                    Place Vehicle.json in <code className="bg-blue-100 px-1 rounded">/public/data/</code> to enable:
                  </p>
                  <ul className="text-xs text-blue-800 mt-2 ml-4 space-y-1">
                    <li>• Filtered SubModel dropdown</li>
                    <li>• Truck cab size info</li>
                    <li>• Bed length data</li>
                    <li>• Body type details</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
