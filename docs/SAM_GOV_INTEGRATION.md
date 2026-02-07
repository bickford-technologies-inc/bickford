# SAM.gov Integration

This document describes how to fetch and print data from SAM.gov (System for Award Management), the official U.S. government system for federal procurement.

## Overview

SAM.gov consolidates federal procurement systems and the Catalog of Federal Domestic Assistance. It contains information about entities (companies, organizations) registered to do business with the U.S. government.

## Features

- Fetch entity data from SAM.gov API
- Display registration information (UEI, CAGE Code, status)
- Show physical addresses
- List NAICS codes (goods and services classifications)
- Works with or without an API key (mock data for demonstration)

## Usage

### Quick Start

Run the script directly:

```bash
npm run print:sam-gov-data
```

Or using the script path:

```bash
npx tsx scripts/print-sam-gov-data.ts
```

### With API Key

To fetch real data from SAM.gov:

1. Obtain an API key from https://sam.gov:
   - Create an account on SAM.gov
   - Request an API key through the API access portal
   - Individual Account API Key or System Account API Key

2. Set the environment variable:

```bash
export SAM_GOV_API_KEY=your-api-key-here
npm run print:sam-gov-data
```

Or add it to your `.env` file:

```
SAM_GOV_API_KEY=your-api-key-here
```

### Without API Key

If no API key is provided, the script will display mock demonstration data.

## Output Format

The script prints entity data in a formatted, human-readable format:

```
🇺🇸 SAM.gov Entity Data Retrieval
System for Award Management - Federal Procurement Database

📊 SUMMARY:
  Total Records Available: 1000
  Records Retrieved: 10

================================================================================
ENTITY #1
================================================================================

📋 REGISTRATION INFORMATION:
  Legal Business Name: ACME FEDERAL CONTRACTORS LLC
  UEI SAM: ABC123456789
  CAGE Code: 1A2B3
  Registration Status: Active
  Registration Date: 2023-01-15
  Expiration Date: 2024-01-15

📍 PHYSICAL ADDRESS:
  123 Main Street
  Washington, DC 20001
  USA

🏢 GOODS AND SERVICES (NAICS Codes):
  1. 541512 - Computer Systems Design Services
     (Primary)
```

## API Documentation

The script uses the SAM.gov Entity Management API:

- **Base URL**: `https://api.sam.gov/entity-management/v1/entities`
- **Authentication**: API key in query parameter or header
- **Rate Limits**: Varies by account type
- **Documentation**: https://open.gsa.gov/api/entity-api/

## Data Fields

### Entity Registration
- Legal Business Name
- UEI SAM (Unique Entity Identifier)
- CAGE Code (Commercial and Government Entity Code)
- Registration Status (Active, Expired, etc.)
- Registration and Expiration Dates

### Physical Address
- Street Address
- City, State, ZIP Code
- Country

### Goods and Services
- NAICS Codes and Descriptions
- Primary classification indicator

## Integration with Bickford

This script can be integrated with the Bickford datalake for:

1. **Lead Generation**: Identify federal contractors for customer acquisition
2. **Compliance Tracking**: Monitor registration status of customers
3. **Market Analysis**: Analyze federal procurement landscape
4. **Data Enrichment**: Add SAM.gov data to customer profiles

## References

- [SAM.gov Official Site](https://sam.gov)
- [SAM.gov Entity Management API](https://open.gsa.gov/api/entity-api/)
- [SAM.gov API Guide](https://govconapi.com/sam-gov-api-guide)
- [API Key Registration](https://sam.gov/data-services/API)

## Future Enhancements

Potential improvements:
- Export data to JSON/CSV formats
- Filter by NAICS code, location, or other criteria
- Bulk data extraction
- Integration with Bickford ledger for audit trail
- Automated lead generation from SAM.gov data
- Real-time registration status monitoring
