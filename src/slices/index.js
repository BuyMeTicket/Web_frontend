import loginReducer from './loginSlice'
import globalReducer from './globalSlice'

export const reducers = {
  global: globalReducer,
  login: loginReducer,
}
