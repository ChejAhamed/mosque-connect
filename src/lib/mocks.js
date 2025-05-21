// This file provides mock exports for items that might be causing build errors
// It's a temporary solution to fix static build issues

// Mock authOptions
export const authOptions = {
  providers: [],
  callbacks: {
    async session() {
      return { user: { name: "Mock User" } };
    },
  },
};

// Mock connectToDB
export function connectToDB() {
  console.log("Mock DB connection");
  return Promise.resolve();
}

// Mock mosques data
export const DUMMY_MOSQUES_FROM_DB = [];

// Mock businesses data
export const DUMMY_BUSINESSES = [];

// Other mock functions or variables that might be imported
export const mockFunctions = {
  getServerSession: () => ({ user: null }),
  redirect: () => {},
  hashPassword: (password) => password,
  comparePassword: () => true,
  createJWT: () => "mock-token",
};
