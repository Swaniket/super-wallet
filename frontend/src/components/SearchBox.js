import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, Form } from "react-bootstrap";

function SearchBox() {
  const [keyword, setKeyword] = useState("");

  let history = useHistory()

  const submitHandler = (e) => {
    e.preventDefault();
    if(keyword) {
        history.push(`/?keyword=${keyword}&page=1`)
    } else {
        history.push(history.push(history.location.pathname))
    }
  };

  return (
    <Form onSubmit={submitHandler} inline>
      <Form.Control
        type="text"
        name="q"
        onChange={(e) => setKeyword(e.target.value)}
        className="mr-sm-2 ml-sm-5 search-styles"
      ></Form.Control>

      <Button type="submit" className="p-2 btn-light btn-outline-dark">
        Submit
      </Button>
    </Form>
  );
}

export default SearchBox;
