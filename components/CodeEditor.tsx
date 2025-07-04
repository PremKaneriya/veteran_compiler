"use client";

import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  Play,
  Moon,
  Sun,
  Save,
  FolderOpen,
  Loader2,
  Github,
  ChevronDown,
  ChevronUp,
  X,
  Menu,
} from "lucide-react";

interface CodeSnippet {
  id: number;
  title: string;
  code: string;
  output: string | null;
  createdAt: string;
}

export default function MinimalCodeEditor() {
  const [code, setCode] = useState(`// JavaScript Online Compiler
console.log("Hello, World!");

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci(7):", fibonacci(7));`);

  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSnippets, setIsLoadingSnippets] = useState(false);
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [showSnippets, setShowSnippets] = useState(false);
  const [title, setTitle] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOutputVisible, setIsOutputVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const editorRef = useRef(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadSnippets = async () => {
    setIsLoadingSnippets(true);
    try {
      const response = await fetch("/api/snippets");
      const data = await response.json();
      setSnippets(data);
    } catch (error) {
      console.error("Failed to load snippets:", error);
    } finally {
      setIsLoadingSnippets(false);
    }
  };

  const executeCode = async () => {
    setIsExecuting(true);
    setOutput("");

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      console.log("Response status:", response.status);

      const result = await response.json();

      if (result.error) {
        setOutput(`Error: ${result.error}`);
      } else {
        setOutput(result.output);
      }
    } catch (error) {
      setOutput("Error: Failed to execute code");
    } finally {
      setIsExecuting(false);
    }
  };

  const saveCode = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, code, output }),
      });

      const newSnippet = await response.json();
      setSnippets((prev) => [newSnippet, ...prev]);
      setTitle("");
    } catch (error) {
      alert("Failed to save code snippet");
    } finally {
      setIsSaving(false);
    }
  };

  const loadSnippet = (snippet: CodeSnippet) => {
    setCode(snippet.code);
    setOutput(snippet.output || "");
    setShowSnippets(false);
    setIsMobileMenuOpen(false);
  };

  const theme = isDark ? "dark" : "light";
  const bgClass = isDark ? "bg-gray-900" : "bg-gray-50";
  const cardBgClass = isDark ? "bg-gray-800" : "bg-white";
  const borderClass = isDark ? "border-gray-700" : "border-gray-200";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const textSecondaryClass = isDark ? "text-gray-300" : "text-gray-600";

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} transition-colors duration-200`}>
      {/* Header */}
      <div className={`border-b ${borderClass} ${cardBgClass} sticky top-0 z-20`}>
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center space-x-3">
            <h1 className="text-lg sm:text-xl font-semibold">Veteran JS Editor</h1>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-md hover:${
                isDark ? "bg-gray-700" : "bg-gray-100"
              } transition-colors`}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* GitHub Link */}
            <a
              href="https://github.com/PremKaneriya"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md hover:${
                isDark ? "bg-gray-700" : "bg-gray-100"
              } transition-colors`}
              title="View on GitHub"
            >
              <Github size={16} />
              <span className="text-sm font-medium hidden lg:inline">GitHub</span>
            </a>

            {/* Save Controls */}
            <input
              type="text"
              placeholder="Enter title to save..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`px-3 py-1.5 rounded-md text-sm border ${borderClass} ${cardBgClass} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32 lg:w-48`}
            />

            {title && (
              <button
                onClick={saveCode}
                disabled={isSaving}
                className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white rounded-md text-sm transition-colors"
              >
                {isSaving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                <span className="hidden lg:inline">Save</span>
              </button>
            )}

            {/* Snippets */}
            <button
              onClick={() => {
                setShowSnippets(!showSnippets);
                if (!showSnippets) {
                  loadSnippets();
                }
              }}
              className={`p-2 rounded-md hover:${
                isDark ? "bg-gray-700" : "bg-gray-100"
              } transition-colors`}
            >
              <FolderOpen size={18} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-md hover:${
                isDark ? "bg-gray-700" : "bg-gray-100"
              } transition-colors`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {/* Mobile Run Button */}
          <button
            onClick={executeCode}
            disabled={isExecuting}
            className="md:hidden flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white rounded-md text-sm transition-colors"
          >
            <Play size={14} />
          </button>

          {/* Desktop Run Button */}
          <button
            onClick={executeCode}
            disabled={isExecuting}
            className="hidden md:flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white rounded-md transition-colors"
            title="Run code (Ctrl+Enter)"
          >
            <Play size={16} />
            <span>{isExecuting ? "Running..." : "Run"}</span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t ${borderClass} p-4 space-y-3`}>
            {/* GitHub Link */}
            <a
              href="https://github.com/PremKaneriya"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md hover:${
                isDark ? "bg-gray-700" : "bg-gray-100"
              } transition-colors`}
            >
              <Github size={16} />
              <span className="text-sm font-medium">GitHub</span>
            </a>

            {/* Save Controls */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter title to save..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 rounded-md text-sm border ${borderClass} ${cardBgClass} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {title && (
                <button
                  onClick={saveCode}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white rounded-md text-sm transition-colors"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Save</span>
                </button>
              )}
            </div>

            {/* Other Controls */}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setShowSnippets(!showSnippets);
                  if (!showSnippets) {
                    loadSnippets();
                  }
                }}
                className={`flex-1 flex items-center justify-center space-x-2 p-2 rounded-md hover:${
                  isDark ? "bg-gray-700" : "bg-gray-100"
                } transition-colors`}
              >
                <FolderOpen size={18} />
                <span className="text-sm">Snippets</span>
              </button>

              <button
                onClick={() => setIsDark(!isDark)}
                className={`flex-1 flex items-center justify-center space-x-2 p-2 rounded-md hover:${
                  isDark ? "bg-gray-700" : "bg-gray-100"
                } transition-colors`}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                <span className="text-sm">Theme</span>
              </button>
            </div>

            {/* Mobile Output Toggle */}
            <button
              onClick={() => setIsOutputVisible(!isOutputVisible)}
              className={`w-full flex items-center justify-center space-x-2 p-2 rounded-md hover:${
                isDark ? "bg-gray-700" : "bg-gray-100"
              } transition-colors`}
            >
              {isOutputVisible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              <span className="text-sm">{isOutputVisible ? 'Hide' : 'Show'} Output</span>
            </button>
          </div>
        )}
      </div>

      {/* Snippets Dropdown */}
      {showSnippets && (
        <div
          className={`absolute top-16 sm:top-20 right-3 sm:right-6 w-72 sm:w-80 ${cardBgClass} border ${borderClass} rounded-lg shadow-lg z-10 max-h-96`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Saved Snippets</h3>
              <button
                onClick={() => setShowSnippets(false)}
                className={`p-1 rounded-md hover:${
                  isDark ? "bg-gray-700" : "bg-gray-100"
                } transition-colors`}
              >
                <X size={16} />
              </button>
            </div>
            {isLoadingSnippets ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {snippets.length === 0 ? (
                  <div className={`text-center py-8 ${textSecondaryClass}`}>
                    No saved snippets yet
                  </div>
                ) : (
                  snippets.map((snippet) => (
                    <div
                      key={snippet.id}
                      className={`p-3 rounded-md cursor-pointer hover:${
                        isDark ? "bg-gray-700" : "bg-gray-50"
                      } transition-colors`}
                      onClick={() => loadSnippet(snippet)}
                    >
                      <div className="font-medium text-sm truncate">{snippet.title}</div>
                      <div className={`text-xs ${textSecondaryClass} mt-1`}>
                        {new Date(snippet.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-65px)] sm:h-[calc(100vh-73px)]">
        {/* Code Editor */}
        <div className={`flex-1 flex flex-col ${isMobile && !isOutputVisible ? 'h-full' : 'h-1/2 md:h-full'}`}>
          <div className={`px-3 sm:px-4 py-2 border-b ${borderClass} ${cardBgClass} flex items-center justify-between`}>
            <span className={`text-sm ${textSecondaryClass}`}>Code</span>
            {isMobile && (
              <button
                onClick={() => setIsOutputVisible(!isOutputVisible)}
                className={`p-1 rounded-md hover:${
                  isDark ? "bg-gray-700" : "bg-gray-100"
                } transition-colors`}
              >
                {isOutputVisible ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={(value) => setCode(value || "")}
              theme={isDark ? "vs-dark" : "light"}
              options={{
                minimap: { enabled: false },
                fontSize: isMobile ? 12 : 14,
                wordWrap: "on",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                renderLineHighlight: "none",
                occurrencesHighlight: "off",
                selectionHighlight: false,
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                lineNumbers: isMobile ? "off" : "on",
                folding: !isMobile,
                lineDecorationsWidth: isMobile ? 0 : undefined,
                lineNumbersMinChars: isMobile ? 0 : undefined,
              }}
            />
          </div>
        </div>

        {/* Divider - Hidden on mobile */}
        <div className={`hidden md:block w-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>

        {/* Output */}
        {(isOutputVisible || !isMobile) && (
          <div className={`flex-1 flex flex-col ${isMobile ? 'h-1/2 border-t' : 'h-full'} ${borderClass}`}>
            <div className={`px-3 sm:px-4 py-2 border-b ${borderClass} ${cardBgClass}`}>
              <span className={`text-sm ${textSecondaryClass}`}>Output</span>
            </div>
            <div className={`flex-1 p-3 sm:p-4 ${cardBgClass} overflow-auto custom-scrollbar min-h-0`}>
              <pre
                className={`font-mono text-xs sm:text-sm ${
                  isDark ? "text-green-400" : "text-green-600"
                } whitespace-pre-wrap break-words`}
              >
                {output || 'Click "Run" to see output here...'}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Add custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDark ? '#374151' : '#f3f4f6'};
          border-radius: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark ? '#10B981' : '#059669'};
          border-radius: 8px;
          border: 2px solid ${isDark ? '#374151' : '#f3f4f6'};
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? '#059669' : '#047857'};
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${isDark ? '#10B981 #374151' : '#059669 #f3f4f6'};
        }
        
        @media (max-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
        }
      `}</style>
    </div>
  );
}