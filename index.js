require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Note = require("./models/note");
const app = express();

const requestLogger = (request, response, next) => {
	console.log("Method:", request.method);
	console.log("Path:  ", request.path);
	console.log("Body:  ", request.body);
	console.log("---");
	next();
};

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: "unknown endpoint" });
};

// const generateId = () => {
// 	const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
// 	return maxId + 1;
// };

const errorHandler = (error, request, response, next) => {
	console.error(error.message);

	if (error.name === "CastError") {
		return response.status(400).send({ error: "malformatted id" });
	} else if (error.name === "ValidationError") {
		return response.status(400).send({ error: error.message });
	}

	next(error);
};

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));
app.use(requestLogger);

app.get("/", (request, response) => {
	response.send("<h1>Hello World!</h1>");
});

// Get all notes
app.get("/api/notes", (request, response) => {
	Note.find({}).then((notes) => {
		response.json(notes);
	});
});

// Get single note based on id
app.get("/api/notes/:id", (request, response, next) => {
	Note.findById(request.params.id)
		.then((note) => {
			if (note) {
				response.json(note);
			} else {
				response.status(404).end();
			}
		})
		.catch((error) => next(error));
});

// Delete single note based on id
app.delete("/api/notes/:id", (request, response) => {
	Note.findByIdAndRemove(request.params.id)
		.then((result) => {
			response.status(204).end();
		})
		.catch((error) => next(error));
});

// Create new note
app.post("/api/notes", (request, response, next) => {
	const body = request.body;

	const note = new Note({
		content: body.content,
		important: body.important || false,
		date: new Date(),
	});

	note
		.save()
		.then((savedNote) => {
			response.json(savedNote);
		})
		.catch((error) => next(error));
});

// Update note
app.put("/api/notes/:id", (request, response, next) => {
	const body = request.body;

	const note = {
		content: body.content,
		important: body.important,
	};

	Note.findByIdAndUpdate(request.params.id, note, { new: true })
		.then((updatedNote) => {
			response.json(updatedNote);
		})
		.catch((error) => next(error));
});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
