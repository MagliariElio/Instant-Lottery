import React, { useContext, useEffect, useState } from "react";
import { Container, Table, Row, Col, Alert } from "react-bootstrap";
import API from "../API";
import { LoggedUserContext } from "../context/Context";

const PastDraws = () => {
  const [draws, setDraws] = useState([]);
  const { handleErrors } = useContext(LoggedUserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDraws = async () => {
      try {
        setLoading(true);
        const result = await API.getPastDraws();
        if (result) {
          setDraws(result);
        }
      } catch (error) {
        handleErrors({ message: error, status: "danger" });
      } finally {
        setLoading(false);
      }
    };

    fetchDraws();
  }, []);

  if (loading) {
    return (
      <Container className="mt-4">
        <p>Loading...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h3>Past Draws</h3>
          {draws.length === 0 ? (
            <Alert variant="info">No past draws available.</Alert>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Numbers</th>
                  <th>Draw Time</th>
                </tr>
              </thead>
              <tbody>
                {draws.map((draw) => (
                  <tr key={draw.id}>
                    <td>{draw.id}</td>
                    <td>{draw.numbers.join(", ")}</td>
                    <td>{new Date(draw.drawTime).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default PastDraws;
