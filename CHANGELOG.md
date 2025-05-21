# Changelog

## Version 80 - Select Component Fix and Netlify Deployment (v80-select-fix)

**Release Date**: May 21, 2025

### Fixed Issues
- Fixed Select component empty string value errors that were causing runtime exceptions
- Changed empty string values to "all" for consistency in filter dropdowns
- Enhanced SelectItem component to be more robust against empty or whitespace values
- Fixed the filtering logic to handle the new "all" value correctly across components

### Deployment Improvements
- Configured application for Netlify deployment
- Updated netlify.toml with proper build settings
- Added environment variables for the production environment
- Created comprehensive deployment documentation in DEPLOYMENT.md

### Environment Variables
- DATABASE_URI: mongodb+srv://rasd:Saif13saif@rasd2022.z69cu.mongodb.net/ummah
- GOOGLE_MAPS_API_KEY: AIzaSyAodvbSqTiEDGD4Xgj7wAVOxI1jqkD0-Ik
- NEXTAUTH_SECRET: BN5HEdDod78pAFeOZD3P5fOx+GiVRaEO6fleXIMatXT65ngkAftFIRoVa04=
- NEXTAUTH_URL: https://muslimconnect.netlify.app

### Technical Details
- Files modified:
  - src/components/ui/select.tsx
  - src/app/businesses/page.tsx
  - src/app/events/page.tsx
  - src/app/hadith/page.tsx
  - netlify.toml
  - package.json
  - next.config.js
  - Created .env.production

### Deployment URL
- https://muslimconnect.netlify.app
