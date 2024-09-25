import { Helmet } from 'react-helmet';
import Footer from './Footer';
import { Link } from 'react-router-dom';

function About() {
  return (
    <>
      <Helmet>
        <title>About</title>
      </Helmet>
      <div className="flex flex-col justify-center items-center h-[100dvh]">
        <p className="max-w-screen-sm text-white">
          Сравнение стоимости акции (или другого тикера: облигации, фонда) между
          двумя датами + разница индекса между теми же датами
        </p>
      </div>
      <Footer>
        <Link to="/">Home</Link>
      </Footer>
    </>
  );
}

export default About;
