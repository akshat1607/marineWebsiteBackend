const mongoose = require("mongoose");

const imgSchema = new mongoose.Schema({
  model: String,
  name:String,
  description : String,
  length : String,
  width : String,
  height : String,  
  img: {
    data: String,
    contentType: String,
  },
  isSold:Boolean,
  productType:String

});

module.exports = ImageModel = mongoose.model("Image", imgSchema);