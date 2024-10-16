import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Blog from './components/Blog';
import Home from './components/Home';

function App() {
  return (
    <html>
      <head>
        <title>ESR - REACT-SERVER-HYBRATE - EdgeFunctions</title>
      </head>
      <body style={{ padding: '40px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
        </Routes>
      </body>
      <script src="/client/index.js"></script>
    </html>
  );
}

export default App;
