"use client"

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

const LOADING = '…loading';

export default function Home() {
    const [idea, setIdea] = useState<string>(LOADING);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setError(null);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/481d7f8a-7d8c-4f4c-ba8e-9994d78662e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pages/index.tsx:useEffect',message:'EventSource creating',data:{url:'/api'},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
        // #endregion
        const evt = new EventSource('/api');
        let buffer = '';

        evt.onopen = () => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/481d7f8a-7d8c-4f4c-ba8e-9994d78662e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pages/index.tsx:onopen',message:'EventSource open',data:{readyState:evt.readyState},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
            // #endregion
        };
        evt.onmessage = (e) => {
            if (e.data === '[DONE]') return;
            try {
                const parsed = JSON.parse(e.data);
                if (parsed && typeof parsed.error === 'string') {
                    setError(parsed.error);
                    evt.close();
                    return;
                }
            } catch {
                // not JSON, treat as content
            }
            buffer += e.data;
            setIdea(buffer);
        };
        evt.onerror = () => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/481d7f8a-7d8c-4f4c-ba8e-9994d78662e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pages/index.tsx:onerror',message:'SSE error',data:{readyState:evt.readyState,hasContent:buffer.length>0},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
            fetch('http://127.0.0.1:7242/ingest/481d7f8a-7d8c-4f4c-ba8e-9994d78662e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pages/index.tsx:onerror',message:'SSE error',data:{readyState:evt.readyState,hasContent:buffer.length>0},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
            // #endregion
            evt.close();
            // Only show connection error if we never received any content (e.g. real failure).
            // If we got content, the stream likely ended normally and some browsers fire onerror on close.
            if (buffer.length === 0) {
                console.error('SSE error, closing');
                setError('Could not connect. Set OPENAI_API_KEY in .env.local and restart the dev server.');
            }
        };

        return () => { evt.close(); };
    }, []);

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <header className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                        Business Idea Generator
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        AI-powered innovation at your fingertips
                    </p>
                </header>

                {/* Content Card */}
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-95">
                        {error ? (
                            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-red-700 dark:text-red-300">
                                {error}
                            </div>
                        ) : idea === LOADING ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-pulse text-gray-400">
                                    Generating your business idea...
                                </div>
                            </div>
                        ) : (
                            <div className="markdown-content text-gray-700 dark:text-gray-300">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                >
                                    {idea}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}