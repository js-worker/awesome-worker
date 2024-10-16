import type { Post } from '..';
import { Layout } from '../components/layout';

export const Page = (props: { post: Post }) => {
  return (
    <Layout title={props.post.title}>
      <title>{props.post.title}</title>
      <main>
        <h3>{props.post.title}</h3>
        <p>{props.post.body}</p>
      </main>
    </Layout>
  );
};
