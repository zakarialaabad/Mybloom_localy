'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TestIsGiftPage() {
  const searchParams = useSearchParams();
  const [debug, setDebug] = useState<Record<string, any>>({});
  const [apiResponse, setApiResponse] = useState<Record<string, any>>({});

  useEffect(() => {
    // Capture what we receive from searchParams
    const isGift = searchParams.get('is_gift');
    const allParams = Object.fromEntries(searchParams.entries());

    setDebug({
      url: typeof window !== 'undefined' ? window.location.href : 'N/A',
      isGiftParam: isGift,
      allSearchParams: allParams,
      timestamp: new Date().toISOString(),
    });

    // Test the backend API
    const testAPI = async () => {
      try {
        const testUrl = '/api/v1/products/test/is-gift?is_gift=1';
        console.log('[TEST PAGE] Calling:', testUrl);
        const response = await fetch(testUrl);
        const data = await response.json();
        setApiResponse(data);
      } catch (err) {
        setApiResponse({ error: String(err) });
      }
    };

    testAPI();
  }, [searchParams]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">PACK Filter Diagnostic</h1>

      <section className="mb-8 p-4 bg-blue-50 rounded">
        <h2 className="text-xl font-bold mb-4">Frontend Search Params Debug</h2>
        <pre className="bg-white p-4 rounded overflow-auto text-sm">
          {JSON.stringify(debug, null, 2)}
        </pre>
        <p className="mt-4 text-sm">
          <strong>Expected:</strong> is_gift should be "true" if clicking PACK tab<br />
          <strong>Check:</strong> Look at browser console for buildFilterParams logs
        </p>
      </section>

      <section className="mb-8 p-4 bg-green-50 rounded">
        <h2 className="text-xl font-bold mb-4">Backend API Test Response</h2>
        <pre className="bg-white p-4 rounded overflow-auto text-sm">
          {JSON.stringify(apiResponse, null, 2)}
        </pre>
        <p className="mt-4 text-sm">
          <strong>What to check:</strong>
          <ul className="list-disc ml-5 mt-2">
            <li>request.is_gift_filled should be "true" when is_gift=1 sent</li>
            <li>database.products_with_is_gift_true should be 1</li>
            <li>database.filtered_results should be 1 when filter applied</li>
          </ul>
        </p>
      </section>

      <section className="mb-8 p-4 bg-purple-50 rounded">
        <h2 className="text-xl font-bold mb-4">Manual Test Instructions</h2>
        <ol className="list-decimal ml-5 space-y-2 text-sm">
          <li>Open browser DevTools (F12)</li>
          <li>Go to Console tab</li>
          <li>Look for logs starting with [buildFilterParams] or [collection page]</li>
          <li>Click PACK tab and check if is_gift appears in the logs</li>
          <li>Check the API Response above - it shows what backend receives</li>
          <li>If filtered_results is 1, backend works! Problem is frontend display</li>
          <li>If filtered_results is 82, backend receives params but doesn't filter</li>
          <li>If is_gift_filled is false, frontend isn't sending the parameter</li>
        </ol>
      </section>

      <section className="p-4 bg-yellow-50 rounded">
        <h2 className="text-xl font-bold mb-4">Current URL</h2>
        <p className="font-mono text-sm break-all">
          {typeof window !== 'undefined' ? window.location.href : 'N/A'}
        </p>
        <p className="mt-2 text-sm">
          If this doesn't end with ?is_gift=true after clicking PACK, the link isn't working
        </p>
      </section>
    </div>
  );
}
