// Styles
import "./SiteFooter.scss";

const SiteFooter = () => {
  return (
    <footer className="footer">
      <div className="footer__wrapper">
        <p className="footer__text">
          Designed &amp; Coded by{" "}
          <a
            className="footer__text footer__text--link"
            href="https://matthewcsimpson.dev"
            target="_blank"
            rel="noreferrer"
          >
            Matthew Simpson
          </a>
          .
        </p>
        <a
          className="footer__kofi-link"
          href="https://ko-fi.com/H2H1167GZ"
          target="_blank"
          rel="noreferrer"
        >
          <img
            className="footer__kofi-image"
            src="https://storage.ko-fi.com/cdn/kofi3.png?v=6"
            alt="Buy Me a Coffee at ko-fi.com"
          />
        </a>
        <p className="footer__text">
          This site uses the TMDB API, but is not endorsed thereby.
        </p>
        <p className="footer__text footer__text--tiny">
          If you can read this you don't need glasses.
        </p>
      </div>
    </footer>
  );
};

export default SiteFooter;
