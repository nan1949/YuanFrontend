
export const REGISTER ='REGISTER';
export const REGISTER_FAILED ='REGISTER_FAILED';
export const LOGIN_ATTEMPT ='LOGIN_ATTEMPT';
export const LOGIN_SUCCESS ='LOGIN_SUCCESS';
export const LOGIN_FAILED ='LOGIN_FAILED';
export const RETRIEVE_TOKEN ='RETRIEVE_TOKEN';
export const LOGOUT ='LOGOUT';
export const GET_TOPICS = 'GET_TOPICS';
export const GET_BOOKS = 'GET_BOOKS';


const API_URL_BOOKS = 'http://10.0.2.2:8000/api/books/books/';
const API_URL_TOPICS = 'http://10.0.2.2:8000/api/books/topics/';
const API_URL_LOGIN = 'http://10.0.2.2:8000/api/users/login';
const API_URL_REGISTER = 'http://10.0.2.2:8000/api/users/register';


export const isLoading = (bool) => {
  return {
    type: LOGIN_ATTEMPT,
    isLoading: bool
  }
}

export const loginSuccess = (userData) => {
  return {
    type: LOGIN_SUCCESS,
    userData
  }
}

export const loginFailed = (error) => {
  return {
    type: LOGIN_FAILED,
    error
  }
}

export const registerFailed = (error) => {
  return {
    type: REGISTER_FAILED,
    error
  }
}


export const login = (data) => {
  var bodyFormData = new FormData();
  bodyFormData.append('username', data.email);
  bodyFormData.append('password', data.password);
  try {
    return async dispatch => {
      dispatch(isLoading(true));
      const result = await fetch(API_URL_LOGIN,{
        method: 'POST',
        headers: {'Content-Type': 'multipart/form-data' },
        body: bodyFormData,
      });
      const json = await result.json();
      console.log(json);
      dispatch(isLoading(false));
      if (json) {
        if(json.response=='Successfully authenticated.') {
          dispatch(loginSuccess(json));
          console.log(json);
        } else {
          dispatch(loginFailed(json.error_message));
        }
      } else {
        console.log('Unable to fetch!')
      }
    }    
  } catch (error) {
    console.log(error)
  }
  
}


export const register = (data) => {
  
  var bodyFormData = new FormData();
  bodyFormData.append('username', data.username);
  bodyFormData.append('email', data.email);
  bodyFormData.append('password', data.password);
  bodyFormData.append('password2', data.confirm_password);
  return async dispatch => {
    const result = await fetch(API_URL_REGISTER, {
      method: 'POST',
      headers: {'Content-Type': 'multipart/form-data' },
      body: bodyFormData,
    });
    
    const json = await result.json();
    console.log(json);
    if (json) {
      if (json.response == 'successfully registered new user.') {
        dispatch(loginSuccess(json));
        console.log(json);
      } else {
        dispatch(registerFailed(json.error_message));
        console.log(json.error_message);
      }
    } else {
      console.log('Unable to register.')
    }
  }
}

export const logout = () => dispatch => {
  dispatch({
    type: LOGOUT,
  });
}

export const getTopics = () => {
  try {
    return async dispatch => {
      const result = await fetch(API_URL_TOPICS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await result.json();
      if (json) {
        dispatch({
          type: GET_TOPICS,
          payload: json
        });
        console.log(json)
      } else {
        console.log('Unable to fetch!')
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const getBooks = (topic) => {
  try {
    return async dispatch => {
      console.log(`${API_URL_BOOKS}?topic=${topic}`)
      const result = await fetch(`${API_URL_BOOKS}?topic=${topic}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await result.json();
      if (json) {
        dispatch({
          type: GET_BOOKS,
          payload: json
        });
      } else {
        console.log('Unable to fetch!')
      }
    }
  } catch (error) {
    console.log(error)
  }
}