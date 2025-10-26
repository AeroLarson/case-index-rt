# Email to Emily Cox - San Diego County IT

**To:** Emily.Cox@sdcourt.ca.gov  
**Subject:** Correct Endpoints and Authentication for ROASearch, ODYROA, and CourtIndex

Dear Emily,

Thank you for the rate limit clarification! We've successfully updated our system to use the correct rate limits:

- **ROASearch**: 15 requests/minute ✅
- **ODYROA**: 30 requests/minute ✅  
- **CourtIndex**: 30 requests/minute ✅

Our static IP addresses are working perfectly with your whitelist.

## Current Status
✅ **IP Whitelisting**: Working  
✅ **Rate Limiting**: Implemented correctly  
✅ **Connection**: No more 503 errors  

## What We Need
We can now connect to your systems, but we need the correct endpoints and authentication methods for:

1. **ROASearch** (`roasearch.sdcourt.ca.gov`)
2. **ODYROA** (`odyroa.sdcourt.ca.gov`) 
3. **CourtIndex** (`courtindex.sdcourt.ca.gov`)

## Questions
Could you please provide:

1. **Correct API endpoints** for each platform
2. **Authentication method** (API keys, tokens, etc.)
3. **Request format** (query parameters, headers, etc.)
4. **Response format** (JSON, XML, HTML structure)
5. **Documentation** or examples of successful requests

## Our Current Approach
We're currently trying:
- `https://roasearch.sdcourt.ca.gov/search?query=CASENUMBER`
- `https://odyroa.sdcourt.ca.gov/search?query=CASENUMBER`
- `https://courtindex.sdcourt.ca.gov/search?query=CASENUMBER`

## Test Case
We're testing with case number: **22FL001581C**

## Static IPs (for reference)
- Washington DC: 3.224.164.255, 3.219.38.3
- San Francisco: 13.52.59.12, 54.153.14.201
- Frankfurt: 18.158.148.130, 18.158.212.6

Thank you for your continued support!

**Aero Larson**  
**Phone:** (619) 760-7725  
**Project:** Case Index RT - Legal Technology Platform

