import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Image,
  ListGroup,
  Button,
  Form,
  Card,
  Jumbotron,
} from "react-bootstrap";

import {
  listProductDetails,
  createProductReview,
} from "../actions/productActions";
import { PRODUCT_CREATE_REVIEW_RESET } from "../constants/productConstants";
import Rating from "../components/Rating";
import Loader from "../components/Loader";
import Message from "../components/Message";

function ProductScreen({ match, history }) {
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const dispatch = useDispatch();

  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const productReviewCreate = useSelector((state) => state.productReviewCreate);
  const {
    loading: loadingProductReview,
    error: errorProductReview,
    success: successProductReview,
  } = productReviewCreate;

  // Responsible for fetching the products from redux
  useEffect(() => {
    if (successProductReview) {
      setRating(0);
      setComment("");
      dispatch({ type: PRODUCT_CREATE_REVIEW_RESET });
    }
    dispatch(listProductDetails(match.params.id));
  }, [dispatch, match, successProductReview]);

  const addToCartHandler = () => {
    history.push(`/cart/${match.params.id}?qty=${qty}`);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(
      createProductReview(match.params.id, {
        rating,
        comment,
      })
    );
  };

  return (
    <div>
      <Link to="/" className="btn btn-light btn-outline-dark my-4">
        Go Back
      </Link>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <div>
          <Row>
            <Col md={6}>
              <Image src={product.image} alt={product.name} fluid />
            </Col>

            <Col md={6}>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h3>
                    <b>{product.name}</b>
                  </h3>
                  <Rating
                    value={product.rating}
                    text={`${product.numReviews} reviews`}
                    color={"#f8e825"}
                  />
                  <h4>Rs.{product.price}</h4>
                </ListGroup.Item>

                <ListGroup.Item>
                  <ListGroup.Item style={{ border: "none" }}>
                    Status:{" "}
                    {product.countInStock > 0 ? (
                      <span style={{ color: "Green" }}>
                        Hurry! only {product.countInStock} left
                      </span>
                    ) : (
                      <span style={{ color: "red" }}>Out of Stock</span>
                    )}
                  </ListGroup.Item>

                  <p></p>

                  <Button
                    className="btn-block"
                    type="button"
                    disabled={product.countInStock === 0}
                    onClick={addToCartHandler}
                  >
                    Add to cart
                  </Button>

                  <p></p>

                  {product.countInStock > 0 && (
                    <ListGroup.Item>
                      <Row>
                        <Col>Qty</Col>
                        <Col xs="auto" className="my-1">
                          <Form.Control
                            as="select"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                          >
                            {[...Array(product.countInStock).keys()].map(
                              (x) => (
                                <option key={x + 1} value={x + 1}>
                                  {x + 1}
                                </option>
                              )
                            )}
                          </Form.Control>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  )}
                </ListGroup.Item>

                <ListGroup.Item>{product.description}</ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
          <p></p>
          <Row>
            <Col md={6} className="my-4">
              <h4>Reviews</h4>
              {product.reviews.length === 0 && (
                <Message variant="info">No Reviews</Message>
              )}

              <ListGroup variant="flush">
                {product.reviews.map((review) => {
                  return (
                    <ListGroup.Item key={review._id}>
                      <strong className="review-name">
                        <b>{review.name}</b>{" "}
                        <span
                          className="mb-2 text-muted"
                          style={{ fontSize: "12px" }}
                        >
                          {review.createdAt.substring(0, 10)}
                        </span>
                      </strong>
                      <Rating value={review.rating} color="#f8e825" />
                      <p style={{ fontSize: "15px" }}>{review.comment}</p>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </Col>

            <Col md={6} className="my-4">
              <ListGroup>
                <h4>Write a Review</h4>
                {loadingProductReview && <Loader />}
                {successProductReview && (
                  <Message variant="success">Review Submitted</Message>
                )}
                {errorProductReview && (
                  <Message variant="danger">{errorProductReview}</Message>
                )}
                {userInfo ? (
                  <Form onSubmit={submitHandler}>
                    <Form.Group controlId="rating">
                      <Form.Label>Rating</Form.Label>
                      <Form.Control
                        as="select"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                      >
                        <option value="">Select...</option>
                        <option value="1">1- Poor</option>
                        <option value="2">2- Fair</option>
                        <option value="3">3- Good</option>
                        <option value="4">4- Very Good</option>
                        <option value="5">5- Excellent</option>
                      </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="comment">
                      <Form.Label>Write a Review</Form.Label>
                      <Form.Control
                        as="textarea"
                        row="10"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      ></Form.Control>
                    </Form.Group>

                    <Button
                      disabled={loadingProductReview}
                      type="submit"
                      className="btn-light btn-outline-dark"
                    >
                      Submit
                    </Button>
                  </Form>
                ) : (
                  <Message variant="info">
                    Please <Link to="/login">login</Link> to write a review
                  </Message>
                )}
              </ListGroup>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}

export default ProductScreen;
