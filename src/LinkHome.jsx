import { FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function LinksIcons({ color = 'text-white', pos = 'top-2 left-2' }) {
  return (
    <div className={`fixed ${pos} ${color}`}>
      <Link to="/">
        <FaHome />
      </Link>
    </div>
  );
}

export default LinksIcons;
