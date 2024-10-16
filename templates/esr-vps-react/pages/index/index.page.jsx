import { Counter } from './Counter';

export { Page };

function Page() {
  return (
    <>
      <h1>Edge Side Rendering (ESR)</h1>
      <p>EdgeFunctions + vite-plugin-ssr + React</p>
      <p>
        <Counter />
      </p>
    </>
  );
}
