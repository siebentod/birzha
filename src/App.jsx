// import './reset.css';
import './index.css';
import { Helmet } from 'react-helmet';
import { useReducer } from 'react';
import LinksIcons from './LinksIcons';
import Display from './Display';
import { initialState, reducer } from './lib';

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

  return (
    <>
      <Helmet>
        <title>Сравнение стоимости между датами | Birzha</title>
      </Helmet>
      <main className="h-dvh max-w-xl m-auto relative flex flex-col items-center justify-center min-h-min">
        <Display
          status={status}
          message={message}
          ticker={ticker}
          index={index}
          newDate1={newDate1}
          price1={price1}
          newDate2={newDate2}
          price2={price2}
        />

        <div className="bg-[#f2e8c6] border border-[#4f0000] grid m-3 p-4 w-4/5 min-h-[max(25%_500px)] shadow-md rounded-lg">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="my-1 grid grid-cols-[max-content_auto] justify-center text-center">
              <p className="mx-1 my-0.5 text-[15px]">Тикер</p>
              <input
                type="text"
                className="input pl-1"
                value={ticker}
                onChange={(e) =>
                  dispatch({ type: 'setTicker', payload: e.target.value })
                }
              ></input>
              <p className="mx-1 my-0.5 text-[15px]">Дата 1</p>
              <input
                type="text"
                className="input pl-1"
                value={date1}
                onChange={(e) =>
                  dispatch({ type: 'setDate1', payload: e.target.value })
                }
              ></input>
              <p className="mx-1 my-0.5 text-[15px]">Дата 2</p>
              <input
                type="text"
                className="input pl-1"
                value={date2}
                onChange={(e) =>
                  dispatch({ type: 'setDate2', payload: e.target.value })
                }
              ></input>
            </div>
            <p className="text-[0.938rem] text-center">
              Введите месяц (2022-05) или день (2022-05-05)
            </p>
            <button
              onClick={() => getMoexTickerData(ticker, date1, date2)}
              className="text-[#200707de] bg-[#dad4b5] hover:bg-[#cfc9aa] block m-auto mt-2.5 py-2.5 px-5 rounded-lg transition shadow"
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
      <LinksIcons color="text-[#f2e8c6]" />
    </>
  );
}

export default App;
