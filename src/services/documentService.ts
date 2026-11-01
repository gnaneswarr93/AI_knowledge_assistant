import { KnowledgeDocument, DocumentType, DocumentStatus } from '../types';

function getHeaders() {
  const token = localStorage.getItem('ea_knowledge_token');
  return {
    'Authorization': `Bearer ${token}`
  };
}

export type UploadStep = 
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'embedding'
  | 'indexing'
  | 'completed'
  | 'failed';

export interface UploadProgressUpdate {
  step: UploadStep;
  progress: number;
  label: string;
}

export const documentService = {
  async getDocuments(): Promise<KnowledgeDocument[]> {
    const res = await fetch('/api/documents', { headers: getHeaders() });
    if (!res.ok) return [];
    return await res.json();
  },

  async searchDocuments(
    query?: string,
    typeFilter: 'All' | DocumentType = 'All',
    departmentFilter: string = 'All'
  ): Promise<KnowledgeDocument[]> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (typeFilter !== 'All') params.append('typeFilter', typeFilter);
    if (departmentFilter !== 'All') params.append('departmentFilter', departmentFilter);

    const res = await fetch(`/api/documents?${params.toString()}`, { headers: getHeaders() });
    if (!res.ok) return [];
    return await res.json();
  },

  async uploadDocument(
    file: File,
    department: string,
    onProgress?: (update: UploadProgressUpdate) => void
  ): Promise<KnowledgeDocument> {
    onProgress?.({ step: 'uploading', progress: 50, label: 'Uploading file...' });
    
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`/api/documents?department=${encodeURIComponent(department)}`, {
      method: 'POST',
      headers: getHeaders(), // Note: when sending FormData, avoid explicitly setting Content-Type, let the browser set it with the boundary
      body: formData
    });
    
    onProgress?.({ step: 'completed', progress: 100, label: 'Indexed successfully' });
    return await res.json();
  },

  async deleteDocument(id: string): Promise<void> {
    await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  async reindexDocument(id: string): Promise<KnowledgeDocument> {
    const res = await fetch(`/api/documents/${id}/reindex`, {
      method: 'POST',
      headers: getHeaders()
    });
    return await res.json();
  },

  async getDocumentStatus(id: string): Promise<DocumentStatus> {
    return 'Indexed';
  }
};
