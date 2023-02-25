import "bootstrap/dist/css/bootstrap.css";

// we're exporting a React component.
// When we navigate to a route like "/" or "/banana", the component being returned in the index.js or banana.js file is rendered. But before it's rendered, Next.js wraps it with its own layer as defined in _app.js. In order to import global CSS, we need to define it in this file since this is called everytime a component is rendered. Hence why we are re-defining this file to import bootstrap CSS into it.
// Reference: https://github.com/vercel/next.js/blob/deprecated-main/errors/css-global.md
export default ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};
