'use client'
import React, { useState } from 'react';
import { Loader2, Upload, FileCheck, AlertCircle, Info, Search } from 'lucide-react';


const API_BASE_URL = 'https://api.cdstr.xyz/api';

interface StatusMessageProps {
  message: string;
  type?: 'info' | 'error';
}

interface InfoSectionProps {
  propertyId: string;
  setPropertyId: (id: string) => void;
  ownershipInfo: string;
  propertyDetails: any;
  isLoading: boolean;
  handleInfoSubmit: (e: React.FormEvent) => void;
}

function InfoSection({ 
  propertyId, 
  setPropertyId, 
  ownershipInfo,
  propertyDetails,
  isLoading, 
  handleInfoSubmit 
}: InfoSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInfo = ownershipInfo
    ? ownershipInfo
        .split('\n')
        .filter(line => 
          line.toLowerCase().includes(searchTerm.toLowerCase())
        )
    : [];

  const styleOwnershipText = (text: string) => {
    const parts = text.split(/(Нотариален акт.*$)/);
    const beforeNotarialAct = parts[0];
    const notarialActAndAfter = parts[1] || '';

    const styleOwnershipPart = (text: string) => {
      if (text.includes('Няма данни за идеалните части')) {
        return <span className="text-red-600 font-bold">{text}</span>;
      }
      if (text.includes('Ид. част') && (text.includes('кв. м') || text.includes('%'))) {
        return <span className="text-green-600 font-bold">{text}</span>;
      }
      if (text.includes('Право на собственост')) {
        return <span className="text-green-600">{text}</span>;
      }
      return text;
    };

    return (
      <>
        {styleOwnershipPart(beforeNotarialAct)}
        <span className="text-gray-800">{notarialActAndAfter}</span>
      </>
    );
  };

  const parseNameAndId = (line: string) => {
    const match = line.match(/^(.+?)(?:(\d{9,10})|(\d{2}\.\d{2}\.\d{4}))(.*)$/);
    
    if (match) {
      const [_, name, id, date, rest] = match;
      return {
        name: name.trim(),
        identifier: id || date,
        rest: rest
      };
    }
    
    return {
      name: '',
      identifier: '',
      rest: line
    };
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleInfoSubmit} className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Информация за имот
        </h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <input
              type="text"
              placeholder="Идентификатор на имот"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Format: 10135.2564.494 or 10135.2564.494.1
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !propertyId}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Info className="w-4 h-4" />
            )}
            Получи информация
          </button>
        </div>
      </form>

      {(propertyDetails || ownershipInfo) && (
        <div className="space-y-6">
          {/* Property Details Section */}
          {propertyDetails && Object.keys(propertyDetails).length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 text-center">Детайли за имота</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Object.entries(propertyDetails).map(([title, content]) => (
                    <div key={title} className="border-b border-gray-100 pb-4">
                      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
                      <p className="text-gray-600">{String(content)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ownership Information Section */}
          {ownershipInfo && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 text-center">
                  Данни за собственост {propertyId ? `(${propertyId})` : ''}
                </h2>
              </div>
              <div className="p-6">
                <div className="mb-4 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Търсене в резултатите..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  {filteredInfo.map((line, index) => {
                    if (!line.trim()) return null;

                    const { name, identifier, rest } = parseNameAndId(line);

                    return (
                      <div key={index} className="text-sm leading-relaxed border-b border-gray-100 pb-2">
                        {name && <span className="font-bold mr-2">{name}</span>}
                        {identifier && <span className="text-gray-600 mr-2">{identifier}</span>}
                        {styleOwnershipText(rest)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Replace with your credentials
    if (username === '1' && password === '3') {
      onLogin();
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
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
      selectedFiles.forEach(file => formData.append('files', file));

      const response = await fetch(`${API_BASE_URL}/extract`, {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response format from server');
      }

      if (!response.ok) {
        throw new Error(result.error || 'Extract process failed');
      }

      setExtractStatus('success');
      setSubmitEnabled(true);
      onStatusChange('PDF files processed successfully');
      onLogAdd('PDF extraction completed - ready for submission');

    } catch (error) {
      console.error('Extract error:', error);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitEnabled && !isLoading) {
      handleSubmitToShema();
    } else if (selectedFiles.length > 0 && !isLoading) {
      handleExtract();
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
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
              type="button"
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
            type="button"
            onClick={handleExtract}
            disabled={selectedFiles.length === 0 || isLoading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
            Process PDFs
          </button>

          <button
            type="submit"
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
      </form>
    </div>
  );
}

export default function AutomationDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [propertyId, setPropertyId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('single');
  const [logs, setLogs] = useState<string[]>([]);
  const [ownershipInfo, setOwnershipInfo] = useState('');
  const [propertyDetails, setPropertyDetails] = useState<any>(null);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleInfoProcess = async () => {
    if (!propertyId) {
      setStatus('Property ID is required');
      return;
    }

    try {
      setIsLoading(true);
      setStatus('Retrieving property information...');
      addLog(`Starting info process for property ID: ${propertyId}`);

      const response = await fetch(`${API_BASE_URL}/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId })
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve property information');
      }

      const data = await response.json();
      setOwnershipInfo(data.ownership_details || 'Няма данни за собственост');
      setPropertyDetails(data.property_details || null);
      setStatus('Property information retrieved successfully!');
      addLog(`Info process completed for property: ${propertyId}`);
    } catch (error) {
      if (error instanceof Error) {
        setStatus(`Error: ${error.message}`);
        addLog(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
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

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || 'Submission failed');
      }

      setStatus('Submission successful');
      addLog('Request submitted successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`Error in SKC process: ${errorMessage}`);
      addLog(`Error: ${errorMessage}`);
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
      addLog(`Starting skici process for property ID: ${propertyId}`);

      const response = await fetch(`${API_BASE_URL}/skici`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId })
      });

      if (!response.ok) throw new Error('Skici process failed');

      setStatus('Request submitted successfully!');
      addLog(`Skici process completed for property: ${propertyId}`);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      handleSkicaProcess();
    }
  };

  const handleSkcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && selectedFile) {
      handleSkcProcess();
    }
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && propertyId) {
      handleInfoProcess();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Улеснен Кадастър</h1>
        </div>

        <div className="flex justify-center space-x-4 mb-6">
          {['batch', 'single', 'skc', 'info'].map((tab) => (
            <button
              key={tab}
              onClick={() => tab !== 'batch' && setActiveTab(tab)}
              className={`px-6 py-2 text-lg font-semibold rounded-t-lg transition-colors ${
                tab === 'batch' 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : activeTab === tab
                    ? 'bg-white text-blue-600 border-t-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'batch' ? 'Пререгистрация (временно недостъпно)' :
               tab === 'single' ? 'Схема / Скица' :
               tab === 'skc' ? 'Схема / Скица с Пререгистрация' :
               'Информация за имот'}
              {tab === 'batch' && (
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Coming Soon</span>
              )}
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
            <form onSubmit={handleSingleSubmit} className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Подаване на схема или скица</h2>
              <input
                type="text"
                placeholder="Въведи идентификатор"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
              >
                Подай заявление
              </button>
            </form>
          )}

          {activeTab === 'skc' && (
            <form onSubmit={handleSkcSubmit} className="space-y-6">
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
                      type="button"
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
                  type="submit"
                  disabled={isLoading || !selectedFile}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                >
                  Подаване на заявление
                </button>
              </div>
            </form>
          )}

          {activeTab === 'info' && (
            <InfoSection
              propertyId={propertyId}
              setPropertyId={setPropertyId}
              ownershipInfo={ownershipInfo}
              propertyDetails={propertyDetails}
              isLoading={isLoading}
              handleInfoSubmit={handleInfoSubmit}
            />
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