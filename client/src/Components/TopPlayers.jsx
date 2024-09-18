import React, { useContext, useEffect, useState } from "react";
import { Container, Table, Row, Col, Alert } from "react-bootstrap";
import API from "../API";
import { LoggedUserContext } from "../context/Context";

const TopPlayers = () => {
  const [players, setPlayers] = useState([]);
  const { handleErrors } = useContext(LoggedUserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        setLoading(true);
        const result = await API.getTopPlayers();
        setPlayers(result);
      } catch (error) {
        handleErrors({ message: error, status: "danger" });
      } finally {
        setLoading(false);
      }
    };

    fetchTopPlayers();
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
          <h3>Top Players</h3>
          {players.length === 0 ? (
            <Alert variant="info">No top players available.</Alert>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Username</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{player.username}</td>
                    <td>{player.points}</td>
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

export default TopPlayers;
