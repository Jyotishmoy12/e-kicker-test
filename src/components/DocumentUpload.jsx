import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { Trash2, Upload, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const DocumentUpload = () => {
  const [documents, setDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const documentsCollection = collection(db, 'r&d-documents');
        const documentSnapshot = await getDocs(documentsCollection);
        const documentList = documentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDocuments(documentList);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchDocuments();
  }, []);

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!documentFile) {
      toast.error('Please select a PDF file');
      return;
    }

    if (!documentFile.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', documentFile);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('resource_type', 'raw');
      formData.append('flags', 'attachment');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const pdfUrl = data.secure_url;

      const docRef = await addDoc(collection(db, 'r&d-documents'), {
        ...newDocument,
        fileUrl: pdfUrl,
        fileName: documentFile.name,
        uploadedAt: new Date().toISOString(),
        uploadedBy: auth.currentUser?.email || 'Unknown',
        mimeType: documentFile.type,
        fileSize: documentFile.size,
      });

      setDocuments((prev) => [
        ...prev,
        { id: docRef.id, ...newDocument, fileUrl: pdfUrl, fileName: documentFile.name },
      ]);

      setNewDocument({ title: '', description: '', category: '' });
      setDocumentFile(null);
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await deleteDoc(doc(db, 'r&d-documents', documentId));
      setDocuments(documents.filter((doc) => doc.id !== documentId));
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Document Upload</h2>
      <form onSubmit={handleDocumentUpload} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="Document Title"
            value={newDocument.title}
            onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newDocument.description}
            onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={newDocument.category}
            onChange={(e) => setNewDocument({ ...newDocument, category: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setDocumentFile(e.target.files[0])}
            className="border p-2 rounded"
            required
          />
        </div>
        <div className="mt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Upload className="mr-2" />
            {isLoading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{doc.title}</h3>
              <button onClick={() => handleDeleteDocument(doc.id)} className="text-red-600 hover:text-red-800">
                <Trash2 size={18} />
              </button>
            </div>
            <p className="text-gray-600 mb-2">{doc.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Category: {doc.category}</span>
              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center">
                <FileText className="mr-1" size={18} />
                View PDF
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentUpload;
