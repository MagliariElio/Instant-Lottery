const SERVER_HOST = "http://localhost";
const SERVER_PORT = 3001;

const SERVER_URL = `${SERVER_HOST}:${SERVER_PORT}/api/`;

/**
 * Generic API call
 *
 * @param endpoint API endpoint string to fetch
 * @param method HTTP method
 * @param body HTTP request body string
 * @param headers additional HTTP headers to be passed to 'fetch'
 * @param expectResponse wheter to expect a non-empty response body
 *
 * @returns whatever the specified API endpoint returns
 */
const APICall = async (endpoint, method = "GET", body = undefined, headers = undefined, expectResponse = true) => {
  let errors = [];

  try {
    const response = await fetch(new URL(endpoint, SERVER_URL), {
      method,
      body,
      headers,
      credentials: "include",
    });

    if (response.ok) {
      if (expectResponse) {
        return await response.json();
      }
    } else errors = (await response.json()).error;
  } catch (errs) {
    const err = ["Failed to contact the server"];
    throw err;
  }

  if (errors && errors.length !== 0) throw errors;
};

const fetchCurrentUser = async () => {
  return await APICall("session/current");
};

const fetchLastDraw = async () => {
  return await APICall("draw/current");
};

const fetchCurrentBet = async () => {
  return await APICall("bet/current");
};

const fetchLastDrawTimeLeft = async () => {
  return await APICall("time-left");
};

const getPastDraws = async () => {
  return await APICall("draw");
};

const getTopPlayers = async () => {
  return await APICall("leaderboard");
};

const fetchLastNumberBet = async () => {
  return await APICall("bet/previous");
};

const getBetHistory = async () => {
  return await APICall("bet");
};

const postBet = async (numbers) => {
  return await APICall("bet", "POST", JSON.stringify({ numbers: numbers }), { "Content-Type": "application/json" });
};

const updateUserProfile = async (name, surname) => {
  return await APICall("profile/update/", "PUT", JSON.stringify({ name: name, surname: surname }), { "Content-Type": "application/json" });
};

const cancelLastBet = async () => {
  return await APICall("bet", "DELETE");
};

/**
 * Attempts to login the user
 *
 * @param username email of the user
 * @param password password of the user
 */
const login = async (username, password) =>
  await APICall("session", "POST", JSON.stringify({ username, password }), { "Content-Type": "application/json" });

/**
 * Attempts to login the user
 *
 * @param username email of the user
 * @param password password of the user
 */
const register = async (username, password, name, surname) =>
  await APICall("register", "POST", JSON.stringify({ username, password, name, surname }), { "Content-Type": "application/json" });

/**
 * Logout.
 * This function can return a "Not authenticated" error if the student wasn't authenticated beforehand
 */
const logout = async () => await APICall("session", "DELETE", undefined, undefined, false);

const API = {
  login,
  register,
  logout,
  fetchCurrentUser,
  postBet,
  fetchLastDraw,
  fetchLastDrawTimeLeft,
  updateUserProfile,
  cancelLastBet,
  fetchCurrentBet,
  getBetHistory,
  getPastDraws,
  getTopPlayers,
  fetchLastNumberBet
};
export default API;
