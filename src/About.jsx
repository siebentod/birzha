import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

function About() {
  return (
    <>
      <Helmet>
        <title>About</title>
        <meta name="description" content="Simple Do-Nothing App" />
      </Helmet>
      <header>
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
            <Link to="/">Home</Link>
          </div>
        </div>
      </header>
      <div className="about">
        <div className="about__main">
          <ul>
            <li>
              Simple Do-Nothing, Don&#39;t-Move-Your-Mouse, &#34;Meditation&#34;
              App.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default About;
