import Link from "next/link";

const Header = ({ currentUser }) => {
  const links = [
    !currentUser && { label: "Sign Up", href: "/auth/signup" },
    !currentUser && { label: "Sign In", href: "/auth/signin" },
    currentUser && { label: "Sign Out", href: "/auth/signout" },
  ]
    // Filter out the entries that are not false. If not currentUser exists, first two entries would resolve to false.
    .filter((linkConfig) => linkConfig)
    .map(({ label, href }) => (
      <li className="nav-item" key={href}>
        <Link className="nav-link" href={href}>
          {label}
        </Link>
      </li>
    ));

  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container-fluid">
        <Link href="/">
          <h3 className="navbar-brand">GitTix</h3>
        </Link>
        <div className="d-flex justify-content-end">
          <ul className="nav d-flex align-items-center" display="block">
            {links}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
