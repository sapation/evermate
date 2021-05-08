const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');

const app = express();

const server = require("http").createServer(app);
const io = require('socket.io')(server)
const multer  = require('multer')
const Media = require('./model/Media')

/************************************************
 * creating a mongodb connection to the database
 ***********************************************/
const connect = mongoose
  .connect("mongodb://localhost:27017/media", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoBD connected"))
  .catch((err) => console.log(err));

  
  app.use(express.json())
  app.use(cors())

  /************************************************************
  *  Media Storage method, It also check for valid media files
  *************************************************************/ 
  let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`)
    },
    fileFilter: (req, file, cb)=>{
      const ext = path.extname(file.originalname);
      if(ext !== '.jpg' && ext !=='.png' && ext !== '.mp4' && ext !== '.mp3' && ext !=='.doc' && ext !== '.pdf'){
        return cd(res.status(400).end('Only proper file are accepted like jgp, png mp4, pdf'))
      }
      cb(null, true)
    }
  })
   
  let upload = multer({ storage: storage }).array('file')
  
  
  /*********************************
  *  Uploading  images route
  **********************************/ 
  app.post("/api/media/uploadfiles", (req, res) => {
  
    upload(req, res, err =>{
      console.log(req.files[0].originalname)
      if(err){
        return res.json({success: false, err})
      }
      return res.json({success: true, url: res.req.files[0].path})
    })
  });


   /*********************************
  *  Socket Api route for send and recieving media
  **********************************/ 
io.on("connect", socket =>{
  socket.on("send message", msg=>{

    connect.then(db =>{
      try{
        let media = new Media({ message: msg.chatMessage, sender:msg.userId, type:msg.type})
        
         media.save((err, doc)=>{
           if(err) return res.json({success: false, err})
           
           Media.find({ "_id": doc._id })
           .populate("sender")
           .exec((err, doc)=>{
             return io.emit("receive message", doc)
           })
         })
      }catch(error){
        console.log(error);
      }
    })
  })
})

//   app.get('/', (req, res)=>{
//       res.send('Connected')
//   })


/*********************************
  *  Setting the number and starting the server
  **********************************/ 
const PORT = 3001;

server.listen(PORT,'0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});
