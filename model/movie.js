const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  _id: { type: String, required: true },  // Define _id manually as String (you can change it to ObjectId if needed)
  movieId: { type: String, required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  releaseDate: { type: Date, required: true },
  duration: { type: Number, required: true },
}
);

module.exports = mongoose.model('Movie', movieSchema);
