import { fetchSamGovData, printEntity } from '../scripts/print-sam-gov-data';

describe('SAM.gov Data Fetching', () => {
  test('fetchSamGovData returns mock data when no API key provided', async () => {
    const data = await fetchSamGovData();
    
    expect(data).toBeDefined();
    expect(data.totalRecords).toBe(2);
    expect(data.entityData).toBeDefined();
    expect(data.entityData?.length).toBe(2);
  });

  test('mock data contains valid entity structure', async () => {
    const data = await fetchSamGovData();
    const entity = data.entityData?.[0];
    
    expect(entity).toBeDefined();
    expect(entity?.entityRegistration).toBeDefined();
    expect(entity?.entityRegistration?.legalBusinessName).toBeDefined();
    expect(entity?.entityRegistration?.ueiSAM).toBeDefined();
    expect(entity?.entityRegistration?.cageCode).toBeDefined();
  });

  test('mock data includes physical address', async () => {
    const data = await fetchSamGovData();
    const entity = data.entityData?.[0];
    
    expect(entity?.coreData?.physicalAddress).toBeDefined();
    expect(entity?.coreData?.physicalAddress?.city).toBeDefined();
    expect(entity?.coreData?.physicalAddress?.stateOrProvinceCode).toBeDefined();
  });

  test('mock data includes NAICS codes', async () => {
    const data = await fetchSamGovData();
    const entity = data.entityData?.[0];
    
    expect(entity?.assertions?.goodsAndServices).toBeDefined();
    expect(entity?.assertions?.goodsAndServices?.length).toBeGreaterThan(0);
    expect(entity?.assertions?.goodsAndServices?.[0].naicsCode).toBeDefined();
  });

  test('printEntity does not throw error', async () => {
    const data = await fetchSamGovData();
    const entity = data.entityData?.[0];
    
    if (entity) {
      expect(() => printEntity(entity, 0)).not.toThrow();
    }
  });
});
