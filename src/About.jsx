import { Helmet } from 'react-helmet';
import Footer from './Footer';

function About() {
  return (
    <>
      <Helmet>
        <title>About</title>
        <meta name="description" content="Simple Do-Nothing App" />
      </Helmet>
      <div className="flex flex-col justify-center items-center h-[100dvh]">
        <p className="max-w-screen-sm text-white">
          Сравнение стоимости акции (или другого тикера, облигации, фонда) между
          двумя датами + разница индекса между теми же датами
        </p>
      </div>
      <Footer>
        <a href="/">Home</a>
      </Footer>
    </>
  );
}

export default About;
