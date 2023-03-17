import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/build-client";
import Header from "../components/header";

// we're exporting a React component.
// When we navigate to a route like "/" or "/banana", the component being returned in the index.js or banana.js file is rendered. But before it's rendered, Next.js wraps it with its own layer as defined in _app.js. In order to import global CSS, we need to define it in this file since this is called everytime a component is rendered. Hence why we are re-defining this file to import bootstrap CSS into it.
// Reference: https://github.com/vercel/next.js/blob/deprecated-main/errors/css-global.md
const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
};

// definitely check Notion docs for info on params received.
AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);

  const { data } = await client.get("/api/users/currentuser");

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    // Call any component's getInitialProps from here and pass the appropriate context object.
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }

  // Manually pass into the AppComponent the pageProps returned from calling getInitialProps of the rendered component here. The pageProps will be propogated down tot he rendered component.
  return {
    pageProps,
    currentUser: data.currentUser,
  };
};

export default AppComponent;
