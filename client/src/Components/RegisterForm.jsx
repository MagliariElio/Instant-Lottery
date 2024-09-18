import { useContext, useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { LoggedUserContext } from "../context/Context";

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { register } = useContext(LoggedUserContext); // context for registration

  // Handle registration
  const handleRegister = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }
    try {
      await register(username, password, firstName, lastName);
    } catch (err) {
      console.log(err);
      setErrorMessage(err);
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #f0f4f8, #d9e2ec)",
      }}
    >
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <div className="p-5 rounded shadow-sm" style={{ backgroundColor: "#ffffff" }}>
            <h2 className="text-center mb-4" style={{ color: "#333" }}>
              Register
            </h2>

            {errorMessage && (
              <Alert variant="danger" className="text-center">
                {errorMessage}
              </Alert>
            )}

            <Form onSubmit={handleRegister}>
              <Form.Group controlId="firstName" className="mb-4">
                <Form.Label className="fw-bold" style={{ color: "#495057" }}>
                  First Name
                </Form.Label>
                <Form.Control
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Enter your first name"
                  className="p-2"
                  style={{ borderColor: "#ced4da" }}
                />
              </Form.Group>

              <Form.Group controlId="lastName" className="mb-4">
                <Form.Label className="fw-bold" style={{ color: "#495057" }}>
                  Last Name
                </Form.Label>
                <Form.Control
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Enter your last name"
                  className="p-2"
                  style={{ borderColor: "#ced4da" }}
                />
              </Form.Group>

              <Form.Group controlId="username" className="mb-4">
                <Form.Label className="fw-bold" style={{ color: "#495057" }}>
                  Username
                </Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                  className="p-2"
                  style={{ borderColor: "#ced4da" }}
                />
              </Form.Group>

              <Form.Group controlId="password" className="mb-4">
                <Form.Label className="fw-bold" style={{ color: "#495057" }}>
                  Password
                </Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Enter your password"
                  className="p-2"
                  style={{ borderColor: "#ced4da" }}
                />
              </Form.Group>

              <Form.Group controlId="confirmPassword" className="mb-4">
                <Form.Label className="fw-bold" style={{ color: "#495057" }}>
                  Confirm Password
                </Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Confirm your password"
                  className="p-2"
                  style={{ borderColor: "#ced4da" }}
                />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100 py-2 mb-3"
                style={{
                  backgroundColor: "#007bff",
                  border: "none",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#007bff")}
                disabled={username.trim() === "" || password.trim() === "" || confirmPassword.trim() === ""}
              >
                Register
              </Button>

              <Link
                className="btn btn-outline-secondary w-100 py-2"
                to="/"
                style={{
                  borderColor: "#6c757d",
                  color: "#6c757d",
                  transition: "background-color 0.3s ease, color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#6c757d";
                  e.target.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#6c757d";
                }}
              >
                Cancel
              </Link>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default RegisterForm;
