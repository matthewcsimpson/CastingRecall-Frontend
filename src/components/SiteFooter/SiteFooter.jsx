// Styles
import "./SiteFooter.scss";

function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer__wrapper">
        <p className="footer__text">
          Designed &amp; Coded by{" "}
          <a
            className="footer__text footer__text--link"
            href="https://www.mattsimpson.name"
            target="_blank"
            rel="noreferrer"
          >
            Matthew Simpson
          </a>
          .
        </p>
        <p className="footer__text">
          This site uses the TMDB API, but is not endorsed thereby.
        </p>
        <p className="footer__text footer__text--tiny">
          If you can read this you don't need glasses.
        </p>
      </div>
    </footer>
  );
}

export default SiteFooter;
