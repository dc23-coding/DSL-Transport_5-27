// src/components/pages/FileUploadsPage.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function FileUploadsPage() {
  const [uploads, setUploads] = useState([]);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('BOL');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchUploads = async () => {
    const user = supabase.auth.user();
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false });
    if (error) setErrorMsg(error.message);
    else setUploads(data);
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setErrorMsg('Please select a file.');
    if (file.size > 10 * 1024 * 1024) return setErrorMsg('Max file size is 10 MB.');

    setLoading(true);
    setErrorMsg('');
    try {
      const user = supabase.auth.user();
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { upsert: false });
      if (upErr) throw upErr;

      const { publicURL } = supabase
        .storage
        .from('documents')
        .getPublicUrl(filePath);

      const { error: dbErr } = await supabase
        .from('uploads')
        .insert([
          { user_id: user.id, file_url: publicURL, file_type: fileType }
        ]);
      if (dbErr) throw dbErr;

      setFile(null);
      fetchUploads();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (upload) => {
    setLoading(true);
    setErrorMsg('');
    try {
      // derive storage path
      const path = upload.file_url.split('/documents/')[1];
      await supabase.storage.from('documents').remove([path]);
      await supabase.from('uploads').delete().eq('id', upload.id);
      fetchUploads();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto my-6">
      <CardHeader>
        <h2 className="text-xl font-semibold">Documents</h2>
      </CardHeader>
      <CardContent>
        {errorMsg && <p className="text-destructive mb-4">{errorMsg}</p>}

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block mb-1">Select File</label>
            <input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">File Type</label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="border rounded p-2 w-full"
            >
              <option value="BOL">BOL</option>
              <option value="Paperwork">Paperwork</option>
              <option value="Receipt">Receipt</option>
            </select>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <motion.span animate={{ rotate: 360 }} transition={{ loop: Infinity, duration: 1 }}>⏳</motion.span> : 'Upload Document'}
          </Button>
        </form>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Type</th>
                <th className="p-2">Uploaded At</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((u, i) => (
                <tr key={u.id} className={i % 2 === 0 ? 'bg-surface-light' : ''}>
                  <td className="p-2">{u.file_url.split('/').pop()}</td>
                  <td className="p-2">{u.file_type}</td>
                  <td className="p-2">{new Date(u.uploaded_at).toLocaleString()}</td>
                  <td className="p-2 flex space-x-2">
                    <Button size="sm" onClick={() => window.open(u.file_url, '_blank')}>Download</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(u)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

FileUploadsPage.propTypes = {};
