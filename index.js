const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

let people = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-444-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendick",
    number: "39-23-6423122",
  },
];

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

app.get("/api/persons", (request, response) => {
  response.json(people);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = people.find((person) => person.id === id);
  console.log(person);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.get("/info", (request, response) => {
  const date = new Date();
  response.send(
    `<p>Phonebook has info for ${people.length} people</p><p>${date}</p>`
  );
});

app.post("/api/persons/", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response
      .status(400)
      .json({ error: "Please submit both name and number" });
  }

  const found = people.find((person) => person.name === body.name);
  if (found) {
    return response
      .status(400)
      .json({ error: "This person is already in phonebook" });
  }

  const newPerson = {
    id: Math.floor(Math.random() * (10000 - people.length) + people.length),
    name: body.name,
    number: body.number,
  };
  people = people.concat(newPerson);
  response.json(newPerson);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  people = people.filter((person) => person.id !== id);
  response.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("----");
});
