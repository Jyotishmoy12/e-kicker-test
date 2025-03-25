import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Header from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Mail, 
  Briefcase, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";

const ServiceProviderComponent = () => {
  const [serviceProviders, setServiceProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [sortConfig, setSortConfig] = useState({ 
    key: null, 
    direction: 'ascending' 
  });

  // Fetch unique services and locations for filtering
  const [uniqueServices, setUniqueServices] = useState([]);
  const [uniqueLocations, setUniqueLocations] = useState([]);

  useEffect(() => {
    const fetchServiceProviders = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "service_providers"));
        const providers = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        
        setServiceProviders(providers);
        
        // Extract unique services and locations
        const services = [...new Set(providers.map(p => p.service))];
        const locations = [...new Set(providers.map(p => p.location))];
        
        setUniqueServices(services);
        setUniqueLocations(locations);
      } catch (error) {
        console.error("Error fetching service providers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceProviders();
  }, []);

  // Sorting function
  const sortedProviders = useMemo(() => {
    if (!sortConfig.key) return serviceProviders;

    return [...serviceProviders].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [serviceProviders, sortConfig]);

  // Filtered and sorted providers
  const filteredProviders = useMemo(() => {
    return sortedProviders.filter(provider => 
      (searchTerm === "" || 
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.location.toLowerCase().includes(searchTerm.toLowerCase())
      ) &&
      (filterService === "" || provider.service === filterService) &&
      (filterLocation === "" || provider.location === filterLocation)
    );
  }, [sortedProviders, searchTerm, filterService, filterLocation]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' 
        ? 'descending' 
        : 'ascending'
    }));
  };

  // Render sort icon
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' 
      ? <ChevronUp size={16} /> 
      : <ChevronDown size={16} />;
  };

  if (loading) {
    return (
      <>
        
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
        </div>
        
      </>
    );
  }

  return (
    <>
     
      <div className="container mx-auto p-4">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Service Providers Directory
        </h2>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-wrap gap-4 justify-center items-center">
          <div className="relative flex-grow max-w-md">
            <input 
              type="text" 
              placeholder="Search providers by name, service, or location" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <select 
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="p-3 border rounded-lg"
          >
            <option value="">All Services</option>
            {uniqueServices.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>

          <select 
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="p-3 border rounded-lg"
          >
            <option value="">All Locations</option>
            {uniqueLocations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        {/* Providers Table */}
        <div className="overflow-x-auto">
          {filteredProviders.length === 0 ? (
            <div className="text-center py-8 bg-gray-100 rounded-lg">
              <p className="text-xl text-gray-600">No Service Providers Found</p>
            </div>
          ) : (
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-blue-50">
                <tr>
                  {[
                    { key: 'name', label: 'Name', icon: null },
                    { key: 'email', label: 'Email', icon: <Mail size={16} /> },
                    { key: 'phone', label: 'Phone', icon: <Phone size={16} /> },
                    { key: 'service', label: 'Service', icon: <Briefcase size={16} /> },
                    { key: 'location', label: 'Location', icon: <MapPin size={16} /> }
                  ].map(({ key, label, icon }) => (
                    <th 
                      key={key} 
                      onClick={() => handleSort(key)}
                      className="py-3 px-4 text-left cursor-pointer hover:bg-blue-100 transition"
                    >
                      <div className="flex items-center gap-2">
                        {icon}
                        {label}
                        {renderSortIcon(key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProviders.map((provider) => (
                  <tr 
                    key={provider.id} 
                    className="border-b hover:bg-blue-50 transition"
                  >
                    <td className="py-3 px-4">{provider.name}</td>
                    <td className="py-3 px-4">{provider.email}</td>
                    <td className="py-3 px-4">{provider.phone}</td>
                    <td className="py-3 px-4">{provider.service}</td>
                    <td className="py-3 px-4">{provider.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Results Summary */}
        <div className="mt-4 text-center text-gray-600">
          Showing {filteredProviders.length} of {serviceProviders.length} service providers
        </div>
      </div>
      
    </>
  );
};

export default ServiceProviderComponent;