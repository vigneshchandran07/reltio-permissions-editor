import React, { useState, useEffect } from 'react';

// Main component for the interactive permissions editor
const ReltioPermissionsEditor = () => {
  // Define access types and their colors
  const accessTypes = {
    READ: { color: '#e6f7ff', textColor: '#0066cc', label: 'Read' },
    READ_MASKED: { color: '#ffe6f7', textColor: '#cc0066', label: 'Read Masked' },
    CREATE: { color: '#d9f7be', textColor: '#389e0d', label: 'Create' },
    UPDATE: { color: '#fff1b8', textColor: '#d48806', label: 'Update' },
    DELETE: { color: '#ffccc7', textColor: '#cf1322', label: 'Delete' },
    MERGE: { color: '#d3adf7', textColor: '#722ed1', label: 'Merge' },
    UNMERGE: { color: '#ffd8bf', textColor: '#d46b08', label: 'Unmerge' },
    INITIATE_CHANGE_REQUEST: { color: '#d9d9d9', textColor: '#434343', label: 'Initiate Change' },
    ACCEPT_CHANGE_REQUEST: { color: '#b5f5ec', textColor: '#006d75', label: 'Accept Change' }
  };

  // Initial sample permissions data
  const initialPermissionsData = [
    {
      uri: "configuration/entityTypes",
      permissions: [
        { role: "ACME_BUSINESS_ADMIN", access: ["CREATE", "READ", "UPDATE", "DELETE", "MERGE", "UNMERGE"] },
        { role: "ACME_DATA_STEWARD", access: ["CREATE", "READ", "UPDATE", "MERGE", "UNMERGE"] },
        { role: "ACME_READ_ONLY", access: ["READ"] }
      ]
    },
    {
      uri: "configuration/relationTypes",
      permissions: [
        { role: "ACME_BUSINESS_ADMIN", access: ["CREATE", "READ", "UPDATE", "DELETE"] },
        { role: "ACME_DATA_STEWARD", access: ["CREATE", "READ", "UPDATE", "DELETE"] },
        { role: "ACME_READ_ONLY", access: ["READ"] }
      ]
    },
    {
      uri: "configuration/entityTypes/Organization",
      permissions: [
        { role: "ACME_BUSINESS_ADMIN", access: ["CREATE", "READ", "UPDATE", "DELETE"], filter: "equals(attributes.Addresses.Country, \"US\")" },
        { role: "ACME_DATA_STEWARD", access: ["READ", "UPDATE"] }
      ]
    }
  ];

  // State management
  const [permissionsData, setPermissionsData] = useState(initialPermissionsData);
  const [allRoles, setAllRoles] = useState([]);
  const [allPermissions] = useState(Object.keys(accessTypes));
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newResourceUri, setNewResourceUri] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPermission, setDraggedPermission] = useState(null);
  const [showCopied, setShowCopied] = useState(false);
  const [isJsonEditing, setIsJsonEditing] = useState(false);
  const [jsonEditValue, setJsonEditValue] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Extract all unique roles on data change
  useEffect(() => {
    const roles = new Set();
    permissionsData.forEach(resource => {
      resource.permissions.forEach(permission => {
        roles.add(permission.role);
      });
    });
    setAllRoles(Array.from(roles).sort());
  }, [permissionsData]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Add/remove dark-mode class from body
    if (!darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  // Apply dark mode class on initial load if system prefers dark mode
  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }
    
    // Add dark mode CSS to document
    const style = document.createElement('style');
    style.textContent = `
      .dark-mode {
        background-color: #121212;
        color: #e0e0e0;
      }
      .dark-mode .bg-white {
        background-color: #1e1e1e;
        color: #e0e0e0;
      }
      .dark-mode .bg-gray-50 {
        background-color: #2d2d2d;
        color: #e0e0e0;
      }
      .dark-mode .bg-blue-100 {
        background-color: #1a365d;
        color: #e0e0e0;
      }
      .dark-mode .border {
        border-color: #404040;
      }
      .dark-mode .text-gray-500, .dark-mode .text-gray-600 {
        color: #a0a0a0;
      }
      .dark-mode .hover\\:bg-gray-100:hover {
        background-color: #333333;
      }
      .dark-mode .bg-blue-50 {
        background-color: #172a46;
        color: #90cdf4;
      }
      .dark-mode .bg-purple-50 {
        background-color: #322659;
        color: #d6bcfa;
      }
      .dark-mode .text-blue-800 {
        color: #90cdf4;
      }
      .dark-mode .text-purple-800 {
        color: #d6bcfa;
      }
      .dark-mode pre, .dark-mode textarea.bg-gray-50 {
        background-color: #2d2d2d;
        color: #e0e0e0;
      }
      .dark-mode .theme-toggle {
        background-color: #2d2d2d;
        color: #f0f0f0;
      }
      .dark-mode table th.bg-gray-100 {
        background-color: #333333;
        color: #e0e0e0;
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Handle copying JSON to clipboard
  const copyJsonToClipboard = () => {
    const jsonData = JSON.stringify(permissionsData, null, 2);
    
    navigator.clipboard.writeText(jsonData).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    });
  };

  // Toggle JSON editing mode
  const toggleJsonEditing = () => {
    if (!isJsonEditing) {
      // Entering edit mode - prepare the current JSON
      const jsonData = JSON.stringify(permissionsData, null, 2);
      setJsonEditValue(jsonData);
    } else {
      // Exiting edit mode without applying changes
      setJsonError('');
    }
    
    setIsJsonEditing(!isJsonEditing);
  };

  // Apply the edited JSON
  const applyJsonChanges = () => {
    try {
      const jsonData = JSON.parse(jsonEditValue);
      
      // Validate structure
      if (!Array.isArray(jsonData)) {
        throw new Error('Invalid format: expected an array');
      }
      
      jsonData.forEach(resource => {
        if (!resource.uri || !Array.isArray(resource.permissions)) {
          throw new Error('Invalid resource format: missing uri or permissions array');
        }
        
        resource.permissions.forEach(perm => {
          if (!perm.role || !Array.isArray(perm.access)) {
            throw new Error('Invalid permission format: missing role or access array');
          }
        });
      });
      
      setPermissionsData(jsonData);
      setIsJsonEditing(false);
      setJsonError('');
    } catch (error) {
      setJsonError(`Error parsing JSON: ${error.message}`);
    }
  };

  // Add a new role to all resources
  const addNewRole = () => {
    if (newRoleName.trim() === "") return;
    
    const updatedData = permissionsData.map(resource => {
      // Check if role already exists for this resource
      const roleExists = resource.permissions.some(p => p.role === newRoleName);
      if (!roleExists) {
        return {
          ...resource,
          permissions: [...resource.permissions, { role: newRoleName, access: ["READ"] }]
        };
      }
      return resource;
    });
    
    setPermissionsData(updatedData);
    setNewRoleName("");
  };

  // Add a new resource
  const addNewResource = () => {
    if (newResourceUri.trim() === "") return;
    
    // Check if resource already exists
    if (permissionsData.some(r => r.uri === newResourceUri)) {
      alert("This resource already exists!");
      return;
    }
    
    // Create new resource with default permissions for all existing roles
    const newResource = {
      uri: newResourceUri,
      permissions: allRoles.map(role => ({ role, access: ["READ"] }))
    };
    
    setPermissionsData([...permissionsData, newResource]);
    setNewResourceUri("");
  };

  // Remove a role from all resources
  const removeRole = (roleToRemove) => {
    const confirmed = window.confirm(`Are you sure you want to remove the role "${roleToRemove}" from all resources?`);
    if (!confirmed) return;
    
    const updatedData = permissionsData.map(resource => ({
      ...resource,
      permissions: resource.permissions.filter(p => p.role !== roleToRemove)
    }));
    
    setPermissionsData(updatedData);
    if (selectedRole === roleToRemove) {
      setSelectedRole(null);
    }
  };

  // Remove a resource
  const removeResource = (resourceUri) => {
    const confirmed = window.confirm(`Are you sure you want to remove the resource "${resourceUri}"?`);
    if (!confirmed) return;
    
    const updatedData = permissionsData.filter(r => r.uri !== resourceUri);
    setPermissionsData(updatedData);
    if (selectedResource === resourceUri) {
      setSelectedResource(null);
    }
  };

  // Toggle a permission for a role on a resource
  const togglePermission = (role, resource, permission) => {
    const updatedData = [...permissionsData];
    const resourceIndex = updatedData.findIndex(r => r.uri === resource);
    if (resourceIndex === -1) return;
    
    const permissionIndex = updatedData[resourceIndex].permissions.findIndex(p => p.role === role);
    if (permissionIndex === -1) return;
    
    const permissions = updatedData[resourceIndex].permissions[permissionIndex].access;
    const permissionIndex2 = permissions.indexOf(permission);
    
    if (permissionIndex2 === -1) {
      // Add permission
      permissions.push(permission);
    } else {
      // Remove permission
      permissions.splice(permissionIndex2, 1);
    }
    
    setPermissionsData(updatedData);
  };

  // Update filter for a role on a resource
  const updateFilter = (role, resource, filterValue) => {
    const updatedData = [...permissionsData];
    const resourceIndex = updatedData.findIndex(r => r.uri === resource);
    if (resourceIndex === -1) return;
    
    const permissionIndex = updatedData[resourceIndex].permissions.findIndex(p => p.role === role);
    if (permissionIndex === -1) return;
    
    // If filter value is empty, remove the filter property
    if (filterValue.trim() === "") {
      delete updatedData[resourceIndex].permissions[permissionIndex].filter;
    } else {
      updatedData[resourceIndex].permissions[permissionIndex].filter = filterValue;
    }
    
    setPermissionsData(updatedData);
  };

  // Start dragging a permission
  const handleDragStart = (e, permission, sourceType) => {
    setIsDragging(true);
    setDraggedPermission({ permission, sourceType });
    e.dataTransfer.setData('text/plain', JSON.stringify({ permission, sourceType }));
  };

  // Handle dropping a permission
  const handleDrop = (e, targetType) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!draggedPermission || !selectedResource || !selectedRole) return;
    
    const { permission, sourceType } = draggedPermission;
    
    if (sourceType === 'available' && targetType === 'active') {
      // Add permission
      togglePermission(selectedRole, selectedResource, permission);
    } else if (sourceType === 'active' && targetType === 'available') {
      // Remove permission
      togglePermission(selectedRole, selectedResource, permission);
    }
    
    setDraggedPermission(null);
  };

  // Check if a role has a specific permission on a resource
  const hasPermission = (role, resource, permission) => {
    const resourceData = permissionsData.find(r => r.uri === resource);
    if (!resourceData) return false;
    
    const permissionData = resourceData.permissions.find(p => p.role === role);
    if (!permissionData) return false;
    
    return permissionData.access.includes(permission);
  };

  // Render permission badge
  const renderPermissionBadge = (permission, isActive, isDraggable = true) => {
    const { color, textColor, label } = accessTypes[permission] || { 
      color: '#f0f0f0', 
      textColor: '#333333',
      label: permission
    };
    
    return (
      <div 
        key={permission}
        className="px-2 py-1 m-1 rounded-md text-xs font-medium inline-block select-none"
        style={{ 
          backgroundColor: color, 
          color: textColor,
          cursor: isDraggable ? 'grab' : 'default',
          opacity: isDraggable ? 1 : 0.7
        }}
        draggable={isDraggable}
        onDragStart={isDraggable ? (e) => handleDragStart(e, permission, isActive ? 'active' : 'available') : null}
        onClick={isDraggable ? () => togglePermission(selectedRole, selectedResource, permission) : null}
      >
        {label}
      </div>
    );
  };

  // Export permission matrix to CSV
  const exportToCSV = () => {
    // Create header row with resource URIs
    const headers = ['Role', ...permissionsData.map(resource => resource.uri)];
    
    // Create data rows for each role
    const rows = allRoles.map(role => {
      const roleData = [role];
      permissionsData.forEach(resource => {
        const permissions = resource.permissions.find(p => p.role === role)?.access || [];
        const filter = resource.permissions.find(p => p.role === role)?.filter;
        const cellData = permissions.map(p => accessTypes[p]?.label || p).join('|');
        roleData.push(filter ? `${cellData} [Filtered: "${filter.replace(/"/g, '""')}"]` : cellData);
      });
      return roleData;
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'permission_matrix.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import permission matrix from CSV
  const importFromCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target.result;
        
        // Split the content into lines and remove empty lines
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        // Parse the header row
        const headers = lines[0].split(',').map(header => header.trim());
        if (headers[0] !== 'Role') throw new Error('First column must be "Role"');
        
        // Create new permissions data
        const newPermissionsData = [];
        const newRoles = new Set();
        
        // Process each data row
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const cells = [];
          let currentCell = '';
          let inQuotes = false;
          
          // Parse the line character by character to handle quoted values
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              cells.push(currentCell.trim());
              currentCell = '';
            } else {
              currentCell += char;
            }
          }
          cells.push(currentCell.trim()); // Add the last cell
          
          const role = cells[0];
          if (!role) continue; // Skip empty rows
          newRoles.add(role);
          
          // Process each resource column
          for (let j = 1; j < headers.length; j++) {
            const resourceUri = headers[j];
            if (!resourceUri) continue; // Skip empty resource columns
            
            const cellData = cells[j];
            if (!cellData) continue; // Skip empty cells
            
            // Parse permissions and filter
            let permissions = [];
            let filter = null;
            
            if (cellData.includes('[Filtered:')) {
              const [perms, filterPart] = cellData.split('[Filtered:');
              permissions = perms.split('|').map(p => p.trim());
              // Extract filter and clean up quotes
              filter = filterPart
                .replace(']', '')
                .trim()
                .replace(/^"/, '')
                .replace(/"$/, '')
                .replace(/""/g, '"');
            } else {
              permissions = cellData.split('|').map(p => p.trim());
            }
            
            // Convert permission labels to access types
            const accessTypesMap = permissions.map(label => {
              // First try to find an exact match
              const entry = Object.entries(accessTypes).find(([_, data]) => data.label === label);
              if (entry) return entry[0];
              
              // If no exact match, try to find a case-insensitive match
              const caseInsensitiveEntry = Object.entries(accessTypes).find(
                ([_, data]) => data.label.toLowerCase() === label.toLowerCase()
              );
              if (caseInsensitiveEntry) return caseInsensitiveEntry[0];
              
              // If still no match, return the original label
              return label;
            });
            
            // Find or create resource entry
            let resourceEntry = newPermissionsData.find(r => r.uri === resourceUri);
            if (!resourceEntry) {
              resourceEntry = { uri: resourceUri, permissions: [] };
              newPermissionsData.push(resourceEntry);
            }
            
            // Check if role already exists for this resource
            const existingPermissionIndex = resourceEntry.permissions.findIndex(p => p.role === role);
            if (existingPermissionIndex !== -1) {
              // Update existing permission
              resourceEntry.permissions[existingPermissionIndex] = {
                role,
                access: accessTypesMap,
                ...(filter && { filter })
              };
            } else {
              // Add new permission
              resourceEntry.permissions.push({
                role,
                access: accessTypesMap,
                ...(filter && { filter })
              });
            }
          }
        }
        
        // Update state
        setPermissionsData(newPermissionsData);
        setAllRoles(Array.from(newRoles).sort());
        
        // Show success message
        alert('CSV import completed successfully!');
        
      } catch (error) {
        alert(`Error importing CSV: ${error.message}`);
      }
    };
    
    reader.readAsText(file);
  };

  // Main render
  return (
    <div className={`container mx-auto p-4 ${darkMode ? 'dark-mode' : ''}`}>
      <header className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center">
          {/* Reltio Logo from public directory - changes based on theme */}
          <img 
            src={darkMode ? "/logo/reltio-logo-reverse-rgb.svg" : "/logo/reltio-logo-full-color-rgb.svg"} 
            alt="Reltio Logo" 
            className="h-10 mr-3"
          />
          <h1 className="text-2xl font-bold">Permissions Editor</h1>
        </div>
        <div className="flex items-center">
          <div className="text-sm text-gray-500 mr-4">
            Interactive Permissions Management
          </div>
          {/* Theme toggle button */}
          <button 
            onClick={toggleDarkMode}
            className={`theme-toggle p-2 rounded-full focus:outline-none transition-colors ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </header>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel - Resources and roles */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="text-lg font-bold mb-3">Resources</h2>
            
            {/* Search Resources */}
            <div className="mb-3">
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Search resources..."
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
              />
            </div>
            
            <div className="overflow-y-auto max-h-60 mb-3">
              {permissionsData
                .filter(resource => resource.uri.toLowerCase().includes(resourceFilter.toLowerCase()))
                .map(resource => (
                <div 
                  key={resource.uri}
                  className={`p-2 mb-1 rounded cursor-pointer flex justify-between items-center ${selectedResource === resource.uri ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedResource(resource.uri)}
                >
                  <div className="truncate flex-1" title={resource.uri}>{resource.uri}</div>
                  <button 
                    className="text-red-500 hover:text-red-700 ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeResource(resource.uri);
                    }}
                    aria-label="Delete resource"
                  >
                    ×
                  </button>
                </div>
              ))}
              {permissionsData.filter(resource => 
                resource.uri.toLowerCase().includes(resourceFilter.toLowerCase())
              ).length === 0 && (
                <div className="p-2 text-gray-500 text-center">No resources found</div>
              )}
            </div>
            
            {/* Add New Resource - moved to bottom */}
            <div className="flex">
              <input
                type="text"
                className="flex-1 px-3 py-2 border rounded-l-md"
                placeholder="New resource URI"
                value={newResourceUri}
                onChange={(e) => setNewResourceUri(e.target.value)}
              />
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
                onClick={addNewResource}
              >
                Add
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-bold mb-3">Roles</h2>
            
            {/* Search Roles */}
            <div className="mb-3">
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Search roles..."
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              />
            </div>
            
            <div className="overflow-y-auto max-h-60 mb-3">
              {allRoles
                .filter(role => role.toLowerCase().includes(roleFilter.toLowerCase()))
                .map(role => (
                <div 
                  key={role}
                  className={`p-2 mb-1 rounded cursor-pointer flex justify-between items-center ${selectedRole === role ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedRole(role)}
                >
                  <div className="truncate flex-1">{role}</div>
                  <button 
                    className="text-red-500 hover:text-red-700 ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRole(role);
                    }}
                    aria-label="Delete role"
                  >
                    ×
                  </button>
                </div>
              ))}
              {allRoles.filter(role => 
                role.toLowerCase().includes(roleFilter.toLowerCase())
              ).length === 0 && (
                <div className="p-2 text-gray-500 text-center">No roles found</div>
              )}
            </div>
            
            {/* Add New Role - moved to bottom */}
            <div className="flex">
              <input
                type="text"
                className="flex-1 px-3 py-2 border rounded-l-md"
                placeholder="New role name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
                onClick={addNewRole}
              >
                Add
              </button>
            </div>
          </div>
        </div>
        
        {/* Right panel - Permission editor and JSON output */}
        <div className="w-full lg:w-2/3 flex flex-col">
          {/* Permission editor */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="text-lg font-bold mb-3">Permission Editor</h2>
            
            {selectedResource && selectedRole ? (
              <div>
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Editing permissions for:</h3>
                  <div className="flex flex-col sm:flex-row gap-2 mb-2">
                    <div className="bg-blue-50 px-3 py-1 rounded-md font-medium text-blue-800">
                      Resource: {selectedResource}
                    </div>
                    <div className="bg-purple-50 px-3 py-1 rounded-md font-medium text-purple-800">
                      Role: {selectedRole}
                    </div>
                  </div>
                </div>
                
                {/* Filter Input */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Attribute Filter</h4>
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                      placeholder="e.g., equals(attributes.Addresses.Country, &quot;US&quot;)"
                      value={
                        permissionsData
                          .find(r => r.uri === selectedResource)
                          ?.permissions.find(p => p.role === selectedRole)
                          ?.filter || ""
                      }
                      onChange={(e) => updateFilter(selectedRole, selectedResource, e.target.value)}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Apply a filter expression to limit permissions by attribute values
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">Active Permissions</h4>
                    <div 
                      className="min-h-20 p-3 bg-gray-50 rounded-md flex flex-wrap"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, 'active')}
                    >
                      {allPermissions
                        .filter(p => hasPermission(selectedRole, selectedResource, p))
                        .map(p => renderPermissionBadge(p, true))}
                      {!allPermissions.some(p => hasPermission(selectedRole, selectedResource, p)) && (
                        <div className="text-gray-400 p-2">No permissions assigned</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">Available Permissions</h4>
                    <div 
                      className="min-h-20 p-3 bg-gray-50 rounded-md flex flex-wrap"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, 'available')}
                    >
                      {allPermissions
                        .filter(p => !hasPermission(selectedRole, selectedResource, p))
                        .map(p => renderPermissionBadge(p, false))}
                      {!allPermissions.some(p => !hasPermission(selectedRole, selectedResource, p)) && (
                        <div className="text-gray-400 p-2">All permissions assigned</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  Tip: Click on a permission to toggle it, or drag and drop between the sections.
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Please select both a resource and a role to edit permissions
              </div>
            )}
          </div>
          
          {/* JSON Output */}
          <div className="bg-white rounded-lg shadow p-4 flex-1">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">Reltio API Format</h2>
              
              <div className="flex items-center space-x-2">
                <button 
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                  onClick={copyJsonToClipboard}
                  disabled={isJsonEditing}
                >
                  Copy
                </button>
                
                <button 
                  className={`px-3 py-1 rounded text-sm ${isJsonEditing ? 'bg-gray-500 text-white hover:bg-gray-600' : 'bg-green-600 text-white hover:bg-green-700'}`}
                  onClick={toggleJsonEditing}
                >
                  {isJsonEditing ? 'Cancel' : 'Edit'}
                </button>
                
                {isJsonEditing && (
                  <button 
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                    onClick={applyJsonChanges}
                  >
                    Apply
                  </button>
                )}
                
                {showCopied && !isJsonEditing && (
                  <span className="text-green-600 text-sm">Copied!</span>
                )}
              </div>
            </div>
            
            <div className="border rounded overflow-hidden">
              {isJsonEditing ? (
                <div className="flex flex-col">
                  <textarea 
                    className="p-3 bg-gray-50 font-mono text-xs w-full"
                    style={{ minHeight: '300px', resize: 'vertical' }}
                    value={jsonEditValue}
                    onChange={(e) => setJsonEditValue(e.target.value)}
                  />
                  {jsonError && (
                    <div className="p-2 text-red-500 text-xs bg-red-50 border-t border-red-200">
                      {jsonError}
                    </div>
                  )}
                </div>
              ) : (
                <pre className="p-3 bg-gray-50 overflow-auto text-xs" style={{ maxHeight: '300px' }}>
                  {JSON.stringify(permissionsData, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold mb-2">Legend</h3>
        <div className="flex flex-wrap">
          {Object.entries(accessTypes).map(([permission, { color, textColor, label }]) => (
            <div 
              key={permission}
              className="px-3 py-1 m-1 rounded-md text-xs font-medium"
              style={{ backgroundColor: color, color: textColor }}
            >
              {label} ({permission})
            </div>
          ))}
        </div>
      </div>
      
      {/* Permission Matrix */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Permission Matrix</h3>
          <div className="flex gap-2">
            <button
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
              onClick={exportToCSV}
            >
              Export CSV
            </button>
            <label className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm cursor-pointer">
              Import CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={importFromCSV}
              />
            </label>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2 bg-gray-100">Roles \ Resources</th>
                {permissionsData.map(resource => (
                  <th key={resource.uri} className="border px-4 py-2 bg-gray-100 text-xs">
                    <div className="truncate max-w-xs" title={resource.uri}>
                      {resource.uri}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allRoles.map(role => (
                <tr key={role}>
                  <td className="border px-4 py-2 font-medium bg-gray-50 text-sm">{role}</td>
                  {permissionsData.map(resource => {
                    const permissions = resource.permissions.find(p => p.role === role)?.access || [];
                    return (
                      <td key={`${role}-${resource.uri}`} className="border px-4 py-2">
                        <div className="flex flex-wrap gap-1">
                          {permissions.length > 0 ? (
                            permissions.map(permission => (
                              <div
                                key={`${role}-${resource.uri}-${permission}`}
                                className="rounded-md px-1 text-xs"
                                style={{
                                  backgroundColor: accessTypes[permission]?.color || '#f0f0f0',
                                  color: accessTypes[permission]?.textColor || '#333333'
                                }}
                                title={permission}
                              >
                                {accessTypes[permission]?.label.charAt(0) || permission.charAt(0)}
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </div>
                        {resource.permissions.find(p => p.role === role)?.filter && (
                          <div className="mt-1 text-xs text-gray-500 italic" title={resource.permissions.find(p => p.role === role)?.filter}>
                            <span className="inline-block w-3 h-3 bg-yellow-200 rounded-full mr-1" style={{ verticalAlign: 'middle' }}></span>
                            Filtered
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <footer className="mt-8 pt-4 border-t border-gray-200 text-center text-gray-500 text-sm">
        <div className="flex justify-center items-center mb-2">
          <img 
            src={darkMode ? "/logo/reltio-logo-reverse-rgb.svg" : "/logo/reltio-logotype-full-color-rgb.svg"} 
            alt="Reltio" 
            className="h-6"
          />
        </div>
        <p>© {new Date().getFullYear()} Reltio. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ReltioPermissionsEditor;