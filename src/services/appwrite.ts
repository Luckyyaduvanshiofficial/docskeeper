import { Client, Account, Databases, Storage, ID, Query, Models, OAuthProvider, Permission, Role } from 'appwrite';

// Appwrite configuration
const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '694a65a80014a89aaa9b';
const APPWRITE_DATABASE_ID = '694a662c001dfe4fc01e';
const APPWRITE_COLLECTION_ID = 'document_metadata';
const APPWRITE_BUCKET_ID = '694a67e7003534371965';

// Initialize Appwrite Client
const client = new Client();
client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Document metadata interface
export interface DocumentMetadata {
  $id?: string;
  fileId: string;
  fileName: string;
  category: string;
  description: string;
  uploadedAt: string;
  extractedText?: string;
  jsonData?: string;
  /**
   * Optional legacy field. This project relies on Appwrite document permissions
   * instead of requiring a `userId` attribute in the collection schema.
   */
  userId?: string;
}

// Category types
export type DocumentCategory = 'Academic' | 'Receipts' | 'ID Proofs' | 'Certificates' | 'Others';

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'Academic',
  'Receipts',
  'ID Proofs',
  'Certificates',
  'Others',
];

// Auth Service
export const authService = {
  async login(email: string, password: string) {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      return { success: true, data: session };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  },

  async register(email: string, password: string, name: string) {
    try {
      await account.create(ID.unique(), email, password, name);
      return await this.login(email, password);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    }
  },

  async logout() {
    try {
      await account.deleteSession('current');
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Logout failed' };
    }
  },

  async getCurrentUser() {
    try {
      const user = await account.get();
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: 'Not authenticated' };
    }
  },

  async getSession() {
    try {
      const session = await account.getSession('current');
      return { success: true, data: session };
    } catch (error) {
      return { success: false, error: 'No active session' };
    }
  },

  // OAuth login
  loginWithGoogle() {
    account.createOAuth2Session(
      OAuthProvider.Google,
      `${window.location.origin}/dashboard`,
      `${window.location.origin}/login`
    );
  },
};

// Storage Service
export const storageService = {
  async uploadFile(file: File) {
    try {
      const response = await storage.createFile(APPWRITE_BUCKET_ID, ID.unique(), file);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
    }
  },

  async deleteFile(fileId: string) {
    try {
      await storage.deleteFile(APPWRITE_BUCKET_ID, fileId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
    }
  },

  getFilePreview(fileId: string) {
    return storage.getFilePreview(APPWRITE_BUCKET_ID, fileId);
  },

  getFileView(fileId: string) {
    return storage.getFileView(APPWRITE_BUCKET_ID, fileId);
  },

  getFileDownload(fileId: string) {
    return storage.getFileDownload(APPWRITE_BUCKET_ID, fileId);
  },
};

// Database Service
export const databaseService = {
  async createDocument(data: Omit<DocumentMetadata, '$id' | 'userId'>, ownerUserId: string) {
    try {
      const permissions = [
        Permission.read(Role.user(ownerUserId)),
        Permission.update(Role.user(ownerUserId)),
        Permission.delete(Role.user(ownerUserId)),
      ];

      const response = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID,
        ID.unique(),
        data,
        permissions
      );
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Create failed' };
    }
  },

  async getDocument(documentId: string) {
    try {
      const response = await databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, documentId);
      return { success: true, data: response as unknown as DocumentMetadata & Models.Document };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch failed' };
    }
  },

  async updateDocument(documentId: string, data: Partial<DocumentMetadata>) {
    try {
      const response = await databases.updateDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, documentId, data);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Update failed' };
    }
  },

  async deleteDocument(documentId: string) {
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, documentId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
    }
  },

  async listDocuments(queries: string[] = []) {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, queries);
      return { success: true, data: response.documents as unknown as (DocumentMetadata & Models.Document)[] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'List failed' };
    }
  },

  async searchDocuments(keyword: string, category?: string, startDate?: string, endDate?: string) {
    try {
      const queries: string[] = [];

      if (category && category !== 'all') {
        queries.push(Query.equal('category', category));
      }

      if (startDate) {
        queries.push(Query.greaterThanEqual('uploadedAt', startDate));
      }

      if (endDate) {
        queries.push(Query.lessThanEqual('uploadedAt', endDate));
      }

      if (keyword) {
        queries.push(
          Query.or([
            Query.contains('fileName', keyword),
            Query.contains('description', keyword),
          ])
        );
      }

      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, queries);
      return { success: true, data: response.documents as unknown as (DocumentMetadata & Models.Document)[] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Search failed' };
    }
  },

  async getRecentDocuments(limit: number = 5) {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, [
        Query.orderDesc('uploadedAt'),
        Query.limit(limit),
      ]);
      return { success: true, data: response.documents as unknown as (DocumentMetadata & Models.Document)[] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch failed' };
    }
  },

  async getDocumentsByCategory(category: string) {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, [
        Query.equal('category', category),
      ]);
      return { success: true, data: response.documents as unknown as (DocumentMetadata & Models.Document)[] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch failed' };
    }
  },

  async getCategoryCounts() {
    try {
      const counts: Record<string, number> = {};
      for (const category of DOCUMENT_CATEGORIES) {
        const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, [
          Query.equal('category', category),
          Query.limit(1),
        ]);
        counts[category] = response.total;
      }
      return { success: true, data: counts };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch failed' };
    }
  },

  async getTotalCount() {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, [Query.limit(1)]);
      return { success: true, data: response.total };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch failed' };
    }
  },
};

// Autofill Service
export const autofillService = {
  async generateAutofill(formType: string) {
    // This would call an Appwrite Cloud Function
    // For now, we'll simulate it by fetching user documents and generating sample data
    try {
      const docsResult = await databaseService.listDocuments();
      if (!docsResult.success) {
        return { success: false, error: 'Failed to fetch documents' };
      }

      // Parse jsonData from documents to generate autofill
      const documents = docsResult.data || [];
      const autofillData: Record<string, string> = {};

      // Extract fields based on form type
      for (const doc of documents) {
        if (doc.jsonData) {
          try {
            const parsed = JSON.parse(doc.jsonData);
            Object.assign(autofillData, parsed);
          } catch {
            // Skip invalid JSON
          }
        }
      }

      // Add form-specific fields
      const formFields: Record<string, string[]> = {
        Exam: ['Full Name', 'Date of Birth', 'Address', 'Phone', 'Email', 'ID Number', 'Qualification'],
        Scholarship: ['Full Name', 'Date of Birth', 'Address', 'Income', 'Academic Score', 'Institution'],
        Internship: ['Full Name', 'Email', 'Phone', 'Skills', 'Education', 'Experience'],
        Admission: ['Full Name', 'Date of Birth', 'Parent Name', 'Address', 'Previous School', 'Marks'],
        Custom: ['Full Name', 'Date of Birth', 'Address', 'Phone', 'Email'],
      };

      const fields = formFields[formType] || formFields.Custom;
      const result: Record<string, string> = {};
      
      for (const field of fields) {
        result[field] = autofillData[field.toLowerCase().replace(/\s/g, '_')] || '';
      }

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Autofill failed' };
    }
  },
};

export { ID, Query };
