import React from 'react';
import { Link } from 'react-router-dom';

import logger from '../utils/logger';

function Blog() {
  logger.log('Blog render!');

  return (
    <div>
      <h1>Blog</h1>
      <Link to="/">Home page</Link>
    </div>
  );
}

export default Blog;
