import axios from "axios";
import Cookies from "js-cookie";

const baseURL = process.env.REACT_APP_API_URL;

const API = axios.create({
  baseURL,
});

export const sendMessage = async (message: string) => {
  const token = Cookies.get("authToken");
  const response = await API.post(
    "/",
    { chats: message },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.output;
};
