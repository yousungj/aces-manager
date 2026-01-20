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
  SubmodelID: number;  // Note: lowercase 'm' in the actual data
};

type BodyType = {
  BodyTypeID: number;
  BodyTypeName: string;
};

type BodyStyleConfig = {
  BodyStyleConfigID: number;
  BodyNumDoorsID: number;
  BodyTypeID: number;
};

type VehicleToBodyStyleConfig = {
  VehicleToBodyStyleConfigID: number;
  VehicleID: number;
  BodyStyleConfigID: number;
  Source: string | null;
};

export default function VehicleLookup() {
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [subModels, setSubModels] = useState<SubModel[]>([]);
  const [baseVehicles, setBaseVehicles] = useState<BaseVehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bodyTypes, setBodyTypes] = useState<BodyType[]>([]);
  const [bodyStyleConfigs, setBodyStyleConfigs] = useState<BodyStyleConfig[]>([]);
  const [vehicleToBodyStyleConfigs, setVehicleToBodyStyleConfigs] = useState<VehicleToBodyStyleConfig[]>([]);
  
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedSubModel, setSelectedSubModel] = useState<string>('');
  const [selectedBodyType, setSelectedBodyType] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<BaseVehicle[]>([]);
  
  // XML Generation fields
  const [partNumber, setPartNumber] = useState<string>('');
  const [brandCode, setBrandCode] = useState<string>('GFLT');
  const [partTypeId, setPartTypeId] = useState<string>('1300');
  
  // Selected vehicles for batch XML generation
  type SelectedVehicle = {
    baseVehicleId: number;
    year: number;
    makeName: string;
    modelName: string;
    subModelId?: number;
    subModelName?: string;
    bodyTypeId?: number;
    bodyTypeName?: string;
  };
  const [selectedVehicles, setSelectedVehicles] = useState<SelectedVehicle[]>([]);

  const BRAND_OPTIONS = [
    { code: 'DGQS', name: 'Motor Trend' },
    { code: 'JZXV', name: 'CAT' },
    { code: 'GFLT', name: 'BDK' },
    { code: 'JZBF', name: 'Motor Box' },
    { code: 'JNLD', name: 'Carbella' },
  ];

  const PART_TYPE_OPTIONS = [
    { name: 'Car cover', id: '1020' },
    { name: 'Tonneau Cover', id: '1188' },
    { name: 'SWC', id: '57008' },
    { name: 'Trunk Mat', id: '47593' },
    { name: 'Tailgate mat', id: '16121' },
    { name: 'Mat', id: '1300' },
    { name: 'Seat Cover', id: '1316' },
    { name: 'Trunk Organizer', id: '14290' },
    { name: 'Wiper Blade', id: '8852' },
    { name: 'Windshield Snow Cover', id: '71066' },
  ];

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
          console.log(`✓ Loaded ${vehiclesRes.length.toLocaleString()} vehicle records`);
        } catch (error) {
          console.log('Vehicle.json not found - SubModel filtering unavailable');
        }
        
        // Try to load BodyType.json if it exists
        try {
          const bodyTypesRes = await fetch('/data/BodyType.json').then(r => r.json());
          setBodyTypes(bodyTypesRes);
          console.log(`✓ Loaded ${bodyTypesRes.length} body types`);
        } catch (error) {
          console.log('BodyType.json not found');
        }
        
        // Try to load BodyStyleConfig.json
        try {
          const bodyStyleConfigsRes = await fetch('/data/BodyStyleConfig.json').then(r => r.json());
          setBodyStyleConfigs(bodyStyleConfigsRes);
          console.log(`✓ Loaded ${bodyStyleConfigsRes.length} body style configs`);
        } catch (error) {
          console.log('BodyStyleConfig.json not found');
        }
        
        // Try to load VehicleToBodyStyleConfig.json
        try {
          const vehicleToBodyStyleConfigsRes = await fetch('/data/VehicleToBodyStyleConfig.json').then(r => r.json());
          setVehicleToBodyStyleConfigs(vehicleToBodyStyleConfigsRes);
          console.log(`✓ Loaded ${vehicleToBodyStyleConfigsRes.length.toLocaleString()} vehicle to body style mappings`);
        } catch (error) {
          console.log('VehicleToBodyStyleConfig.json not found');
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
        .map(v => v.SubmodelID)  // Note: lowercase 'm'
    );
    
    return subModels.filter(s => subModelIds.has(s.SubModelID)).sort((a, b) => a.SubModelName.localeCompare(b.SubModelName));
  }, [selectedYear, selectedMake, selectedModel, vehicles, baseVehicles, subModels]);

  // Filter available body types (cab styles) based on selected vehicle
  const availableBodyTypes = useMemo(() => {
    if (!vehicleToBodyStyleConfigs.length || !bodyStyleConfigs.length || !bodyTypes.length) {
      return [];
    }
    
    if (!selectedYear || !selectedMake || !selectedModel) {
      return [];
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
    
    // Get all vehicle IDs that match these base vehicle IDs
    const vehicleIds = new Set(
      vehicles
        .filter(v => baseVehicleIds.has(v.BaseVehicleID))
        .map(v => v.VehicleID)
    );
    
    // Get all body style config IDs for these vehicles
    const bodyStyleConfigIds = new Set(
      vehicleToBodyStyleConfigs
        .filter(v => vehicleIds.has(v.VehicleID))
        .map(v => v.BodyStyleConfigID)
    );
    
    // Get all body type IDs from these configs
    const bodyTypeIds = new Set(
      bodyStyleConfigs
        .filter(c => bodyStyleConfigIds.has(c.BodyStyleConfigID))
        .map(c => c.BodyTypeID)
    );
    
    // Filter and sort body types
    return bodyTypes
      .filter(bt => bodyTypeIds.has(bt.BodyTypeID))
      .sort((a, b) => a.BodyTypeName.localeCompare(b.BodyTypeName));
  }, [selectedYear, selectedMake, selectedModel, vehicles, baseVehicles, vehicleToBodyStyleConfigs, bodyStyleConfigs, bodyTypes]);

  // Get base vehicle ID when all selections are made
  const baseVehicleResult = useMemo(() => {
    if (!selectedYear || !selectedMake || !selectedModel) return null;
    
    // If SubModel is selected, filter through Vehicle.json
    if (selectedSubModel && vehicles.length > 0) {
      // Find all base vehicle IDs that match Year/Make/Model
      const matchingBaseVehicleIds = baseVehicles
        .filter(v => 
          v.YearID === parseInt(selectedYear) &&
          v.MakeID === parseInt(selectedMake) &&
          v.ModelID === parseInt(selectedModel)
        )
        .map(v => v.BaseVehicleID);
      
      // Find vehicles that match both the base vehicle IDs AND the selected SubModel
      let matchingVehicles = vehicles.filter(v => 
        matchingBaseVehicleIds.includes(v.BaseVehicleID) &&
        v.SubmodelID === parseInt(selectedSubModel)
      );
      
      // If Body Type is also selected, further filter by body type
      if (selectedBodyType && vehicleToBodyStyleConfigs.length > 0 && bodyStyleConfigs.length > 0) {
        // Get body style config IDs that match the selected body type
        const matchingBodyStyleConfigIds = bodyStyleConfigs
          .filter(c => c.BodyTypeID === parseInt(selectedBodyType))
          .map(c => c.BodyStyleConfigID);
        
        // Get vehicle IDs that have these body style configs
        const vehicleIdsWithBodyType = new Set(
          vehicleToBodyStyleConfigs
            .filter(v => matchingBodyStyleConfigIds.includes(v.BodyStyleConfigID))
            .map(v => v.VehicleID)
        );
        
        // Filter vehicles by body type
        matchingVehicles = matchingVehicles.filter(v => vehicleIdsWithBodyType.has(v.VehicleID));
      }
      
      // Return the first matching vehicle's base vehicle ID
      if (matchingVehicles.length > 0) {
        const baseVehicleId = matchingVehicles[0].BaseVehicleID;
        return baseVehicles.find(bv => bv.BaseVehicleID === baseVehicleId) || null;
      }
      
      // If no match found with SubModel, return null
      return null;
    }
    
    // If only Year/Make/Model selected (no SubModel), return first matching base vehicle
    const result = baseVehicles.find(v => 
      v.YearID === parseInt(selectedYear) &&
      v.MakeID === parseInt(selectedMake) &&
      v.ModelID === parseInt(selectedModel)
    );
    
    return result || null;
  }, [selectedYear, selectedMake, selectedModel, selectedSubModel, selectedBodyType, baseVehicles, vehicles, vehicleToBodyStyleConfigs, bodyStyleConfigs]);

  // Get selected names for display
  const selectedMakeName = makes.find(m => m.MakeID === parseInt(selectedMake))?.MakeName || '';
  const selectedModelName = models.find(m => m.ModelID === parseInt(selectedModel))?.ModelName || '';
  const selectedSubModelName = subModels.find(s => s.SubModelID === parseInt(selectedSubModel))?.SubModelName || '';
  const selectedBodyTypeName = bodyTypes.find(bt => bt.BodyTypeID === parseInt(selectedBodyType))?.BodyTypeName || '';

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
    setSelectedBodyType('');
    setSearchResults([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  const addVehicleToSelection = () => {
    if (!baseVehicleResult) {
      alert('Please select a vehicle first!');
      return;
    }

    const newVehicle: SelectedVehicle = {
      baseVehicleId: baseVehicleResult.BaseVehicleID,
      year: baseVehicleResult.YearID,
      makeName: selectedMakeName,
      modelName: selectedModelName,
      subModelId: selectedSubModel ? parseInt(selectedSubModel) : undefined,
      subModelName: selectedSubModelName || undefined,
      bodyTypeId: selectedBodyType ? parseInt(selectedBodyType) : undefined,
      bodyTypeName: selectedBodyTypeName || undefined,
    };

    // Check for duplicates
    const isDuplicate = selectedVehicles.some(v => 
      v.baseVehicleId === newVehicle.baseVehicleId &&
      v.subModelId === newVehicle.subModelId &&
      v.bodyTypeId === newVehicle.bodyTypeId
    );

    if (isDuplicate) {
      alert('This vehicle configuration is already added!');
      return;
    }

    setSelectedVehicles([...selectedVehicles, newVehicle]);
  };

  const removeVehicleFromSelection = (index: number) => {
    setSelectedVehicles(selectedVehicles.filter((_, i) => i !== index));
  };

  const clearAllVehicles = () => {
    setSelectedVehicles([]);
  };

  const generateXML = () => {
    if (selectedVehicles.length === 0) {
      alert('Please add at least one vehicle to the selection!');
      return;
    }
    if (!partNumber.trim()) {
      alert('Please enter a part number!');
      return;
    }

    const currentDate = new Date().toISOString().split('T')[0];
    const brandName = BRAND_OPTIONS.find(b => b.code === brandCode)?.name || 'Unknown';
    
    // Build App records for all selected vehicles
    const appRecords = selectedVehicles.map((vehicle, index) => {
      let vehicleSection = `    <BaseVehicle id="${vehicle.baseVehicleId}" />`;
      
      if (vehicle.subModelId) {
        vehicleSection += `\n    <SubModel id="${vehicle.subModelId}" />`;
      }
      
      if (vehicle.bodyTypeId) {
        vehicleSection += `\n    <BodyType id="${vehicle.bodyTypeId}" />`;
      }

      return `  <App action="A" id="${index + 1}">
${vehicleSection}
    <Note></Note>
    <Qty>1</Qty>
    <PartType id="${partTypeId}" />
    <Part>${partNumber}</Part>
  </App>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<ACES version="3.2">
  <Header>
    <Company>BDK Auto</Company>
    <SenderName>BDK User</SenderName>
    <SenderPhone>000-000-0000</SenderPhone>
    <TransferDate>${currentDate}</TransferDate>
    <BrandAAIAID>${brandCode}</BrandAAIAID>
    <DocumentTitle>ACES Vehicle Lookup Export</DocumentTitle>
    <EffectiveDate>${currentDate}</EffectiveDate>
    <ApprovedFor>US</ApprovedFor>
    <SubmissionType>FULL</SubmissionType>
    <VcdbVersionDate>2022-06-24</VcdbVersionDate>
    <QdbVersionDate>2015-05-26</QdbVersionDate>
    <PcdbVersionDate>2022-07-08</PcdbVersionDate>
  </Header>
${appRecords}
</ACES>`;

    // Download XML file
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${partNumber}_${selectedVehicles.length}_vehicles.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`XML file with ${selectedVehicles.length} vehicle(s) downloaded successfully!`);
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
                      setSelectedBodyType('');
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
                      setSelectedBodyType('');
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

                {/* Body Type / Cab Style Selection (Optional) */}
                {availableBodyTypes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Body Type / Cab Style
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                      value={selectedBodyType}
                      onChange={(e) => setSelectedBodyType(e.target.value)}
                      disabled={!selectedModel}
                    >
                      <option value="">All Body Types</option>
                      {availableBodyTypes.map(bodyType => (
                        <option key={bodyType.BodyTypeID} value={bodyType.BodyTypeID}>
                          {bodyType.BodyTypeName}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-600 mt-2">
                      ✓ {availableBodyTypes.length} body type(s) available for this vehicle
                    </p>
                  </div>
                )}

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
                    {selectedSubModelName && `(${selectedSubModelName}) `}
                    {selectedBodyTypeName && `[${selectedBodyTypeName}]`}
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
                        <span className="font-medium text-gray-900">{selectedSubModelName} (ID: {selectedSubModel})</span>
                      </div>
                    )}
                    {selectedBodyTypeName && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Body Type:</span>
                        <span className="font-medium text-gray-900">{selectedBodyTypeName} (ID: {selectedBodyType})</span>
                      </div>
                    )}
                  </div>

                  {/* Add to Selection Button */}
                  <button
                    onClick={addVehicleToSelection}
                    className="w-full apple-btn apple-btn-secondary px-4 py-2.5 text-sm"
                  >
                    ➕ Add this Vehicle to Selection
                  </button>

                  {/* Selected Vehicles List */}
                  {selectedVehicles.length > 0 && (
                    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-purple-900">
                          📋 Selected Vehicles ({selectedVehicles.length})
                        </h4>
                        <button
                          onClick={clearAllVehicles}
                          className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedVehicles.map((vehicle, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-900">
                                  {vehicle.year} {vehicle.makeName} {vehicle.modelName}
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5">
                                  BaseVehicle: {vehicle.baseVehicleId}
                                  {vehicle.subModelName && ` • ${vehicle.subModelName}`}
                                  {vehicle.bodyTypeName && ` • ${vehicle.bodyTypeName}`}
                                </p>
                              </div>
                              <button
                                onClick={() => removeVehicleFromSelection(index)}
                                className="text-xs text-red-500 hover:text-red-700 ml-2"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* XML Generation Section */}
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3">📄 Generate ACES XML</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-blue-800 mb-1">Part Number</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white text-sm"
                          placeholder="Enter part number"
                          value={partNumber}
                          onChange={(e) => setPartNumber(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-800 mb-1">Brand</label>
                        <select
                          className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white text-sm"
                          value={brandCode}
                          onChange={(e) => setBrandCode(e.target.value)}
                        >
                          {BRAND_OPTIONS.map(b => (
                            <option key={b.code} value={b.code}>{b.code} - {b.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-800 mb-1">Part Type</label>
                        <select
                          className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white text-sm"
                          value={partTypeId}
                          onChange={(e) => setPartTypeId(e.target.value)}
                        >
                          {PART_TYPE_OPTIONS.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={generateXML}
                        className="w-full apple-btn apple-btn-primary px-4 py-2.5 text-sm"
                        disabled={selectedVehicles.length === 0}
                      >
                        📥 Download ACES XML ({selectedVehicles.length} vehicle{selectedVehicles.length !== 1 ? 's' : ''})
                      </button>
                      {selectedVehicles.length > 0 && (
                        <p className="text-xs text-blue-700">
                          ✓ Will generate XML with {selectedVehicles.length} App record{selectedVehicles.length !== 1 ? 's' : ''}
                        </p>
                      )}
                      {selectedVehicles.length === 0 && (
                        <p className="text-xs text-yellow-700">
                          ⚠ Add at least one vehicle to the selection above
                        </p>
                      )}
                    </div>
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
                <li className="flex items-start">
                  <span className={bodyTypes.length > 0 ? "text-green-500" : "text-yellow-500"}>{bodyTypes.length > 0 ? "✓" : "⚠"}</span>
                  <span className="ml-2">
                    Body Types: {bodyTypes.length > 0 ? bodyTypes.length : 'Not loaded'}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className={bodyStyleConfigs.length > 0 ? "text-green-500" : "text-yellow-500"}>{bodyStyleConfigs.length > 0 ? "✓" : "⚠"}</span>
                  <span className="ml-2">
                    Body Style Configs: {bodyStyleConfigs.length > 0 ? bodyStyleConfigs.length : 'Not loaded'}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className={vehicleToBodyStyleConfigs.length > 0 ? "text-green-500" : "text-yellow-500"}>{vehicleToBodyStyleConfigs.length > 0 ? "✓" : "⚠"}</span>
                  <span className="ml-2">
                    Vehicle Body Mappings: {vehicleToBodyStyleConfigs.length > 0 ? vehicleToBodyStyleConfigs.length.toLocaleString() : 'Not loaded'}
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
              
              {vehicles.length > 0 && bodyTypes.length > 0 && vehicleToBodyStyleConfigs.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-xs font-semibold text-green-900 mb-1">✓ Full Dataset Loaded</p>
                  <p className="text-xs text-green-800">
                    Vehicle, BodyType, and BodyStyleConfig data available. SubModels and cab styles are now filtered accurately.
                  </p>
                  <p className="text-xs text-green-700 mt-2">
                    <strong>Cab style selection:</strong> Available for trucks with multiple body type options (Standard Cab, Extended Cab, Crew Cab, etc.)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
