import { Hono } from 'hono';

import { logger } from './middlewares/logger';
import { Page } from './pages/page';
import { Top } from './pages/top';

const app = new Hono();

app.use('*', logger());

// Model
export type Post = {
  id: string;
  title: string;
  body: string;
};

const posts: Post[] = [
  { id: '1', title: 'Good Morning', body: 'Let us eat breakfast' },
  { id: '2', title: 'Good Afternoon', body: 'Let us eat Lunch' },
  { id: '3', title: 'Good Evening', body: 'Let us eat Dinner' },
  { id: '4', title: 'Good Night', body: 'Let us drink Beer' },
];

// Logic
const getPosts = () => posts;

const getPost = (id: string) => {
  return posts.find(post => post.id === id);
};

// Controller
app.get('/', c => {
  const posts = getPosts();
  return c.html(<Top posts={posts} />);
});

app.get('/post/:id{[0-9]+}', c => {
  const id = c.req.param('id');
  const post = getPost(id);

  if (!post) return c.notFound();

  return c.html(<Page post={post} />);
});

app.fire();
