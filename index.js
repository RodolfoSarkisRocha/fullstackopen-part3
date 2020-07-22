const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require('cors')
const { token } = require("morgan");

app.use(express.json());
app.use(cors());
app.use(express.static('build'));

token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"));

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];

const generateId = () => {
  const randomId = Math.floor(Math.random() * Math.floor(999999999));
  const idExists = persons.some((person) => person.id === randomId);
  if (idExists) return generateId();
  return randomId;
};

const validateBody = (body, checkValues) => {
  if (!body) return false;
  const values = checkValues.map((key) => body[key]);
  const invalidValues = values.some(
    (value) => value === null || value === undefined || value === ""
  );
  return invalidValues;
};

const validateName = (name) => persons.some((person) => person.name === name);

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) response.json(person);
  else
    response.status(404).json({
      error: "person is deleted",
    });
});

app.get("/info", (request, response) => {
  const totalPersons = `Phonebook has info for ${persons.length} people`;
  const date = new Date();
  response.send(`<div>${totalPersons}</div><br><div>${date}</div>`);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const { body } = request;

  const checkValues = ["name", "number"];
  if (validateBody(body, checkValues)) {
    return response.status(400).json({
      error: "number or name is missing",
    });
  }

  const { name, number } = body;
  if (validateName(name)) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const id = generateId();
  const person = {
    name,
    number,
    id,
  };
  persons = persons.concat(person);
  response.json(person);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
