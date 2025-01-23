import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { FileText, Filter, Search, Download, X } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from "../components/Navbar"

const RDPage = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);

  // Fetch Documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const documentsCollection = collection(db, 'r&d-documents');
        const documentSnapshot = await getDocs(documentsCollection);
        const documentList = documentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Extract unique categories
        const uniqueCategories = [...new Set(documentList.map(doc => doc.category))];

        setDocuments(documentList);
        setFilteredDocuments(documentList);
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchDocuments();
  }, []);

  // Filter and Search Documents
  const filterAndSearchDocuments = () => {
    let result = documents;

    // Category Filter
    if (categoryFilter) {
      result = result.filter(doc => doc.category === categoryFilter);
    }

    // Search Filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(doc => 
        doc.title.toLowerCase().includes(searchTermLower) ||
        doc.description.toLowerCase().includes(searchTermLower) ||
        doc.category.toLowerCase().includes(searchTermLower)
      );
    }

    setFilteredDocuments(result);
  };

  // Trigger filtering when search or category changes
  useEffect(() => {
    filterAndSearchDocuments();
  }, [categoryFilter, searchTerm, documents]);

  // Reset Filters
  const resetFilters = () => {
    setCategoryFilter('');
    setSearchTerm('');
  };

  return (
    <>
    <Navbar/>
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">
          Research & Development Repository
        </h1>
        <p className="text-gray-600">
        Access in-depth analyses of our ongoing electronics engineering projects and pioneering research. Download detailed reports and technical documentation to understand the innovation driving our solutions.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Category Dropdown */}
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="flex-grow relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Documents
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title, description, or category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border p-2 rounded-md pr-10 focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm ? (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <X size={20} />
              </button>
            ) : (
              <Search 
                size={20} 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" 
              />
            )}
          </div>
        </div>

        {/* Reset Filters */}
        {(categoryFilter || searchTerm) && (
          <div className="flex items-end">
            <button 
              onClick={resetFilters}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center"
            >
              <X className="mr-2" /> Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Document Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center text-gray-600 mt-10">
          <FileText className="mx-auto mb-4 text-gray-400" size={48} />
          <p>Oops! No documents match your search or filter criteria. Create an account now to unlock and access the documents you need!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <div 
              key={doc.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-xl"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">
                      {doc.title}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded">
                      {doc.category}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {doc.description}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Uploaded: {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                  </span>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Download className="mr-2" size={18} />
                    Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Count */}
      <div className="mt-6 text-center text-gray-600">
        Showing {filteredDocuments.length} of {documents.length} documents
      </div>
    </div>
    </>
  );
};

export default RDPage;