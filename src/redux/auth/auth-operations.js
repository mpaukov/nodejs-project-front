import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

const token = {
  set(token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  },
  unset() {
    axios.defaults.headers.common.Authorization = '';
  },
};

/*
 * POST @ /auth/signup
 * body: { name, email, password }
 * После успешной регистрации добавляем токен в HTTP-заголовок
 */
const register = createAsyncThunk('auth/signup', async credentials => {
  try {
    const { data } = await axios.post('/auth/signup', credentials);
    token.set(data.token);
    return data;
  } catch (error) {
    console.log('Error during creating user', error);
    // TODO: Добавить обработку ошибки error.message
  }
});

/*
 * POST @ /auth/login
 * body: { email, password }
 * После успешного логина добавляем токен в HTTP-заголовок
 */
const logIn = createAsyncThunk('auth/login', async credentials => {
  try {
    const { data } = await axios.post('/auth/login', credentials);
    token.set(data.token);
    return data;
  } catch (error) {
    console.log('Error during login in user', error);
    // TODO: Добавить обработку ошибки error.message
  }
});

/*
 * POST @ /auth/logout
 * headers: Authorization: Bearer token
 * После успешного логаута, удаляем токен из HTTP-заголовка
 */
const logOut = createAsyncThunk('auth/logout', async () => {
  try {
    await axios.get('/auth/logout');
    token.unset();
  } catch (error) {
    console.log('Error during log out user', error);
    // TODO: Добавить обработку ошибки error.message
  }
});
/*
 * GET @ /users/current
 * headers:
 *    Authorization: Bearer token
 *
 * 1. Забираем токен из стейта через getState()
 * 2. Если токена нет, выходим не выполняя никаких операций
 * 3. Если токен есть, добавляет его в HTTP-заголовок и выполянем операцию
 */
const fetchCurrentUser = createAsyncThunk(
  'auth/refresh',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const persistedToken = state.auth.token;

    if (persistedToken === null) {
      return thunkAPI.rejectWithValue();
    }

    token.set(persistedToken);
    try {
      const { data } = await axios.get('/users/current');
      return data;
    } catch (error) {
      // TODO: Добавить обработку ошибки error.message
    }
  },
);

const operations = {
  register,
  logOut,
  logIn,
  fetchCurrentUser,
};
export default operations;
