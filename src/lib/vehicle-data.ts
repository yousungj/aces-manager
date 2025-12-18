// Vehicle data types based on VCDB structure
export type Make = {
  MakeID: number;
  MakeName: string;
};

export type Model = {
  ModelID: number;
  ModelName: string;
  VehicleTypeID: number;
};

export type BaseVehicle = {
  BaseVehicleID: number;
  YearID: number;
  MakeID: number;
  ModelID: number;
};

export type VehicleData = {
  make: string;
  makeId: number;
  model: string;
  modelId: number;
  years: {
    year: number;
    baseVehicleId: number;
  }[];
};

// Process raw VCDB data into organized structure
export function processVehicleData(
  makes: Make[],
  models: Model[],
  baseVehicles: BaseVehicle[]
): Map<string, VehicleData[]> {
  const makeMap = new Map(makes.map(m => [m.MakeID, m.MakeName]));
  const modelMap = new Map(models.map(m => [m.ModelID, m.ModelName]));

  // Group base vehicles by make-model combination
  const grouped = new Map<string, Map<number, { year: number; baseVehicleId: number }[]>>();

  baseVehicles.forEach(bv => {
    const key = `${bv.MakeID}-${bv.ModelID}`;
    if (!grouped.has(key)) {
      grouped.set(key, new Map());
    }
    const modelYears = grouped.get(key)!;
    if (!modelYears.has(bv.ModelID)) {
      modelYears.set(bv.ModelID, []);
    }
    modelYears.get(bv.ModelID)!.push({
      year: bv.YearID,
      baseVehicleId: bv.BaseVehicleID
    });
  });

  // Convert to organized structure grouped by make
  const result = new Map<string, VehicleData[]>();

  grouped.forEach((modelYears, key) => {
    const [makeIdStr, modelIdStr] = key.split('-');
    const makeId = parseInt(makeIdStr);
    const modelId = parseInt(modelIdStr);
    const makeName = makeMap.get(makeId) || 'Unknown';
    const modelName = modelMap.get(modelId) || 'Unknown';

    if (!result.has(makeName)) {
      result.set(makeName, []);
    }

    modelYears.forEach((years, _) => {
      // Sort years in descending order (newest first)
      years.sort((a, b) => b.year - a.year);
      
      result.get(makeName)!.push({
        make: makeName,
        makeId,
        model: modelName,
        modelId,
        years
      });
    });
  });

  // Sort models within each make alphabetically
  result.forEach((vehicles, make) => {
    vehicles.sort((a, b) => a.model.localeCompare(b.model));
  });

  return result;
}

// Search/filter vehicles
export function searchVehicles(
  vehicleData: Map<string, VehicleData[]>,
  searchTerm: string
): VehicleData[] {
  const term = searchTerm.toLowerCase();
  const results: VehicleData[] = [];

  vehicleData.forEach((vehicles, make) => {
    vehicles.forEach(vehicle => {
      if (
        vehicle.make.toLowerCase().includes(term) ||
        vehicle.model.toLowerCase().includes(term)
      ) {
        results.push(vehicle);
      }
    });
  });

  return results;
}
