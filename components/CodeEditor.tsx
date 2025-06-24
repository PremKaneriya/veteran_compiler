'use client';

import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, FileText, Loader2 } from 'lucide-react';

interface CodeSnippet {
  id: number;
  title: string;
  code: string;
  output: string | null;
  createdAt: string;
}

export default function CodeEditor() {
  const [code, setCode] = useState(`// Welcome to JavaScript Online Compiler
console.log("Hello, World!");

// Try some JavaScript features
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled numbers:", doubled);

// Function example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci(7):", fibonacci(7));`);
  
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [title, setTitle] = useState('');
  const editorRef = useRef(null);

  const executeCode = async () => {
    setIsExecuting(true);
    setOutput('');
    
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      console.log('Response status:', response.status);
      
      const result = await response.json();
      
      if (result.error) {
        setOutput(`Error: ${result.error}`);
      } else {
        setOutput(result.output);
      }
    } catch (error) {
      setOutput('Error: Failed to execute code');
    } finally {
      setIsExecuting(false);
    }
  };

  const saveCode = async () => {
    if (!title.trim()) {
      alert('Please enter a title for your code snippet');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, code, output }),
      });
      
      const newSnippet = await response.json();
      setSnippets(prev => [newSnippet, ...prev]);
      setTitle('');
    } catch (error) {
      alert('Failed to save code snippet');
    } finally {
      setIsSaving(false);
    }
  };

  const loadSnippets = async () => {
    try {
      const response = await fetch('/api/snippets');
      const data = await response.json();
      setSnippets(data);
    } catch (error) {
      console.error('Failed to load snippets:', error);
    }
  };

  const loadSnippet = (snippet: CodeSnippet) => {
    setCode(snippet.code);
    setOutput(snippet.output || '');
    setTitle(snippet.title);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          <u className="text-blue-400">Veteran</u> JavaScript Online Compiler</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with saved snippets */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Saved Snippets</h2>
                <button
                  onClick={loadSnippets}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <FileText size={20} />
                </button>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {snippets.map((snippet) => (
                  <div
                    key={snippet.id}
                    className="p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => loadSnippet(snippet)}
                  >
                    <div className="font-medium text-sm">{snippet.title}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(snippet.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main editor area */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              {/* Controls */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Enter title to save..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="px-3 py-1 bg-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={saveCode}
                    disabled={isSaving || !title.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded transition-colors"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    <span>Save</span>
                  </button>
                </div>
                
                <button
                  onClick={executeCode}
                  disabled={isExecuting}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded transition-colors"
                >
                  {isExecuting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                  <span>Run Code</span>
                </button>
              </div>

              {/* Editor */}
              <div className="h-96">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                  }}
                />
              </div>

              {/* Output */}
              <div className="border-t border-gray-700">
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Output:</h3>
                  <pre className="bg-gray-900 p-4 rounded text-green-400 font-mono text-sm overflow-x-auto whitespace-pre-wrap min-h-32">
                    {output || 'Click "Run Code" to see output here...'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}