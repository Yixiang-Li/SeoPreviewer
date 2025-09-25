// SEO Analyzer doesn't need persistent storage - using memory for now
// If needed later, we can add caching for SEO analysis results

export interface IStorage {
  // Add storage methods here if needed for caching SEO results
}

export class MemStorage implements IStorage {
  constructor() {
    // Initialize any storage if needed
  }
}

export const storage = new MemStorage();
