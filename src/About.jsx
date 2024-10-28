import { Helmet } from 'react-helmet';
import LinksIcons from './LinksIcons';

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
      <LinksIcons noabout home />
    </>
  );
}

export default About;
