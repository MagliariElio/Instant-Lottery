import React from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";

const RulesPage = () => {
  return (
    <Container fluid className="d-flex flex-column justify-content-center align-items-center">
      <Row className="justify-content-center mb-4">
        <Col md={8}>
          <Card className="text-center p-4">
            <Card.Header>
              <h2>Welcome to Instant Lottery</h2>
            </Card.Header>
            <Card.Body>
              <Card.Title>Game Rules</Card.Title>
              <ul className="list-unstyled">
                <li>
                  <strong>Game Frequency:</strong> Every 2 minutes, a set of 5 unique numbers between 1 and 90 will be drawn.
                </li>
                <li>
                  <strong>Betting:</strong> Players can place a bet on 1, 2, or 3 numbers before the drawing occurs. Each bet costs 5, 10, or 15
                  points respectively.
                </li>
                <li>
                  <strong>Points:</strong> Players start with 100 points. Betting costs and winnings are calculated based on the number of correct
                  guesses.
                </li>
                <li>
                  <strong>Winning Conditions:</strong>
                  <ul>
                    <li>If all numbers in the bet are correct, the player wins twice the points bet.</li>
                    <li>If none of the numbers in the bet are correct, the player wins nothing.</li>
                    <li>If some numbers are correct, the player wins proportional to the number of correct guesses.</li>
                  </ul>
                </li>
                <li>
                  <strong>Player Budget:</strong> Once the budget reaches zero, the player cannot place further bets.
                </li>
              </ul>
              <Card.Footer className="text-muted">To start playing, please log in or register if you don't have an account.</Card.Footer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RulesPage;
