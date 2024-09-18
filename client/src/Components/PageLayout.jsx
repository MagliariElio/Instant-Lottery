import { useContext, useEffect } from "react";
import { Alert, Button, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import { LoggedUserContext } from "../context/Context";

function PageLayout() {
  const { loggedUser, errors, handleErrors, logout, timeLeft, setTimeLeft, lastDraw, selectedNumbers } = useContext(LoggedUserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (errors) {
      const timer = setTimeout(() => {
        handleErrors(undefined);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [errors, handleErrors]);

  useEffect(() => {
    if (!lastDraw || !lastDraw.drawTime) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const endTime = new Date(lastDraw.drawTime);
      endTime.setMinutes(endTime.getMinutes() + 2);

      const difference = endTime - now;
      setTimeLeft(Math.max(0, Math.floor(difference / 1000)));
    };

    calculateTimeLeft();
    const interval = setInterval(() => {
      calculateTimeLeft();
    }, 1000);

    return () => clearInterval(interval);
  }, [lastDraw?.drawTime]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <Container fluid className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="navbar-custom mb-4">
        <Container>
          <Navbar.Brand onClick={() => navigate("/")} className="navbar-logo" style={{ cursor: "pointer" }}>
            Instant Lottery
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto d-flex align-items-center">
              {loggedUser && (
                <div className="d-flex align-items-center">
                  <p className="text-light mb-0 me-4">
                    <strong>#Bets:</strong> <span className="text-danger ">{selectedNumbers.length}</span>
                  </p>
                  <p className="text-danger mb-0 me-4">
                    <strong>{timeLeft > 0 ? <span>Countdown: {formatTime(timeLeft)}</span> : <span>Time's up!</span>}</strong>
                  </p>
                  <p className="text-light mb-0">
                    <strong>{loggedUser.username}</strong> ({loggedUser.points} points)
                  </p>
                </div>
              )}

              {loggedUser ? (
                <Button variant="outline-light" onClick={logout} className="ms-3">
                  Logout
                </Button>
              ) : (
                <>
                  <Button variant="outline-light" className="me-2" onClick={() => navigate("/register")}>
                    Register
                  </Button>
                  <Button variant="outline-light" onClick={() => navigate("/login")}>
                    Login
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Row className="flex-grow-1">
        {/* Sidebar */}
        <Col xs={2} className="sidebar-custom p-3">
          <Nav className="flex-column">
            <Nav.Link className="sidebar-link" active onClick={() => navigate("")} style={{ color: '#ffff', fontWeight:'bold' }}>
              Home
            </Nav.Link>
            {loggedUser && (
              <>
                <Nav.Link className="sidebar-link" onClick={() => navigate("/profile")} style={{ color: '#ffff', fontWeight:'bold' }}>
                  Profile
                </Nav.Link>
                <Nav.Link className="sidebar-link" onClick={() => navigate("/bet/history")} style={{ color: '#ffff', fontWeight:'bold' }}>
                  Bet History
                </Nav.Link>
                <Nav.Link className="sidebar-link" onClick={() => navigate("/draw/history")} style={{ color: '#ffff', fontWeight:'bold' }}>
                  Past Draws
                </Nav.Link>
                <Nav.Link className="sidebar-link" onClick={() => navigate("/players/top")} style={{ color: '#ffff', fontWeight:'bold' }}>
                  Top Players
                </Nav.Link>
                <Nav.Link className="sidebar-link" onClick={() => navigate("/rules")} style={{ color: '#ffff', fontWeight:'bold' }}>
                  Rules
                </Nav.Link>
              </>
            )}
          </Nav>
        </Col>

        <Col xs={10} className="content-section">
          {errors && (
            <div className="d-flex justify-content-center align-items-center">
              <Alert variant={errors.status} style={{ borderRadius: "20px" }} onClose={() => handleErrors(undefined)} dismissible>
                {errors.message}
              </Alert>
            </div>
          )}
          <Outlet />
        </Col>
      </Row>

      {/* Footer */}
      <footer className="footer-custom mt-auto footer-expand-lg">
        <Container fluid="lg" className="d-flex align-items-center justify-content-between">
          {/* Logo */}
          <Col xs="auto">
            <img src="ticket-icon.svg" alt="logo" className="footer-logo" />
          </Col>

          {/* Copyright */}
          <Col xs="auto" className="text-center">
            <p className="footer-text mb-0">&copy; {new Date().getFullYear()} All rights reserved. Developed by George Eftime Florin.</p>
          </Col>
        </Container>
      </footer>
    </Container>
  );
}

export default PageLayout;
