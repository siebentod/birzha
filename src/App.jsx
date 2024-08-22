import './App.scss';
import { Helmet } from 'react-helmet';
import Footer from './Footer';
import { useEffect, useReducer } from 'react';

const initialState = {
  date1: '2021-07',
  date2: '2024-07',
  newDate1: '',
  newDate2: '',
  price1: null,
  price2: null,
  ticker: 'GAZP',
  index: null,
  status: '', //loading, loaded, error
};

function reducer(state, action) {
  switch (action.type) {
    case 'setTicker':
      return {
        ...state,
        ticker: action.payload,
      };
    case 'loading':
      return {
        ...state,
        status: 'loading',
      };
    case 'setDate1':
      return {
        ...state,
        date1: action.payload,
      };
    case 'setDate2':
      return {
        ...state,
        date2: action.payload,
      };
    case 'getFirstTicker':
      return {
        ...state,
        price1: action.payload.price1,
        newDate1: action.payload.newDate1,
      };
    case 'getSecondTicker':
      return {
        ...state,
        price2: action.payload.price2,
        newDate2: action.payload.newDate2,
      };
    case 'setPrices':
      return {
        ...state,
        price1: action.payload.price1,
        newDate1: action.payload.newDate1,
        price2: action.payload.price2,
        newDate2: action.payload.newDate2,
        index: action.payload.index,
        // status: action.payload.status,
        status: 'loaded',
      };
    case 'error':
      return {
        ...state,
        status: 'loadedWithError',
        message: action.payload,
      };
    default:
      throw new Error('Action unknown');
  }
}

const BASE_URL = 'https://iss.moex.com/iss/history/engines/stock';

function App() {
  const [
    {
      date1,
      date2,
      newDate1,
      newDate2,
      price1,
      price2,
      ticker,
      index,
      status,
      message,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  async function getMoexTickerData(ticker, date1, date2) {
    async function get(link, date) {
      link += date;
      console.log(link);
      let res = await fetch(link);
      let data = await res.json();
      let price = data.securities.data.find(
        (e) => e[0] === ticker && e[2] === 'MRKT'
      )?.[4];
      if (price) {
        return [price, date];
      } else {
        return [null, null];
      }
    }

    async function searchDate(link, date) {
      let direction = 'forward';
      if (date.length === 7) {
        date += '-01';
      } else if (+date.slice(-2) > 15) {
        direction = 'back';
      }
      for (let i = 1; i < 9; i++) {
        const [price, newDate] = await get(link, date);
        if (price && newDate) {
          return [price, newDate];
        }
        let lastTwoChars = +date.slice(-2);
        if (direction === 'back') {
          let newLastTwoChars = lastTwoChars - 1;
          date =
            date.slice(0, -2) + newLastTwoChars.toString().padStart(2, '0');
        } else {
          let newLastTwoChars = lastTwoChars + 1;
          date =
            date.slice(0, -2) + newLastTwoChars.toString().padStart(2, '0');
        }
        if (i === 8) {
          // throw new Error(`Данные за ${date.slice(-2)} не найдены`);
          // dispatch({ type: 'error', payload: 'noData' });
          console.log(`Данные за ${date.slice(0, -3)} не найдены`);
          return [null, date];
        }
      }
    }

    try {
      dispatch({ type: 'loading' });

      const [price1, newDate1] = await searchDate(
        `${BASE_URL}/totals/securities.json?date=`,
        date1
      );
      console.log('price1 ', price1);
      const [price2, newDate2] = await searchDate(
        `${BASE_URL}/totals/securities.json?date=`,
        date2
      );
      console.log('price2 ', price2);

      let index = await indexFunc(newDate1, newDate2);

      dispatch({
        type: 'setPrices',
        payload: {
          price1: price1,
          newDate1: newDate1,
          price2: price2,
          newDate2: newDate2,
          index: index,
          // status: status === 'loading' ? 'loaded' : 'loadedWithError',
        },
      });
    } catch (err) {
      dispatch({
        type: 'error',
        payload: err.message,
        // todo СЕЙЧАС ВСЕ РАБОТАЕТ НЕПРАВИЛЬНО, НУЖНО СДЕЛАТЬ УЛЬТИМАТИВНУЮ ОШИБКУ ЕСЛИ НЕ НАХОДИТСЯ ОДНА ИЗ ДАТ
      });
    }
  }

  async function indexFunc(newDate1, newDate2) {
    let res = await fetch(
      `${BASE_URL}/markets/index/securities.json?date=${newDate1}`
    );
    let data = await res.json();
    const price1 = data.history.data.find((e) => e[1] === 'IMOEX')?.[7];
    console.log(price1);

    res = await fetch(
      `${BASE_URL}/markets/index/securities.json?date=${newDate2}`
    );
    data = await res.json();
    const price2 = data.history.data.find((e) => e[1] === 'IMOEX')?.[7];

    let index = (((+price2 - +price1) / price1) * 100).toFixed(2);
    if (isNaN(index)) {
      index = undefined;
    }

    return index;
  }

  useEffect(() => {
    getMoexTickerData(ticker, date1, date2);
  }, []);

  const difference = (((+price2 - +price1) / price1) * 100).toFixed(2);

  return (
    <>
      <Helmet>
        <title>Birzha</title>
        <meta name="description" content="!!!" />
        <meta name="keywords" content="!!!" />
      </Helmet>
      <main>
        <div className="display">
          {status === 'loading' && <p>Loading...</p>}
          {status === 'error' && <p>{message}</p>}
          {(status === 'loaded' || status === 'loadedWithError') && (
            <>
              <p>
                Стоимость <span className="blue">{ticker}</span> на {newDate1}:{' '}
                {price1 ? (
                  <span className="blue">{price1}</span>
                ) : (
                  <span style={{ color: 'red' }}>Нет данных!</span>
                )}
                <br />
                <span className="hide">Стоимость {ticker} </span>на {newDate2}:{' '}
                {price2 ? (
                  <span className="blue">{price2}</span>
                ) : (
                  <span style={{ color: 'red' }}>Нет данных!</span>
                )}
              </p>
              <p>
                Разница:{' '}
                {price1 && price2 ? (
                  <span style={{ color: difference < 0 ? 'red' : 'green' }}>
                    {difference}%
                  </span>
                ) : (
                  <span style={{ color: 'red' }}>Нет данных!</span>
                )}
              </p>
              <p>
                Индекс Мосбиржи:{' '}
                {index ? (
                  <span style={{ color: index < 0 ? 'red' : 'green' }}>
                    {index}%
                  </span>
                ) : (
                  <span style={{ color: 'red' }}>Нет данных!</span>
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
            </>
          )}
        </div>

        <div className="form">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form__inputs">
              <p>Тикер</p>
              <input
                type="text"
                value={ticker}
                onChange={(e) =>
                  dispatch({ type: 'setTicker', payload: e.target.value })
                }
              ></input>
              <p>Дата 1</p>
              <input
                type="text"
                value={date1}
                onChange={(e) =>
                  dispatch({ type: 'setDate1', payload: e.target.value })
                }
              ></input>
              <p>Дата 2</p>
              <input
                type="text"
                value={date2}
                onChange={(e) =>
                  dispatch({ type: 'setDate2', payload: e.target.value })
                }
              ></input>
            </div>
            <p>Введите месяц (2022-05) или день (2022-05-05)</p>
            <button onClick={() => getMoexTickerData(ticker, date1, date2)}>
              Get Price
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default App;
