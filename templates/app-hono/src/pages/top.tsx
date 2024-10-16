import type { Post } from '..';
import { Layout } from '../components/layout';

const List = (props: { post: Post }) => (
  <li>
    <a href={`/post/${props.post.id}`}>{props.post.title}</a>
  </li>
);

export const Top = (props: { posts: Post[] }) => {
  return (
    <Layout title={'Top'}>
      <main>
        <h3>Posts</h3>
        <ul>
          {props.posts.map(post => (
            <List post={post} />
          ))}
        </ul>
      </main>
    </Layout>
  );
};
