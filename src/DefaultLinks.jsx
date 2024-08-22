import { Link } from 'react-router-dom';

function DefaultLinks() {
  return (
    <div className="links">
      <div className="link link__github">
        <a href="https://github.com/siebentod/nivritti">
          Github{' '}
          <i
            className="fa-solid fa-arrow-up-right-from-square"
            style={{ fontSize: '9px' }}
          ></i>
        </a>
      </div>
      <div className="link link__about">
        <Link to="/about">About</Link>
      </div>
    </div>
  );
}

export default DefaultLinks;
