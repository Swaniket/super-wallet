import React from "react";
import { Container, Row, Col } from "react-bootstrap";

function Footer() {
  return (
    <footer className="footerStyle">
      <Container>
        <Row>
          <Col className = "text-center py-3">Copyright &copy; SuperWallet</Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
