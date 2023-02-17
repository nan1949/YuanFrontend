import {
    LOGIN_ATTEMPT, LOGIN_FAILED, LOGIN_SUCCESS, RETRIEVE_TOKEN, LOGOUT, REGISTER_FAILED,
    GET_TOPICS, GET_BOOKS
} from "./actions";

const initialLoginState = {
    isLoading: false,
    isLoggedIn: false,
    userData: {},
    error: undefined
};

const initialTopicsState = {
    topics: [],
    books: [],
}


function loginReducer(state=initialLoginState, action) {
    switch (action.type) {
        // case RETRIEVE_TOKEN:
        //     return {
        //         ...state,
        //         userToken: action.token,
        //         isLoading: false,
        //     };
        case LOGIN_ATTEMPT:
            return{
                ...state,
                isLoading:true,
                isLoggedIn:false
            }
            break;
        case LOGIN_SUCCESS:
            return {
                ...state,
                isLoading:false,
                isLoggedIn:true,
                userData: action.userData,
                error:undefined
            };
            break;
        case LOGIN_FAILED:
            return{
                ...state,
                isLoading:false,
                isLoggedIn:false,
                error:action.error
            }
            break;
        case REGISTER_FAILED:
            return{
                ...state,
                isLoading:false,
                isLoggedIn:false,
                error:action.error
            }
            break;
        case LOGOUT:
            return {
                ...state,
                isLoading:false,
                isLoggedIn:false,
                userData: {}
            };
            break;
            
        // case REGISTER:
        //     return {
        //         ...state,
        //         userName: action.id,
        //         userToken: action.token,
        //         isLoading: false,
        //     };
        default:
            return state;
    
    }
}

export const topicsReducer = (state=initialTopicsState, action) => {
    switch (action.type) {
        case GET_TOPICS:
            return {...state, topics: action.payload}
        case GET_BOOKS:
            return {...state, books: action.payload}
        default:
            return state;
    }
}

export default loginReducer;

