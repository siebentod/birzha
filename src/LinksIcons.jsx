import { FaGithub, FaHome, FaInfo } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function LinksIcons({
  color = 'text-white',
  pos = 'top-2 right-2',
  noabout = false,
  home = false,
}) {
  return (
    <div className={`fixed ${pos} ${color} flex gap-1`}>
      {home ? (
        <Link to="/">
          <FaHome />
        </Link>
      ) : null}
      {noabout ? null : (
        <Link to="/about">
          <FaInfo />
        </Link>
      )}
      <a href="https://github.com/siebentod/birzha">
        <FaGithub />
      </a>
    </div>
  );
}

export default LinksIcons;
