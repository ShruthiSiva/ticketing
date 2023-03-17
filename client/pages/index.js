import buildClient from "../api/build-client";

const LandingPage = ({ currentUser }) => {
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are not signed in</h1>
  );
};

// getInitialProps is called before the component renders (this method is specific to NextJS). For a server side rendered app, we want to fetch all app-related data before the component renders (as opposed to doing it during component render by the use of useEffect or some other hook etc.). In client side rendered apps, data is fetched within a component by the use of hooks etc. But, since we're pre-rendering using SSR, we would like to fetch relevant data BEFORE the component is built out. After getInitialProps is called, the component is rendered out ONCE and the HTML is sent to the browser. Read Notion docs for detailed explanation.
//all returned values are sent into the component as props.
LandingPage.getInitialProps = async (context) => {
  const client = buildClient(context);
  const { data } = await client.get("/api/users/currentuser");

  return data;
};

export default LandingPage;
