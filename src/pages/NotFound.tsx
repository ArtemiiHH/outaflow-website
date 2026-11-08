import { Link } from "react-router-dom";
import { Header, Footer } from "../components/Layout";
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="empty">
        <h1>Nothing here.</h1>
        <Link className="text-button" to="/">
          Back to outaflow
        </Link>
      </main>
      <Footer />
    </>
  );
}
