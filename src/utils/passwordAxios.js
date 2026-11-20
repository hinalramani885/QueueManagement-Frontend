//src/utils/passwordAxios.js
import axios from 'axios';
import { API_BASE_URL } from '../config';

const passwordAxios = axios.create({
  baseURL: `${API_BASE_URL}/password`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default passwordAxios;
