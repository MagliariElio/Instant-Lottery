import React, { useContext, useEffect, useState } from "react";
import { Container, Table, Button, Row, Col, Alert } from "react-bootstrap";
import API from "../API";
import { LoggedUserContext } from "../context/Context";

const BetHistory = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { handleErrors } = useContext(LoggedUserContext);

  useEffect(() => {
    const fetchBets = async () => {
      try {
        setLoading(true);
        const result = await API.getBetHistory();
        if (result) {
          setBets(result);
        }
      } catch (err) {
        handleErrors({ message: err, status: "danger" });
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
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
          <h3>Bet History</h3>
          {bets.length === 0 ? (
            <Alert variant="info">No bets available.</Alert>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Draw ID</th>
                  <th>Numbers</th>
                  <th>Bet Time</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet) => (
                  <tr key={bet.id}>
                    <td>{bet.id}</td>
                    <td>{bet.draw_id ? bet.draw_id : "N/A"}</td>
                    <td>{bet.numbers}</td>
                    <td>{new Date(bet.bet_time).toLocaleString()}</td>
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

export default BetHistory;
