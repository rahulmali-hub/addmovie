const express = require("express");
const Movie = require("../model/movie");
const { authenticate, authorize } = require("../middlware/auth");
const router = express.Router();

// Get all movies
router.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.send(movies);
  } catch (error) {
    res.status(500).send({ message: "Error fetching movies", error });
  }
});
//Get Movies by name
router.get("/movies/:name", async (req, res) => {
  try {
    const { name } = req.params;

    // Find movies where the name matches the given parameter
    const movies = await Movie.find({ name: name });

    if (movies.length === 0) {
      return res
        .status(404)
        .send({ message: "No movies found with the given name" });
    }

    res.status(200).send(movies);
  } catch (error) {
    res.status(500).send({ message: "Error fetching movies", error });
  }
});

// Add a new movie (Admin only)
router.post("/post", authenticate, authorize("Admin"), async (req, res) => {
  try {
    // console.log(req.body);  // Log the request body
    const movie = new Movie({
      _id: req.body.movieId, // Set _id to movieId manually
      movieId: req.body.movieId, // This can be the same or different
      name: req.body.name,
      rating: req.body.rating,
      releaseDate: req.body.releaseDate,
      duration: req.body.duration,
    });
    await movie.save();
    res.status(201).send({ message: "Movie added", movie });
  } catch (error) {
    console.error(error); // Log the error for better debugging
    res.status(400).send({ message: "Error adding movie", error });
  }
});

// Edit a movie (Admin only)
router.put(
  "/movies/:id",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    try {
      // Use movieId (req.params.id) to find the movie, and update it
      const movie = await Movie.findOneAndUpdate(
        { movieId: req.params.id }, // Find movie using movieId (from URL params)
        req.body, // Data to update
        { new: true } // Return the updated movie
      );

      if (!movie) {
        return res.status(404).send({ message: "Movie not found" });
      }

      res.send({ message: "Movie updated", movie });
    } catch (error) {
      res.status(400).send({ message: "Error updating movie", error });
    }
  }
);

// Delete a movie (Admin only)
router.delete(
  "/movies/:movieId",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    try {
      await Movie.findByIdAndDelete(req.params.movieId);
      res.send({ message: "Movie deleted" });
    } catch (error) {
      res.status(400).send({ message: "Error deleting movie", error });
    }
  }
);

module.exports = router;
