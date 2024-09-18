import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Container, Row, Card, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { LoggedUserContext } from "../context/Context";
import API from "../API";
import { FaCheck } from "react-icons/fa";

const NumberGrid = () => {
  const {
    handleErrors,
    setLoggedUser,
    loggedUser,
    selectedNumbers,
    setSelectedNumbers,
    lastDraw,
    setLastDraw,
    timeLeft,
    lastNumberBet,
    setLastNumberBet,
    updateTimeout,
  } = useContext(LoggedUserContext);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const lastDrawFunctionTimeLeft = async () => {
    try {
      const result = await API.fetchLastDrawTimeLeft();
      const lastDrawResult = { draw: null, drawTime: result.lastDrawTime };
      setLastDraw(lastDrawResult);
    } catch (err) {
      handleErrors({ message: err, status: "danger" });
    }
  };

  const lastDrawFunction = async () => {
    try {
      const result = await API.fetchLastDraw();
      setLastDraw(result);
    } catch (err) {
      lastDrawFunctionTimeLeft();
      handleErrors({ message: err, status: "danger" });
    }
  };

  const lastNumberBetFunction = async () => {
    try {
      const result = await API.fetchLastNumberBet();
      if (result) {
        setLastNumberBet(result);
      } else {
        setLastNumberBet([]);
      }
    } catch (err) {
      lastDrawFunctionTimeLeft();
      handleErrors({ message: err, status: "danger" });
    }
  };

  const getCurrentBet = async () => {
    try {
      setIsConfirmed(false);
      const result = await API.fetchCurrentBet();
      if (result?.numbers) {
        setSelectedNumbers(result?.numbers);
        setIsConfirmed(true);
      }
    } catch (err) {
      setIsConfirmed(false);
      handleErrors({ message: err, status: "danger" });
    }
  };

  const handleAddNumber = (number) => {
    setSelectedNumbers((prevSelected) => {
      if (prevSelected.includes(number)) {
        setIsConfirmed(false);
        return prevSelected.filter((n) => n !== number);
      } else if (prevSelected.length < 3) {
        setIsConfirmed(false);
        return [...prevSelected, number];
      } else {
        handleErrors({ message: "You can choose only 3 numbers!", status: "danger" });
        return prevSelected;
      }
    });
  };

  const handleConfirmBet = () => {
    const confirmBet = async () => {
      try {
        setIsConfirmed(false);
        const result = await API.postBet(selectedNumbers);
        const updatedUser = { ...loggedUser, points: result };
        setLoggedUser(updatedUser);
        setIsConfirmed(true);
        handleErrors({ message: "Bet for the current draw registered successfully", status: "success" });
      } catch (err) {
        setIsConfirmed(false);
        handleErrors({ message: err, status: "danger" });
      }
    };
    confirmBet();
  };

  const handleCancelBet = () => {
    const cancelBet = async () => {
      try {
        const result = await API.cancelLastBet();
        const isObjectEmpty = (obj) => Object.keys(obj).length === 0;

        if (!isObjectEmpty(result)) {
          const updatedUser = { ...loggedUser, points: result.points };
          setLoggedUser(updatedUser);
          setIsConfirmed(false);
        }
        setSelectedNumbers([]);
      } catch (err) {
        setSelectedNumbers([]);
        handleErrors({ message: err, status: "danger" });
      }
    };
    cancelBet();
  };

  useEffect(() => {
    getCurrentBet();
    lastDrawFunction();
    lastNumberBetFunction();
    updateTimeout();
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <Container className="text-center mt-4">
      {lastDraw !== null && (
        <Row>
          <Card className="last-draw-card p-3 shadow-sm">
            <h3 className="text-primary">
              <strong>Last Draw Numbers</strong>
            </h3>
            <Row className="d-flex justify-content-center my-3">
              {!lastDraw?.draw && <p>No draw numbers are available at the moment. Please wait for the countdown to expire.</p>}
              {lastDraw?.draw?.map((element, index) => (
                <p key={index} className={`draw-number mx-2 p-2`}>
                  {element} {lastNumberBet.includes(element) && <FaCheck className="draw-number-success"/>}
                </p>
              ))}
            </Row>
            <div className="text-danger mt-2">{timeLeft > 0 ? <span>Countdown: {formatTime(timeLeft)}</span> : <span>Time's up!</span>}</div>
          </Card>
        </Row>
      )}
      {selectedNumbers.length > 0 && loggedUser.points >= 5 && (
        <Row className="mt-4">
          <Col>
            <Button
              variant="outline-danger"
              className="action-button"
              disabled={selectedNumbers.length === 0}
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Bet
            </Button>
          </Col>
          {!isConfirmed && (
            <Col>
              <Button variant="success" className="action-button" disabled={selectedNumbers.length === 0} onClick={() => setShowConfirmModal(true)}>
                Confirm Bet
              </Button>
            </Col>
          )}
        </Row>
      )}
      <Row className="mt-4">
        <div className="number-grid-container">
          {Array.from({ length: 90 }, (_, i) => i + 1).map((number) => (
            <Button
              key={number}
              onClick={() => handleAddNumber(number)}
              className={`number-button ${selectedNumbers.includes(number) ? "selected" : ""}`}
            >
              {number}
            </Button>
          ))}
        </div>
      </Row>

      {/* Confirm Bet Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Bet</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to confirm your bet?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleConfirmBet();
              setShowConfirmModal(false);
            }}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Cancel Bet Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Bet</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to cancel your bet?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            No
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              handleCancelBet();
              setShowCancelModal(false);
            }}
          >
            Yes, Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default NumberGrid;
