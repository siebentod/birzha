import './App.scss';
import { Helmet } from 'react-helmet';
import Footer from './Footer';
import { useEffect, useReducer, useState } from 'react';

const initialState = {
  price1: '',
  price2: '',
  date: '',
  index: '',
  status: '', //loading, loadedWithError
};

function reducer(state, action) {
  switch (action.type) {
    case 'dataReceiverd':
      return {
        ...state,
        x: action.payload,
        status: 'ready',
      };
    case 'dataFailed':
      return {
        ...state,
        status: 'error',
      };
    default:
      throw new Error('Action unknown');
  }
}

setPrice1(data.history.data[0][7]);
newGotDate1 = data.history.data[0]?.[1];
setGotDate1(newGotDate1);
setLink1(
  `https://iss.moex.com/iss/history/engines/stock/markets/shares/securities/${ticker}.json?from=${date1}-01&till=${date1}-28&marketprice_board=1&limit=1&sort_column=TRADEDATE&sort_order=asc`
);

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [price1, setPrice1] = useState(null);
  const [price2, setPrice2] = useState(null);
  const [ticker, setTicker] = useState('TCSG');
  const [date1, setDate1] = useState('2023-08');
  const [date2, setDate2] = useState('2024-08');
  const [gotDate1, setGotDate1] = useState('');
  const [gotDate2, setGotDate2] = useState('');
  const [index, setIndex] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [link1, setLink1] = useState(false);
  const [link2, setLink2] = useState(false);
  const [error, setError] = useState(false);

  async function getMoexTickerData(ticker, date1, date2) {
    try {
      setLoaded(false);
      setError(false);

      let res = await fetch(
        `https://iss.moex.com/iss/history/engines/stock/markets/shares/securities/${ticker}.json?from=${date1}-01&till=${date1}-28&marketprice_board=1&limit=1&sort_column=TRADEDATE&sort_order=asc`
      );
      let data = await res.json();
      let newGotDate1;
      if (data.history.data[0]?.[7]) {
        setPrice1(data.history.data[0][7]);
        newGotDate1 = data.history.data[0]?.[1];
        setGotDate1(newGotDate1);
        setLink1(
          `https://iss.moex.com/iss/history/engines/stock/markets/shares/securities/${ticker}.json?from=${date1}-01&till=${date1}-28&marketprice_board=1&limit=1&sort_column=TRADEDATE&sort_order=asc`
        );
      } else {
        res = await fetch(
          `https://iss.moex.com/iss/history/engines/stock/totals/securities.json?date=${date1}-01`
        );
        data = await res.json();
        setPrice1(data.securities.data.find((e) => e[0] === ticker)?.[4]);
        newGotDate1 = `${date1}-01`;
        setGotDate1(newGotDate1);
        setLink1(
          `https://iss.moex.com/iss/history/engines/stock/totals/securities.json?date=${date1}-01`
        );
      }

      // Вторая дата
      res = await fetch(
        `https://iss.moex.com/iss/history/engines/stock/markets/shares/securities/${ticker}.json?from=${date2}-01&till=${date2}-28&marketprice_board=1&limit=1&sort_column=TRADEDATE&sort_order=asc`
      );
      data = await res.json();
      setPrice2(data.history.data[0]?.[7]);
      const newGotDate2 = data.history.data[0]?.[1];
      setGotDate2(newGotDate2);
      setLink2(
        `https://iss.moex.com/iss/history/engines/stock/markets/shares/securities/${ticker}.json?from=${date2}-01&till=${date2}-28&marketprice_board=1&limit=1&sort_column=TRADEDATE&sort_order=asc`
      );

      await indexFunc(newGotDate1, newGotDate2);

      setLoaded(true);
    } catch (err) {
      setError(err.message);
    }
  }

  async function indexFunc(gotDate1, gotDate2) {
    let res = gotDate1
      ? await fetch(
          `https://iss.moex.com/iss/history/engines/stock/markets/index/securities.json?date=${gotDate1}`
        )
      : await fetch(
          `https://iss.moex.com/iss/history/engines/stock/markets/index/securities.json?date=${date1}-01`
        );

    let data = await res.json();
    const price1 = data.history.data.find((e) => e[1] === 'IMOEX')?.[7];

    res = gotDate2
      ? await fetch(
          `https://iss.moex.com/iss/history/engines/stock/markets/index/securities.json?date=${gotDate2}`
        )
      : await fetch(
          `https://iss.moex.com/iss/history/engines/stock/markets/index/securities.json?date=${date2}-01`
        );

    data = await res.json();
    const price2 = data.history.data.find((e) => e[1] === 'IMOEX')[7];

    setIndex((((+price2 - +price1) / price1) * 100).toFixed(2));
  }

  useEffect(() => {
    getMoexTickerData(ticker, date1, date2);
  }, []);

  const difference = (((+price2 - +price1) / price1) * 100).toFixed(2);

  return (
    <>
      <Helmet>
        <title>!!!</title>
        <meta name="description" content="!!!" />
        <meta name="keywords" content="!!!" />
      </Helmet>
      <main>
        <form onSubmit={(e) => e.preventDefault()}>
          <button onClick={() => getMoexTickerData(ticker, date1, date2)}>
            Get Price
          </button>
          <br />
          Ticker:{' '}
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
          ></input>{' '}
          <a href="google.ru">list</a>
          <br />
          Date 1:{' '}
          <input
            type="text"
            value={date1}
            onChange={(e) => setDate1(e.target.value)}
          ></input>
          <br />
          Date 2:{' '}
          <input
            type="text"
            value={date2}
            onChange={(e) => setDate2(e.target.value)}
          ></input>
        </form>
        Введите месяц (2022-05) или день (2022-05-05). День может оказаться
        нерабочим! // Todo: ввод дня не реализован. Можно сделать цикл, который
        в случае отсутствия данных будет отсчитывать дни вперед, пока данные не
        появятся? // Нужно изучить API биржи, чтобы найти самый лучший вариант
        для нахождения самой ранней информации. Пока что я не знаю как к этому
        подступиться. Нужно ли мне будет пытаться фетчить разные ссылки, или
        есть одна самая лучшая?
        {!error ? (
          loaded ? (
            <div>
              <p>
                {price1 ? (
                  <>
                    Стоимость {ticker} на {gotDate1}:{' '}
                    <span style={{ color: 'lightblue' }}>
                      <a href={link1}>{price1}</a>
                    </span>
                  </>
                ) : (
                  <>
                    Стоимость {ticker} на {date1}:{' '}
                    <span style={{ color: 'red' }}>Нет данных!</span>
                  </>
                )}
                <br />
                {price2 ? (
                  <>
                    Стоимость {ticker} на {gotDate2}:{' '}
                    <span style={{ color: 'lightblue' }}>
                      <a href={link2}>{price2}</a>
                    </span>
                  </>
                ) : (
                  <>
                    Price of {ticker} For {date2}:{' '}
                    <span style={{ color: 'red' }}>Нет данных!</span>
                  </>
                )}
                <br />
                {price1 && price2 ? (
                  <>
                    Разница:{' '}
                    <span style={{ color: difference < 0 ? 'red' : 'green' }}>
                      {difference}%
                    </span>
                  </>
                ) : (
                  <>
                    Разница: <span style={{ color: 'red' }}>Нет данных!</span>
                  </>
                )}
              </p>
              <p>
                Индекс Мосбиржи:{' '}
                <span style={{ color: index < 0 ? 'red' : 'green' }}>
                  {index}%
                </span>
                <br />
                BTC:{' '}
                <span style={{ color: index < 0 ? 'red' : 'green' }}>
                  {error}%
                </span>
                <br />
                Индекс США как называется:{' '}
                <span style={{ color: index < 0 ? 'red' : 'green' }}>
                  {error}%
                </span>
              </p>
            </div>
          ) : (
            <p>Loading...</p>
          )
        ) : (
          <p>{error}</p>
        )}
      </main>
      <Footer />
    </>
  );
}

export default App;
