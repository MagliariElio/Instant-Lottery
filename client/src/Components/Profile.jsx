import React, { useContext, useState, useEffect } from "react";
import { Button, Container, Form, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { LoggedUserContext } from "../context/Context";
import API from "../API";

const Profile = () => {
  const { loggedUser, handleErrors, setLoggedUser } = useContext(LoggedUserContext);
  const [name, setName] = useState(loggedUser?.name || "");
  const [surname, setSurname] = useState(loggedUser?.surname || "");

  useEffect(() => {
    if (loggedUser) {
      setName(loggedUser.name);
      setSurname(loggedUser.surname);
    }
  }, [loggedUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await API.updateUserProfile(name, surname);
      setLoggedUser(updatedUser);
      handleErrors({ message: "Profile updated successfully", status: "success" });
    } catch (err) {
      handleErrors({ message: err.message, status: "danger" });
    }
  };

  return (
    <Container className="mt-4">
      <h2>Profile</h2>
      <Form onSubmit={handleSave}>
        <Form.Group controlId="formName" className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
        </Form.Group>

        <Form.Group controlId="formSurname" className="mb-3">
          <Form.Label>Surname</Form.Label>
          <Form.Control type="text" placeholder="Enter your surname" value={surname} onChange={(e) => setSurname(e.target.value)} required />
        </Form.Group>

        <Form.Group controlId="formUsername" className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control type="text" readOnly value={loggedUser?.username || ""} /> 
        </Form.Group>

        <Form.Group controlId="formPoints" className="mb-3">
          <Form.Label>Points</Form.Label>
          <Form.Control type="text" readOnly value={loggedUser?.points || 0} />
        </Form.Group>

        {(loggedUser?.name !== name || loggedUser?.surname !== surname) && (
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        )}
      </Form>
    </Container>
  );
};

export default Profile;
