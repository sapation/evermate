const mongoose = require('mongoose')

const MediaSchema = mongoose.Schema({
   message:{
       type:String
   },
   sender:{
       type: mongoose.Schema.Types.ObjectId,
       ref : 'User'
   },
   type: {
       type :String
   }
}, {timestamps : true});

const Media = mongoose.model('Media', MediaSchema );

module.exports = { Media };