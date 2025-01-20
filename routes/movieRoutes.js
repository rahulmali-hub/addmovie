const express = require("express");
const Movie = require("../model/movie");
const { authenticate, authorize } = require("../middlware/auth");
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 's3://mymovieimagebucket11/images/images/'); // 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`); 
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Initialize Multer
const upload = multer({ storage, fileFilter });

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

// Post data //

router.post(
  "/post",
  authenticate,
  authorize("admin"),
  upload.single('image'),
  async (req, res) => {
    try {
      const { movieId, name, rating, releaseDate, duration } = req.body;
      const image = req.file ? req.file.path : null; // Save the file path

      const movie = new Movie({
        _id: movieId,
        movieId,
        name,
        rating,
        releaseDate,
        duration,
        image,
      });

      await movie.save();
      res.status(201).send({ message: "Movie added", movie });
    } catch (error) {
      console.error(error);
      res.status(400).send({ message: "Error adding movie", error });
    }
  }
);


// Edit a movie (Admin only)

router.put(
  "/movies/:movieId",
  authenticate,
  authorize("admin"),
  upload.single('image'), // Assuming you are using multer for handling file uploads
  async (req, res) => {
    try {
      const { movieId } = req.params;
      const updateData = { ...req.body }; // Get the updated data from req.body

      // Check if a new image has been uploaded and update the image field if necessary
      if (req.file) {
        updateData.image = `images/${req.file.filename}`; // Assuming your image path is saved like this
      }

      // Find and update the movie by movieId
      const movie = await Movie.findOneAndUpdate(
        { movieId }, 
        updateData,  
        { new: true } 
      );

      if (!movie) {
        return res.status(404).send({ message: "Movie not found" });
      }

      res.send({ message: "Movie updated", movie });
    } catch (error) {
      console.error(error);
      res.status(400).send({ message: "Error updating movie", error: error.message });
    }
  }
);


// Delete a movie (Admin only)

router.delete(
  "/movies/:movieId",
  authenticate,
  authorize("admin"),
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