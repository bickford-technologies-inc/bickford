#!/usr/bin/env bun

/**
 * Script to fetch and print SAM.gov (System for Award Management) entity data
 * 
 * SAM.gov is the official U.S. government system that consolidated federal procurement systems
 * and the Catalog of Federal Domestic Assistance.
 * 
 * API Documentation: https://open.gsa.gov/api/entity-api/
 * 
 * Usage:
 *   bun run scripts/print-sam-gov-data.ts
 * 
 * Environment Variables:
 *   SAM_GOV_API_KEY - Your SAM.gov API key (obtain from https://sam.gov)
 */

interface SamGovEntity {
  entityRegistration?: {
    samRegistered?: string;
    ueiSAM?: string;
    entityEFTIndicator?: string;
    cageCode?: string;
    dodaac?: string;
    legalBusinessName?: string;
    dbaName?: string;
    registrationStatus?: string;
    registrationDate?: string;
    expirationDate?: string;
    lastUpdateDate?: string;
    registrationExpirationDate?: string;
    activationDate?: string;
    ueiStatus?: string;
    ueiExpirationDate?: string;
    ueiCreationDate?: string;
    noPublicDisplayFlag?: string;
    exclusionStatusFlag?: string;
    exclusionURL?: string;
    dnbOpenData?: string;
  };
  coreData?: {
    entityHierarchyInformation?: {
      immediateParentEntity?: {
        ueiSAM?: string;
        legalBusinessName?: string;
      };
    };
    entityInformation?: {
      entityURL?: string;
      entityDivisionName?: string;
      entityDivisionNumber?: string;
      entityStartDate?: string;
      fiscalYearEndCloseDate?: string;
      submissionDate?: string;
    };
    physicalAddress?: {
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      stateOrProvinceCode?: string;
      zipCode?: string;
      countryCode?: string;
    };
    mailingAddress?: {
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      stateOrProvinceCode?: string;
      zipCode?: string;
      countryCode?: string;
    };
  };
  assertions?: {
    goodsAndServices?: {
      naicsCode?: string;
      naicsDescription?: string;
      isPrimary?: string;
    }[];
  };
}

interface SamGovApiResponse {
  totalRecords?: number;
  entityData?: SamGovEntity[];
  links?: {
    selfLink?: string;
    nextLink?: string;
  };
}

/**
 * Fetch SAM.gov entity data
 */
async function fetchSamGovData(apiKey?: string, limit: number = 10): Promise<SamGovApiResponse> {
  if (!apiKey) {
    console.log('⚠️  No SAM_GOV_API_KEY provided. Using mock data for demonstration.');
    console.log('To fetch real data, obtain an API key from https://sam.gov and set SAM_GOV_API_KEY environment variable.\n');
    
    // Return mock data for demonstration
    // Note: Mock data always returns 2 records regardless of limit parameter
    return {
      totalRecords: 2,
      entityData: [
        {
          entityRegistration: {
            legalBusinessName: "ACME FEDERAL CONTRACTORS LLC",
            ueiSAM: "ABC123456789",
            cageCode: "1A2B3",
            registrationStatus: "Active",
            registrationDate: "2023-01-15",
            expirationDate: "2024-01-15",
          },
          coreData: {
            physicalAddress: {
              addressLine1: "123 Main Street",
              city: "Washington",
              stateOrProvinceCode: "DC",
              zipCode: "20001",
              countryCode: "USA",
            },
          },
          assertions: {
            goodsAndServices: [
              {
                naicsCode: "541512",
                naicsDescription: "Computer Systems Design Services",
                isPrimary: "Yes",
              },
            ],
          },
        },
        {
          entityRegistration: {
            legalBusinessName: "DEFENSE SOLUTIONS INC",
            ueiSAM: "DEF987654321",
            cageCode: "4C5D6",
            registrationStatus: "Active",
            registrationDate: "2022-06-20",
            expirationDate: "2024-06-20",
          },
          coreData: {
            physicalAddress: {
              addressLine1: "456 Pentagon Way",
              city: "Arlington",
              stateOrProvinceCode: "VA",
              zipCode: "22202",
              countryCode: "USA",
            },
          },
          assertions: {
            goodsAndServices: [
              {
                naicsCode: "541330",
                naicsDescription: "Engineering Services",
                isPrimary: "Yes",
              },
            ],
          },
        },
      ],
    };
  }

  // Fetch real data from SAM.gov API
  const url = `https://api.sam.gov/entity-management/v1/entities?registrationStatus=Active&includeSections=entityRegistration,coreData,assertions&limit=${limit}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey, // Use header for security (better than query parameter)
      },
    });
    
    if (!response.ok) {
      throw new Error(`SAM.gov API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching SAM.gov data:', error);
    throw error;
  }
}

/**
 * Format and print entity data
 */
function printEntity(entity: SamGovEntity, index: number): void {
  const reg = entity.entityRegistration;
  const core = entity.coreData;
  const assertions = entity.assertions;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`ENTITY #${index + 1}`);
  console.log('='.repeat(80));
  
  if (reg) {
    console.log('\n📋 REGISTRATION INFORMATION:');
    console.log(`  Legal Business Name: ${reg.legalBusinessName || 'N/A'}`);
    console.log(`  UEI SAM: ${reg.ueiSAM || 'N/A'}`);
    console.log(`  CAGE Code: ${reg.cageCode || 'N/A'}`);
    console.log(`  Registration Status: ${reg.registrationStatus || 'N/A'}`);
    console.log(`  Registration Date: ${reg.registrationDate || 'N/A'}`);
    console.log(`  Expiration Date: ${reg.expirationDate || 'N/A'}`);
  }
  
  if (core?.physicalAddress) {
    console.log('\n📍 PHYSICAL ADDRESS:');
    const addr = core.physicalAddress;
    console.log(`  ${addr.addressLine1 || ''}`);
    if (addr.addressLine2) console.log(`  ${addr.addressLine2}`);
    console.log(`  ${addr.city || ''}, ${addr.stateOrProvinceCode || ''} ${addr.zipCode || ''}`);
    console.log(`  ${addr.countryCode || ''}`);
  }
  
  if (assertions?.goodsAndServices && assertions.goodsAndServices.length > 0) {
    console.log('\n🏢 GOODS AND SERVICES (NAICS Codes):');
    assertions.goodsAndServices.forEach((service, idx) => {
      console.log(`  ${idx + 1}. ${service.naicsCode || 'N/A'} - ${service.naicsDescription || 'N/A'}`);
      if (service.isPrimary === 'Yes') {
        console.log(`     (Primary)`);
      }
    });
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('\n🇺🇸 SAM.gov Entity Data Retrieval');
  console.log('System for Award Management - Federal Procurement Database\n');
  
  const apiKey = process.env.SAM_GOV_API_KEY;
  
  try {
    const data = await fetchSamGovData(apiKey);
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`  Total Records Available: ${data.totalRecords || 0}`);
    console.log(`  Records Retrieved: ${data.entityData?.length || 0}\n`);
    
    if (data.entityData && data.entityData.length > 0) {
      data.entityData.forEach((entity, index) => {
        printEntity(entity, index);
      });
    } else {
      console.log('No entity data found.');
    }
    
    console.log(`\n${'='.repeat(80)}\n`);
    
    if (apiKey) {
      console.log('✅ Data fetched successfully from SAM.gov API\n');
    } else {
      console.log('ℹ️  This is demonstration data. Set SAM_GOV_API_KEY to fetch real data.\n');
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Execute if run directly
main().catch(console.error);

export { fetchSamGovData, printEntity };
