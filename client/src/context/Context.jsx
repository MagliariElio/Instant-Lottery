import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API";
import { io } from "socket.io-client";

export const LoggedUserContext = createContext(); // context for logged user

/**
 * Context used to get the user logged in the system
 */
export const LoggedUserProvider = ({ children }) => {
  const navigate = useNavigate();
  const [loggedUser, setLoggedUser] = useState(null);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [lastNumberBet, setLastNumberBet] = useState([]);
  const [lastDraw, setLastDraw] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [errors, setErrors] = useState(undefined); // list of errors

  /**
   * This handle has the responsability to manage all errors in the system
   */
  const handleErrors = (error) => {
    let errorsList = error;

    setErrors(errorsList);
    console.clear();
  };

  /**
   * Perform the login
   *
   * @param username username of the user
   * @param password password of the user
   */
  const login = async (username, password) => {
    await API.login(username, password).then((user) => {
      setLoggedUser(user);
      navigate("/");
    });
  };

  /**
   * Perform the registration
   *
   * @param username username of the user
   * @param password password of the user
   * @param firstName firstName of the user
   * @param surname surname of the user
   */
  const register = async (username, password, firstName, surname) => {
    await API.register(username, password, firstName, surname).then((user) => {
      setLoggedUser(user);
      navigate("/");
    });
  };

  /**
   * Perform the logout
   */
  const logout = () => {
    API.logout()
      .then(() => {
        handleErrors(undefined); // clean all errors
      })
      .catch((err) => {
        handleErrors(undefined);
        handleErrors([err]);
      })
      .finally(() => {
        setLoggedUser(null); // delete the state for the logged user
        navigate("/");
      });
  };

  const updateTimeout = () => {
    if (loggedUser) {
      const socket = io("http://localhost:3001");

      socket.on("connect", () => {
        console.log("Socket.IO connection established", socket.id);
      });

      socket.on("draw", (data) => {
        console.log("Received draw from server:", data);
        setLastDraw({ draw: data.draw, drawTime: data.drawTime });
        setLastNumberBet([]);
      });

      socket.on("resultDraw", (data) => {
        console.log("Received draw result from server:", data);

        const updatedUser = { ...loggedUser, points: data.points };
        setLoggedUser(updatedUser);

        if (data.userId === loggedUser.id) {
          setLastNumberBet(data.numbers);
          setSelectedNumbers([]);
          if (data.correctNumbers === 0) {
            handleErrors({ message: "Sorry, none of the numbers in your bet are correct. Better luck next time!", status: "danger" });
          } else if (data.correctNumbers === 1 || data.correctNumbers === 2) {
            handleErrors({
              message: "You have guessed some numbers correctly! You have won points proportional to the number of correct guesses.",
              status: "warning",
            });
          } else if (data.correctNumbers === 3) {
            handleErrors({ message: "Congratulations! All the numbers in your bet are correct. You have won double the points!", status: "success" });
          }
        }
      });

      socket.on("disconnect", () => {
        console.log("Socket.IO disconnected");
      });

      return () => {
        socket.disconnect();
      };
    }
  };

  return (
    <LoggedUserContext.Provider
      value={{
        loggedUser,
        logout,
        login,
        register,
        setLoggedUser,
        errors,
        handleErrors,
        selectedNumbers,
        setSelectedNumbers,
        lastDraw,
        setLastDraw,
        timeLeft,
        setTimeLeft,
        lastNumberBet,
        setLastNumberBet,
        updateTimeout,
      }}
    >
      {children}
    </LoggedUserContext.Provider>
  );
};
