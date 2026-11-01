import React, { useState, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import { documentService, UploadProgressUpdate } from '../../services/documentService';
import { KnowledgeDocument } from '../../types';
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileCheck,
} from 'lucide-react';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: (newDoc: KnowledgeDocument) => void;
  initialFile?: File | null;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onUploaded,
  initialFile,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile || null);
  const [department, setDepartment] = useState<string>('Engineering');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<UploadProgressUpdate | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialFile) {
      setSelectedFile(initialFile);
    }
  }, [initialFile]);

  if (!isOpen) return null;

  const allowedExtensions = ['pdf', 'docx', 'txt', 'csv'];
  const maxBytes = 25 * 1024 * 1024; // 25 MB

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      setErrorMessage('Unsupported file format. Please upload PDF, DOCX, TXT, or CSV.');
      showToast('Unsupported file format.', 'error');
      return;
    }

    if (file.size > maxBytes) {
      setErrorMessage('File size exceeds the 25 MB limit.');
      showToast('File too large (Max 25 MB).', 'error');
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const newDoc = await documentService.uploadDocument(
        selectedFile,
        department,
        (progress) => {
          setUploadStatus(progress);
        }
      );

      showToast('Document uploaded successfully.', 'success');
      showToast('Document indexing completed.', 'success');
      onUploaded(newDoc);
      setTimeout(() => {
        handleClose();
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setErrorMessage(msg);
      showToast('Upload failure. Please try again.', 'error');
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setSelectedFile(null);
    setUploadStatus(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1D2129] rounded-2xl border border-slate-200 dark:border-[#2A2F38] max-w-lg w-full p-6 shadow-xl animate-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#2A2F38]">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Upload Document</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Add documents to the enterprise knowledge base for RAG querying.
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Drag and drop zone */}
        {!isUploading && !uploadStatus && (
          <div className="mt-5 space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
                  : 'border-slate-300 dark:border-[#2A2F38] hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-[#171A21]/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Drag your document here
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                or <span className="text-blue-600 dark:text-blue-400 font-medium hover:underline">browse files</span> from your computer
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3">
                Supported: PDF, DOCX, TXT, CSV (Maximum: 25 MB)
              </p>
            </div>

            {/* Department selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Target Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full py-2 px-3 text-sm bg-white dark:bg-[#171A21] border border-slate-300 dark:border-[#2A2F38] rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="Human Resources">Human Resources</option>
                <option value="Security & IT">Security &amp; IT</option>
                <option value="Product & Operations">Product &amp; Operations</option>
                <option value="Legal & Compliance">Legal &amp; Compliance</option>
                <option value="Engineering">Engineering</option>
                <option value="Finance & Admin">Finance &amp; Admin</option>
              </select>
            </div>

            {/* Selected File Details */}
            {selectedFile && (
              <div className="p-3.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {selectedFile.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {selectedFile.name.split('.').pop()?.toUpperCase()} • {formatFileSize(selectedFile.size)}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Upload Simulation in Progress */}
        {uploadStatus && (
          <div className="mt-6 py-4 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                {uploadStatus.step === 'completed' ? (
                  <FileCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Loader2 className="w-6 h-6 animate-spin" />
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {uploadStatus.label}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {selectedFile?.name} ({formatFileSize(selectedFile?.size || 0)})
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadStatus.progress}%` }}
              />
            </div>

            {/* Pipeline Stage Indicators */}
            <div className="bg-slate-50 dark:bg-[#171A21] rounded-xl p-3 border border-slate-200 dark:border-[#2A2F38] text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>1. Uploading</span>
                <span className={uploadStatus.progress >= 20 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {uploadStatus.progress >= 20 ? '✓' : '...'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>2. Extracting text</span>
                <span className={uploadStatus.progress >= 45 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {uploadStatus.progress >= 45 ? '✓' : '...'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>3. Creating embeddings</span>
                <span className={uploadStatus.progress >= 75 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {uploadStatus.progress >= 75 ? '✓' : '...'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>4. Indexing knowledge</span>
                <span className={uploadStatus.progress >= 95 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {uploadStatus.progress >= 95 ? '✓' : '...'}
                </span>
              </div>
              <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 pt-1 border-t border-slate-200 dark:border-[#2A2F38]">
                <span>Indexed successfully</span>
                <span className={uploadStatus.step === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                  {uploadStatus.step === 'completed' ? '✓ Ready' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#2A2F38] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          {!uploadStatus && (
            <button
              type="button"
              onClick={handleUploadSubmit}
              disabled={!selectedFile || isUploading}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              <span>Upload</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
