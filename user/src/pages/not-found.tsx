import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="flat-spacing text-center">
      <div className="container">
        <h1 className="text-display-xl font-anton mb-16">404</h1>
        <p className="cl-text-5 mb-24">The page you are looking for could not be found.</p>
        <Link to="/" className="tf-btn style-2 type-2">
          Go home
        </Link>
      </div>
    </section>
  );
}
