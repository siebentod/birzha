import image2 from '/image2.webp';
import image from '/image.webp';

const SvgDown = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-5 inline"
      fill="none"
      viewBox="0 0 24 24"
      stroke="red"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
      />
    </svg>
  );
};

const SvgUp = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-5 inline"
      fill="none"
      viewBox="0 0 24 24"
      stroke="green"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );
};

function Display({
  status,
  message,
  ticker,
  newDate1,
  price1,
  newDate2,
  price2,
  index,
}) {
  const difference = (((+price2 - +price1) / price1) * 100).toFixed(2);
  const color = difference < 0 ? 'red' : 'green';
  const indexColor = index < 0 ? 'red' : 'green';

  return (
    <>
      <div className="bg-[#f2e8c6] border border-[#4f0000] grid min-h-[165px] w-4/5 shadow-md m-3 p-4 rounded-lg">
        {status === 'initial' && (
          <div className="relative h-full flex items-center justify-center select-none">
            <img src={image2} className="absolute h-full justify-self-center" />
          </div>
        )}
        {status === 'loading' && (
          <div className="relative h-full flex items-center justify-center select-none">
            <img src={image2} className="absolute h-full justify-self-center" />
            <p className="z-10 flex items-center justify-center inset-0 text-stroke text-[#800000] text-5xl font-semibold">
              Загрузка...
            </p>
          </div>
        )}
        {status === 'fatalError' && (
          <div className="flex flex-col relative select-none">
            <div className="relative flex items-center justify-center h-full">
              <img src={image} className="absolute h-full" />
            </div>
            <p className="text-2xl text-center">{message}</p>
          </div>
        )}

        {(status === 'loaded' || status === 'loadedWithError') && (
          <div className="m-auto">
            <p className="my-0.5">
              Стоимость <span className="blue">{ticker}</span> на {newDate1}:{' '}
              {price1 ? (
                <>
                  <span className="blue">{price1}</span>
                  <span className="small">₽</span>
                </>
              ) : (
                <span className="red">Нет данных!</span>
              )}
              <br />
              <span className="invisible">Стоимость {ticker} </span>на{' '}
              {newDate2}:{' '}
              {price2 ? (
                <>
                  <span className="blue">{price2}</span>
                  <span className="small">₽</span>
                </>
              ) : (
                <span className="red">Нет данных!</span>
              )}
            </p>
            <p className="my-0">
              Разница:{' '}
              {price1 && price2 ? (
                <span className={color}>
                  {difference < 0 ? <SvgDown /> : <SvgUp />}
                  <span className="ml-0.5">{Math.abs(difference)}%</span>
                </span>
              ) : (
                <span className="red">Нет данных!</span>
              )}
            </p>
            <p className="my-0">
              Индекс Мосбиржи:{' '}
              {index ? (
                <span className={indexColor}>
                  {index < 0 ? <SvgDown /> : <SvgUp />}
                  <span className="ml-0.5">{Math.abs(index)}%</span>
                </span>
              ) : (
                <span className="red">Нет данных!</span>
              )}
              {/* <br />
              BTC:{' '}
              <span style={{ color: index < 0 ? 'red' : 'green' }}>
                {btc}%
              </span>
              <br />
              S&P 500:{' '}
              <span style={{ color: index < 0 ? 'red' : 'green' }}>
                {sp500}%
              </span> */}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default Display;
