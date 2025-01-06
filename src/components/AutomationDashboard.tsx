'use client'
import React, { useState } from 'react';
import { Loader2, Upload, FileCheck, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

interface StatusMessageProps {
  message: string;
  type?: 'info' | 'error';
}

function StatusMessage({ message, type = 'info' }: StatusMessageProps) {
  const bgColor = type === 'error' ? 'bg-red-50' : 'bg-blue-50';
  const textColor = type === 'error' ? 'text-red-700' : 'text-blue-700';
  const borderColor = type === 'error' ? 'border-red-200' : 'border-blue-200';

  return (
    <div className={`mt-6 p-4 rounded-lg ${bgColor} border ${borderColor}`}>
      <p className={textColor}>{message}</p>
    </div>
  );
}

interface BatchProcessingProps {
  onStatusChange: (status: string) => void;
  onLogAdd: (message: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

function BatchProcessing({ onStatusChange, onLogAdd, isLoading, setIsLoading }: BatchProcessingProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [extractStatus, setExtractStatus] = useState<'success' | 'error' | null>(null);
  const [submitEnabled, setSubmitEnabled] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    setExtractStatus(null);
    setSubmitEnabled(false);
    onLogAdd(`Selected ${files.length} PDF files`);
  };

  const handleExtract = async () => {
    try {
      setIsLoading(true);
      onStatusChange('Processing PDF files...');
      onLogAdd('Starting PDF extraction process');

      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('files[]', file));

      const response = await fetch(`${API_BASE_URL}/extract`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Extract process failed');

      const _result = await response.json();
      setExtractStatus('success');
      setSubmitEnabled(true);
      onStatusChange('PDF files processed successfully');
      onLogAdd('PDF extraction completed - ready for submission');
    } catch (error) {
      setExtractStatus('error');
      setSubmitEnabled(false);
      onStatusChange(`Error processing PDFs: ${error instanceof Error ? error.message : 'Unknown error'}`);
      onLogAdd(`Error during extraction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitToShema = async () => {
    try {
      setIsLoading(true);
      onStatusChange('Submitting to cadastre system...');
      onLogAdd('Starting submission to cadastre');

      const response = await fetch(`${API_BASE_URL}/shema`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Submission process failed');

      const _result = await response.json();
      onStatusChange('Successfully submitted to cadastre system');
      onLogAdd('Cadastre submission completed successfully');
    } catch (error) {
      onStatusChange(`Error submitting to cadastre: ${error instanceof Error ? error.message : 'Unknown error'}`);
      onLogAdd(`Error during submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* File Upload Section */}
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
          <input
            id="file-input"
            type="file"
            multiple
            accept=".pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <button
              onClick={() => document.getElementById('file-input')?.click()}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Select PDF Files
            </button>
            {selectedFiles.length > 0 && (
              <p className="text-sm text-gray-600">
                {selectedFiles.length} files selected
              </p>
            )}
          </div>
        </div>

        {/* Processing Controls */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleExtract}
            disabled={selectedFiles.length === 0 || isLoading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
            Process PDFs
          </button>

          <button
            onClick={handleSubmitToShema}
            disabled={!submitEnabled || isLoading}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Submit to Cadastre
          </button>
        </div>

        {/* Status Messages */}
        {extractStatus === 'success' && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-200">
            <FileCheck className="w-4 h-4 text-green-600" />
            <p className="text-green-700">
              PDF files processed successfully. Ready for submission.
            </p>
          </div>
        )}

        {extractStatus === 'error' && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-red-700">
              Error processing PDF files. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AutomationDashboard() {
  const [propertyId, setPropertyId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('batch');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      addLog(`Selected file: ${file.name}`);
    }
  };

  const handleSkcProcess = async () => {
    if (!propertyId || !selectedFile) {
      setStatus('Please enter Property ID and select a file');
      return;
    }

    try {
      setIsLoading(true);
      setStatus('Processing request...');
      addLog(`Starting submission process for property ID: ${propertyId}`);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('propertyId', propertyId);

      const response = await fetch(`${API_BASE_URL}/skc`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Submission failed');

      setStatus('Submission successful');
      addLog('Request submitted successfully!');
    } catch (error) {
      setStatus(`Error in SKC process: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkicaProcess = async () => {
    if (!propertyId) {
      setStatus('Property ID is required');
      return;
    }

    try {
      setIsLoading(true);
      setStatus('Processing request...');
      addLog(`Starting skica process for property ID: ${propertyId}`);

      const response = await fetch(`${API_BASE_URL}/skica`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId })
      });

      if (!response.ok) throw new Error('Skica process failed');

      setStatus('Request submitted successfully!');
      addLog(`Skica process completed for property: ${propertyId}`);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Улеснен Кадастър</h1>
        </div>

        <div className="flex justify-center space-x-4 mb-6">
          {['batch', 'single', 'skc'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-lg font-semibold rounded-t-lg transition-colors ${activeTab === tab
                  ? 'bg-white text-blue-600 border-t-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab === 'batch' ? 'Пререгистрация' :
                tab === 'single' ? 'Схема / Скица' : 'Схема / Скица с Пререгистрация'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === 'batch' && (
            <BatchProcessing
              onStatusChange={setStatus}
              onLogAdd={addLog}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}

          {activeTab === 'single' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Подаване на схема или скица</h2>
              <input
                type="text"
                placeholder="Въведи идентификатор"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
              />
              <button
                onClick={handleSkicaProcess}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
              >
                Подай заявление
              </button>
            </div>
          )}

          {activeTab === 'skc' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Подаване на заявление за схема / скица с пререгистрация
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Идентификатор на имот"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                />
                
                {/* File Upload Section */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    id="skc-file-input"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <button
                      onClick={() => document.getElementById('skc-file-input')?.click()}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Upload Document
                    </button>
                    {selectedFile && (
                      <p className="text-sm text-gray-600">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleSkcProcess}
                  disabled={isLoading || !selectedFile}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                >
                  Подаване на заявление
                </button>
              </div>
            </div>
          )}
        </div>

        {status && (
          <StatusMessage
            message={status}
            type={status.toLowerCase().includes('error') ? 'error' : 'info'}
          />
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Processing Log</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm h-48 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg flex items-center space-x-4">
              <Loader2 className="animate-spin" />
              <p>Processing...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}