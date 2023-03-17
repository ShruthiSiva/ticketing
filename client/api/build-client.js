import axios from "axios";

export default ({ req }) => {
  // window object only exists in a browser. Check if we are on the browser of server.
  if (typeof window === "undefined") {
    return axios.create({
      // Why are we specifying the whole URL here instead of just the path?
      // Since the server is making this request to a different microservice, if we only specified the path ('/api/users/curretUser'), it would attempt to stick the domain of the local machine/container (127.0.0.1:80) before the path. This wouldn't reach the auth service, so we need to use the longer URL.
      // Within other parts of the application rendered on the browser side (i.e., stuff within the LandingPage component for instance), the browser would be the one making the request, so it would append the current domain of ticketing.dev before the path. Once the request reaches ingress-nginx, it would be correctly routed to the auth service.
      // At this point, we can either directly reach out to the auth service ("http://auth-srv:3000/api/users/currentUser") or directly to ingress-nginx. The latter is preferred since we don't have to remember service names and we have already configured route mappings in the ingress-srv.yaml file.
      // Find explanation for the domain name within the Kubernetes Notion doc.
      // Since we're making the request from the server, cookies are not automatically managed by the server like a browser would.
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      // This will pass in the cookie header and Host header (needed to inform ingress-nginx of the domain/host from which the request is being sent so it can match the routes in the config file)
      headers: req.headers,
    });
  } else {
    // We are on the browser
    return axios.create({
      baseURL: "",
    });
  }
};
