// Temporary shim file to fix Netlify build issues with imports
// This helps prevent "not exported" errors during build by providing empty versions
// of commonly imported modules that might not be properly exported

// Mock dummy data that isn't being exported properly
export const DUMMY_MOSQUES_FROM_DB = [];
export const DUMMY_BUSINESSES = [];

// Mock lucide-react icons that might be causing issues
export const Female = () => null;
export const Male = () => null;

// This file will not be actually used in the application
// It only exists to make the build process happy
console.log("Netlify build fix loaded");
