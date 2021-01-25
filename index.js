require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(express.static("build"));
app.use(cors());
const Person = require("./models/person");

morgan.token("content", function (req, res) {
  const body = JSON.stringify(req.body);
  if (body.length > 2) {
    return body;
  }
});

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :content"
  )
);

//OK
app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
});

//OK
app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
});

//OK
app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  const person = {
    name: body.name,
    number: body.number,
  };
  // Person.findByIdAndUpdate(request.params.id, person, { new: true })
  Person.findOneAndUpdate(
    { _id: `${request.params.id}` },
    person,
    { runValidators: true, context: "query" },
    function (err) {
      // No idea what goes in here
    }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.get("/info", (request, response, next) => {
  const date = new Date();
  Person.find({})
    .then((result) => {
      let phonebook = result;
      console.log(phonebook.length);
      response.send(
        `<p>Phonebook has info for ${phonebook.length} people</p><p>${date}</p>`
      );
    })
    .catch((error) => next(error));
});

//OK
app.post("/api/persons/", (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response
      .status(400)
      .json({ error: "Please submit both name and number" });
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  });

  newPerson
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

//OK!
app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => response.status(204).end())
    .catch((error) => next(error));
});

//unknown endpoint is second to last
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

//error handler is last
const errorHandler = (error, request, response, next) => {
  console.error(error);
  console.error(error.name);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  }
};

app.use(errorHandler);

//finally, port is hanging out at last-last
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Hey this is index.js and I am up and at them");
});
