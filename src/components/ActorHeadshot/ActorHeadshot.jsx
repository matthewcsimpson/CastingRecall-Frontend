// Assets
import profilePic from "../../assets/profile-placeholder.jpg";

// Utilities
import { obscureString, tmdbImageUrl } from "../../utilities";

// Styles
import "./ActorHeadshot.scss";

/**
 * Component to display an actor's headshot and name.
 * @param {object} actor Actor data object from TMDB.
 * @param {boolean} revealCharNamesVisible Whether to reveal character names or obscure them.
 * @returns
 */
const ActorHeadshot = ({ actor, revealCharNamesVisible }) => {
  return (
    <div key={actor.id} className="headshotbox">
      <img
        className={"headshot"}
        src={tmdbImageUrl(actor.profile_path, { fallback: profilePic })}
        alt={actor.name}
      />
      <p className="actorname">{`${actor.name}`}</p>
      <p className="actorname actorname--as">as</p>
      {
        <p className="actorname actorname--char">
          {revealCharNamesVisible
            ? actor.sanitizedCharacter
            : obscureString(actor.sanitizedCharacter)}
        </p>
      }
    </div>
  );
};

export default ActorHeadshot;
