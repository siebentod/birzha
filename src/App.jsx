// import './reset.css';
import './index.css';
import './App.scss';
import { Helmet } from 'react-helmet';
import { useReducer } from 'react';
import Footer from './Footer';
import image2 from '../public/image2.webp';
import image from '../public/image.webp';
import { Link } from 'react-router-dom';

const date = new Date();
// const date1 = `${date.getFullYear()}-01`;
const date1 = '2023-12';
let date2 = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
  2,
  '0'
)}`;
// if (date1 === date2) {
//   date2 = `${date.getFullYear() - 1}-01`;
// }

const initialState = {
  date1: date1,
  date2: date2,
  newDate1: '',
  newDate2: '',
  price1: null,
  price2: null,
  ticker: 'GAZP',
  index: null,
  status: 'initial', //loading, loaded, error
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
        newDate1: initialState.newDate1,
        newDate2: initialState.newDate2,
        price1: initialState.price1,
        price2: initialState.price2,
        index: initialState.index,
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
        status: state.status === 'loading' ? 'loaded' : 'loadedWithError',
      };
    case 'successfull':
      return {
        ...state,
        status: 'loaded',
      };
    case 'loadedWithError':
      return {
        ...state,
        status: 'loadedWithError',
        message: action.payload,
      };
    case 'fatalError':
      return {
        ...state,
        status: 'fatalError',
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
      try {
        link += date;
        // console.log(link);
        let res = await fetch(link);
        let data;
        data = await res.json();
        let price = data.securities.data.find(
          (e) => e[0] === ticker && e[2] === 'MRKT'
        )?.[4];
        if (price) {
          return [price, date];
        } else {
          return [null, null];
        }
      } catch (error) {
        return [null, null];
      }
    }

    async function searchDate(link, date) {
      let direction = 'forward';
      if (date.length === 6) {
        date = date.slice(0, -1) + '0' + date.slice(-1);
        console.log(date);
      }
      if (date.length === 7) {
        date += '-01';
      } else if (+date.slice(-2) > 15) {
        direction = 'back';
      }
      for (let i = 1; i <= 6; i++) {
        const [price, newDate] = await get(link, date);
        console.log('try ', date, ': ', price);
        if (price && newDate) {
          console.log('luck! ', newDate, ': ', price);
          return [price, newDate];
        }
        let lastTwoChars = +date.slice(-2);
        if (direction === 'back') {
          let newLastTwoChars = lastTwoChars - 2;
          date =
            date.slice(0, -2) + newLastTwoChars.toString().padStart(2, '0');
        } else {
          let newLastTwoChars = lastTwoChars + 2;
          date =
            date.slice(0, -2) + newLastTwoChars.toString().padStart(2, '0');
        }
        if (i >= 6) {
          // throw new Error(`Данные за ${date.slice(-2)} не найдены`);
          // dispatch({ type: 'loadedWithError', payload: 'noData' });
          console.log(`Данные за ${date.slice(0, -3)} не найдены`);
          // console.log('date', date);
          return [null, date];
        }
      }
    }

    try {
      dispatch({ type: 'loading' });
      console.log('date1', date1);
      console.log('date2', date2);
      const [price1, newDate1] = await searchDate(
        `${BASE_URL}/totals/securities.json?date=`,
        date1
      );
      console.log('price1: ', price1);
      const [price2, newDate2] = await searchDate(
        `${BASE_URL}/totals/securities.json?date=`,
        date2
      );
      console.log('price2: ', price2);
      console.log('newdates: ', newDate1, newDate2);
      try {
        if (price1 === null && price2 === null) {
          console.log('Invalid Ticker');
          throw new Error('Invalid Ticker');
        }
        let index = await indexFunc(newDate1, newDate2);
        dispatch({
          type: 'setPrices',
          payload: {
            price1: price1,
            newDate1: newDate1,
            price2: price2,
            newDate2: newDate2,
            index: index,
          },
        });
      } catch (error) {
        console.log('index: ', index);
        dispatch({ type: 'fatalError', payload: 'Фатальная ошибка' });
      }
    } catch (err) {
      if (status !== 'fatalError')
        dispatch({
          type: 'loadedWithError',
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
    const indPrice1 = data.history.data.find((e) => e[1] === 'IMOEX')?.[7];
    // console.log(price1);

    res = await fetch(
      `${BASE_URL}/markets/index/securities.json?date=${newDate2}`
    );
    data = await res.json();
    const indPrice2 = data.history.data.find((e) => e[1] === 'IMOEX')?.[7];
    // console.log(price2);
    let index;

    if (indPrice1 && indPrice2) {
      index = (((+indPrice2 - +indPrice1) / indPrice1) * 100).toFixed(2);
    } else return undefined;

    return index;
  }

  // useEffect(() => {
  //   getMoexTickerData(ticker, date1, date2);
  // }, []);

  const difference = (((+price2 - +price1) / price1) * 100).toFixed(2);

  return (
    <>
      <Helmet>
        <title>Birzha</title>
        <meta name="description" content="!!!" />
        <meta name="keywords" content="!!!" />
      </Helmet>
      <main className="h-dvh max-w-xl m-auto relative flex flex-col items-center justify-center">
        <div className="display grid min-h-[30%] w-4/5 shadow-md m-3 p-4">
          {status === 'initial' && (
            <div className="relative h-full flex items-center justify-center">
              <img
                src={image2}
                className="absolute h-full justify-self-center"
              />
            </div>
          )}
          {status === 'loading' && (
            <div className="relative h-full flex items-center justify-center">
              <img
                src={image2}
                className="absolute h-full justify-self-center"
              />
              <p className="z-10 flex items-center justify-center inset-0 text-stroke primary text-4xl">
                Загрузка...
              </p>
            </div>
          )}
          {status === 'fatalError' && (
            <div className="flex flex-col relative">
              <div className="relative flex items-center justify-center h-full">
                <img src={image} className="absolute h-full" />
              </div>
              <p className="text-2xl text-center">{message}</p>
            </div>
          )}
          {(status === 'loaded' || status === 'loadedWithError') && (
            <div className="m-auto">
              <p className="my-1">
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
              <p className="my-1">
                Разница:{' '}
                {price1 && price2 ? (
                  <span className={difference < 0 ? 'red' : 'green'}>
                    {difference}%
                  </span>
                ) : (
                  <span className="red">Нет данных!</span>
                )}
              </p>
              <p className="my-1">
                Индекс Мосбиржи:{' '}
                {index ? (
                  <span className={index < 0 ? 'red' : 'green'}>{index}%</span>
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

        <div className="form grid m-3 p-4 w-4/5 min-h-[25%] shadow-md">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form__inputs my-1 grid grid-cols-[max-content_auto] justify-center text-center">
              <p className="mx-1 my-0.5 text-[15px]">Тикер</p>
              <input
                type="text"
                value={ticker}
                onChange={(e) =>
                  dispatch({ type: 'setTicker', payload: e.target.value })
                }
              ></input>
              <p className="mx-1 my-0.5 text-[15px]">Дата 1</p>
              <input
                type="text"
                value={date1}
                onChange={(e) =>
                  dispatch({ type: 'setDate1', payload: e.target.value })
                }
              ></input>
              <p className="mx-1 my-0.5 text-[15px]">Дата 2</p>
              <input
                type="text"
                value={date2}
                onChange={(e) =>
                  dispatch({ type: 'setDate2', payload: e.target.value })
                }
              ></input>
            </div>
            <p className="instruction text-center">
              Введите месяц (2022-05) или день (2022-05-05)
            </p>
            <button
              onClick={() => getMoexTickerData(ticker, date1, date2)}
              className="block m-auto mt-2.5 py-2.5 px-5 rounded-lg transition"
            >
              Get Price
            </button>
            {status === 'loadedWithError' && (
              <div className="flex justify-center mt-1.5">
                <p>
                  Возможные причины ошибок:
                  <br />
                  1. Тикер не существовал в указанную дату
                  <br />
                  2. API не дает слишком ранние даты ☹
                  <br />
                  3. Рынок не работал в запрашиваемый{' '}
                  <span
                    title="Для тикера проверяется 10 ближайших дней"
                    className="custom-underline"
                  >
                    период
                  </span>
                </p>
              </div>
            )}
          </form>
        </div>
      </main>
      <Footer>
        <Link to="/about">About</Link>
      </Footer>
    </>
  );
}

export default App;
