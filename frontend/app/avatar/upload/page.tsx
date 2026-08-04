'use client';

import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import { useState, useRef } from 'react';

export default function AvatarUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-6">
        <h1 className="text-2xl font-bold text-amber-400 text-center">Upload Your Avatar</h1>

        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-xl text-red-200 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setError(null);

            if (!inputFileRef.current?.files?.length) {
              setError('No file selected');
              return;
            }

            const file = inputFileRef.current.files[0];
            setLoading(true);

            try {
              const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/avatar/upload',
              });

              setBlob(newBlob);
            } catch (err: any) {
              setError(err.message || 'Failed to upload file to Vercel Blob.');
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4"
        >
          <input
            name="file"
            ref={inputFileRef}
            type="file"
            accept="image/*"
            required
            className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-slate-900 hover:file:bg-amber-400 cursor-pointer"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 px-4 rounded-xl transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Uploading to Vercel Blob...' : 'Upload File'}
          </button>
        </form>

        {blob && (
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-700 text-sm space-y-2 break-all">
            <p className="text-emerald-400 font-medium">✓ File Uploaded Successfully!</p>
            <p className="text-slate-300">
              Blob URL: <a href={blob.url} target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">{blob.url}</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
