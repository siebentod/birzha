import { Helmet } from 'react-helmet';
import LinksIcons from './LinksIcons';

function About() {
  return (
    <>
      <Helmet>
        <title>About</title>
      </Helmet>
      <div className="flex flex-col justify-center items-center h-[100dvh]">
        <div className="grid max-w-screen-sm shadow-md m-3 py-7 px-10 rounded-lg bg-[#f2e8c6]">
          Сравнение стоимости акции (или другого тикера: облигации, фонда) между
          двумя датами + разница индекса между теми же датами.
        </div>
      </div>
      <LinksIcons noabout home color="text-[#f2e8c6]" />
    </>
  );
}

export default About;
