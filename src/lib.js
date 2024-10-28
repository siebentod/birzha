const date = new Date();
const date1 = '2023-12';
const date2 = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
  2,
  '0'
)}`;

export const initialState = {
  date1: date1,
  date2: date2,
  newDate1: '',
  newDate2: '',
  price1: null,
  price2: null,
  ticker: 'GAZP',
  index: null,
  status: 'initial',
};

export function reducer(state, action) {
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
