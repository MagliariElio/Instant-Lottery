"use strict";
import { useState, useEffect, useContext } from "react";
import { Routes, Route, Navigate, BrowserRouter, Link } from "react-router-dom";
import { LoginForm } from "./Components/LoginForm";
import { MdErrorOutline } from "react-icons/md";
import "./App.css";
import API from "./API";
import { Button, Col, Container, Row } from "react-bootstrap";
import { ExclamationTriangle } from "react-bootstrap-icons";
import PageLayout from "./Components/PageLayout";
import { LoggedUserContext, LoggedUserProvider } from "./context/Context";
import Profile from "./Components/Profile";
import NumberGrid from "./Components/NumberGrid";
import BetHistory from "./Components/BetHistory";
import PastDraws from "./Components/PastDraws";
import TopPlayers from "./Components/TopPlayers";
import RegisterForm from "./Components/RegisterForm";
import RulesPage from "./Components/RulesPage";
import { io } from "socket.io-client";

function App() {
  return (
    <BrowserRouter>
      <LoggedUserProvider>
        <Main />
      </LoggedUserProvider>
    </BrowserRouter>
  );
}

function Main() {
  const { loggedUser, setLoggedUser, handleErrors, setSelectedNumbers, setLastDraw } = useContext(LoggedUserContext);

  // check authentication
  useEffect(() => {
    API.fetchCurrentUser().then((user) => setLoggedUser(user));
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on("connect", () => {
      console.log("Socket.IO connection established", socket.id);
    });

    socket.on("draw", (data) => {
      console.log("Received draw from server:", data);
      setLastDraw({ draw: data.draw, drawTime: data.drawTime });
    });

    socket.on("resultDraw", (data) => {
      console.log("Received draw result from server:", data);

      const updatedUser = { ...loggedUser, points: data.points };
      setLoggedUser(updatedUser);

      if (data.userId === loggedUser.id) {
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
  }, []);

  return (
    <Routes>
      <Route path="/" element={<PageLayout />}>
        <Route path="/" element={loggedUser ? <NumberGrid /> : <RulesPage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/login" element={loggedUser ? <Navigate replato to="/" /> : <LoginForm />} />
        <Route path="/register" element={loggedUser ? <Navigate replato to="/" /> : <RegisterForm />} />
        <Route path="/bet/history" element={loggedUser ? <BetHistory /> : <UnAuthorizationPage />} />
        <Route path="/draw/history" element={loggedUser ? <PastDraws /> : <UnAuthorizationPage />} />
        <Route path="/players/top" element={loggedUser ? <TopPlayers /> : <UnAuthorizationPage />} />
        <Route path="/profile" element={loggedUser ? <Profile /> : <UnAuthorizationPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function UnAuthorizationPage() {
  return (
    <Container fluid style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
      <Row className="justify-content-center">
        <Col xs={12} md={8}>
          <h4 className="mb-4">
            <MdErrorOutline fontSize="inherit" /> Access Not Authorized <MdErrorOutline fontSize="inherit" />
          </h4>
          <p>
            You are not allowed to access this page, please go back to the <Link to="/">home</Link>.
          </p>
        </Col>
      </Row>
    </Container>
  );
}

function NotFoundPage() {
  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row>
        <Col className="text-center">
          <h1 className="display-4">
            <ExclamationTriangle className="me-2" />
            The page cannot be found
            <ExclamationTriangle className="ms-2" />
          </h1>
          <p className="lead">
            The requested page does not exist. Please go back to the{" "}
            <Link to="/" className="text-primary">
              home
            </Link>
            .
          </p>
          <Link to="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
