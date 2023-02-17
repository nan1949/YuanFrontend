import { createStore, combineReducers, applyMiddleware} from "redux";
import thunk from "redux-thunk";
import loginReducer, { topicsReducer } from "./reducers";

const rootReducer = combineReducers({loginReducer, topicsReducer})

export const Store = createStore(rootReducer, applyMiddleware(thunk));