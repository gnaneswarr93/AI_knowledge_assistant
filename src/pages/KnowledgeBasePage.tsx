import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { documentService } from '../services/documentService';
import { KnowledgeDocument, DocumentType } from '../types';
import { UploadDocumentModal } from '../components/documents/UploadDocumentModal';
import { DocumentPreviewModal } from '../components/documents/DocumentPreviewModal';
import { DocumentIndexingModal } from '../components/documents/DocumentIndexingModal';
import {
  Search,
  Plus,
  FileText,
  FileCode,
  FileSpreadsheet,
  File,
  Eye,
  Trash2,
  RefreshCw,
  FolderArchive,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Layers,
  UploadCloud,
} from 'lucide-react';

export const KnowledgeBasePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'All' | DocumentType>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');

  // Drag and Drop state
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<KnowledgeDocument | null>(null);
  const [indexingDoc, setIndexingDoc] = useState<KnowledgeDocument | null>(null);
  const [reindexingId, setReindexingId] = useState<string | null>(null);

  // Load documents
  useEffect(() => {
    const fetchDocs = async () => {
      setIsLoading(true);
      try {
        const docs = await documentService.getDocuments();
        setDocuments(docs);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setDroppedFile(file);
      setUploadModalOpen(true);
      showToast(`Selected "${file.name}" for vector indexing.`, 'info', 2000);
    }
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchType = typeFilter === 'All' || doc.type === typeFilter;
      const matchDept = deptFilter === 'All' || doc.department === deptFilter;
      const matchQuery =
        !searchQuery.trim() ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        doc.department.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase().trim());

      return matchType && matchDept && matchQuery;
    });
  }, [documents, typeFilter, deptFilter, searchQuery]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set(documents.map((d) => d.department));
    return ['All', ...Array.from(set)];
  }, [documents]);

  const handleDeleteDoc = async (id: string, name: string) => {
    try {
      await documentService.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      showToast(`Document "${name}" deleted.`, 'info');
    } catch {
      showToast('Failed to delete document', 'error');
    }
  };

  const handleReindexDoc = async (id: string, name: string) => {
    setReindexingId(id);
    try {
      const updated = await documentService.reindexDocument(id);
      setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)));
      showToast(`Document "${name}" indexing completed.`, 'success');
    } catch {
      showToast('Failed to re-index document', 'error');
    } finally {
      setReindexingId(null);
    }
  };

  const handleUploadSuccess = (newDoc: KnowledgeDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const getDocIcon = (type: DocumentType) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'DOCX':
        return <File className="w-4 h-4 text-blue-500" />;
      case 'TXT':
        return <FileCode className="w-4 h-4 text-slate-500" />;
      case 'CSV':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: KnowledgeDocument['status']) => {
    switch (status) {
      case 'Indexed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Indexed
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600 animate-spin" />
            Processing
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Failed
          </span>
        );
    }
  };

  const typeOptions: Array<'All' | DocumentType> = ['All', 'PDF', 'DOCX', 'TXT', 'CSV'];

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 transition-all min-h-[calc(100vh-4rem)] ${
        isDraggingOver ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
      }`}
    >
      {/* Top Banner & Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#2A2F38]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Knowledge Base
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage the documents used by your AI knowledge assistant.
          </p>
        </div>

        <button
          onClick={() => {
            setDroppedFile(null);
            setUploadModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Document Drag & Drop Area (Requirement: Document drag & drop) */}
      <div
        onClick={() => {
          setDroppedFile(null);
          setUploadModalOpen(true);
        }}
        className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left ${
          isDraggingOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 shadow-md scale-[1.005]'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-[#1D2129]/60 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              {isDraggingOver ? 'Drop files now to index into vector space' : 'Drag & drop enterprise documents here'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Supports PDF, DOCX, TXT, CSV up to 25 MB • Automated chunking & 768-dim embeddings
            </div>
          </div>
        </div>

        <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#171A21] border border-slate-200 dark:border-[#2A2F38] text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs hover:text-blue-600 transition shrink-0">
          Browse Files
        </span>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-[#1D2129] p-4 rounded-xl border border-slate-200 dark:border-[#2A2F38] shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4 transition-colors">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-[#171A21] border border-slate-300 dark:border-[#2A2F38] rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white dark:focus:bg-[#171A21] transition"
          />
        </div>

        {/* Type & Department Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Format pills */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-[#2A2F38] bg-slate-50 dark:bg-[#171A21] p-1 text-xs">
            {typeOptions.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  typeFilter === type
                    ? 'bg-white dark:bg-[#1D2129] text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Department Filter dropdown */}
          <div className="relative flex items-center">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="pl-7 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#171A21] border border-slate-200 dark:border-[#2A2F38] rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Document Table */}
      <div className="bg-white dark:bg-[#1D2129] rounded-xl border border-slate-200 dark:border-[#2A2F38] shadow-2xs overflow-hidden transition-colors">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between gap-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/8" />
              </div>
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-12 text-center">
            <FolderArchive className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            {documents.length === 0 ? (
              <>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Your knowledge base is empty.
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Upload your first document to get started.
                </p>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="mt-4 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Upload Document
                </button>
              </>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No documents found.
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Try adjusting your search query or format filter.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('All');
                    setDeptFilter('All');
                  }}
                  className="mt-3 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg cursor-pointer"
                >
                  Clear Filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#2A2F38] bg-slate-50/70 dark:bg-[#171A21] text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Document</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2A2F38] text-xs sm:text-sm">
                {filteredDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-[#252B36] transition-colors group"
                  >
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                          {getDocIcon(doc.type)}
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 text-left truncate block max-w-xs sm:max-w-md cursor-pointer"
                          >
                            {doc.name}
                          </button>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {doc.size} {doc.chunksCount ? `• ${doc.chunksCount} chunks` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {doc.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {doc.department}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(doc.status)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                      {doc.updatedAt}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Inspect RAG Indexing / Vector Chunks action */}
                        <button
                          type="button"
                          onClick={() => setIndexingDoc(doc)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-md transition-colors cursor-pointer"
                          title="Inspect RAG Indexing & Vector Chunks"
                          aria-label="Inspect Indexing"
                        >
                          <Layers className="w-4 h-4" />
                        </button>

                        {/* View action */}
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-md transition-colors cursor-pointer"
                          title="View Document Details"
                          aria-label="View Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Re-index action (Shown for ADMIN role as required) */}
                        {user?.role === 'ADMIN' && (
                          <button
                            type="button"
                            onClick={() => handleReindexDoc(doc.id, doc.name)}
                            disabled={reindexingId === doc.id}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                            title="Re-index into Vector Store (Admin)"
                            aria-label="Re-index Document"
                          >
                            <RefreshCw
                              className={`w-4 h-4 ${reindexingId === doc.id ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`}
                            />
                          </button>
                        )}

                        {/* Delete action */}
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id, doc.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-md transition-colors cursor-pointer"
                          title="Delete Document"
                          aria-label="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <UploadDocumentModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setDroppedFile(null);
        }}
        onUploaded={handleUploadSuccess}
        initialFile={droppedFile}
      />

      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onInspectIndexing={(doc) => {
          setPreviewDoc(null);
          setIndexingDoc(doc);
        }}
      />

      <DocumentIndexingModal
        document={indexingDoc}
        onClose={() => setIndexingDoc(null)}
      />
    </div>
  );
};
