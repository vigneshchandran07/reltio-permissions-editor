# Reltio Permissions Editor

An interactive web-based tool for managing and visualizing Reltio platform permissions. This application allows you to create, edit, and visualize complex permission structures for resources and roles, with support for attribute filters.

![Reltio Permissions Editor Screenshot](screenshot.png)

## Features

- **Intuitive Permission Management**: Drag-and-drop interface for assigning permissions to roles
- **Resource and Role Management**: Add, edit, and remove resources and roles
- **Attribute Filtering**: Apply complex attribute filters to permissions
- **Permission Matrix**: Visualize all permissions across resources and roles
- **JSON Import/Export**: Edit and export permissions in Reltio API format
- **Search Functionality**: Quickly find resources and roles in large datasets
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on mobile, tablet, and desktop

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vigneshchandran07/reltio-permissions-editor.git
   cd reltio-permissions-editor
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage Guide

### Managing Resources

- **Add Resource**: Enter a URI in the "New resource URI" field and click "Add"
- **Delete Resource**: Click the "×" button next to any resource
- **Search Resources**: Type in the search box to filter resources by name

### Managing Roles

- **Add Role**: Enter a name in the "New role name" field and click "Add"
- **Delete Role**: Click the "×" button next to any role
- **Search Roles**: Type in the search box to filter roles by name

### Managing Permissions

1. Select a resource and a role to edit
2. Use the permission editor to add or remove permissions:
   - Click on permissions to toggle them
   - Drag permissions between "Available" and "Active" sections
3. Add attribute filters by entering filter expressions like `equals(attributes.Addresses.Country, "US")`

### Using the JSON Editor

1. Click "Edit" in the Reltio API Format section
2. Modify the JSON directly
3. Click "Apply" to update the UI with your changes
4. Click "Copy" to copy the JSON to your clipboard for use in Reltio API calls

### Viewing the Permission Matrix

The matrix at the bottom provides a comprehensive view of all permissions:
- Rows represent roles
- Columns represent resources
- Cells show the permissions assigned
- Yellow dots indicate filtered permissions

## Deployment

You can deploy this application to various free hosting platforms:

### GitHub Pages

1. Install the `gh-pages` package:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Update your `package.json` file:
   ```json
   "homepage": "https://yourusername.github.io/reltio-permissions-editor",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. Deploy your app:
   ```bash
   npm run deploy
   ```

### Vercel (Recommended)

1. Create an account at [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Vercel will automatically detect the Vite configuration
4. Get a shareable URL instantly with HTTPS and custom domain options

### Netlify

1. Create an account at [netlify.com](https://netlify.com)
2. Deploy via the Netlify UI by connecting your GitHub repo
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

## Technology Stack

- React for UI components
- Tailwind CSS for styling
- Vite for build tooling and development server

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Built for the Reltio platform
- Developed to simplify complex permission management
