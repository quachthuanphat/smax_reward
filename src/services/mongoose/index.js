import Promise from 'bluebird'
import mongoose from 'mongoose'
import { mongo } from '../../config'

Object.keys(mongo.options || { }).forEach((key) => {
  mongoose.set(key, mongo.options[key])
})

mongoose.Promise = Promise
/* istanbul ignore next */
mongoose.Types.ObjectId.prototype.view = function () {
  return { id: this.toString() }
}

/* istanbul ignore next */
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error: ' + err)
  process.exit(-1)
})
mongoose.connection.once("open", (err) => {
  console.log("MongoDB connected successfully");
})

export default mongoose
