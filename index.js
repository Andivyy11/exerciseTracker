const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:false}))
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = mongoose.Schema({
  username :{
    type:String,
    require:true
  }
}, {versionKey : false})

const User = mongoose.model("User" , userSchema)

const logSchema = mongoose.Schema({
  userId:{
    type:String,
    require:true
  },
  date:{
    type:Date
  },
  duration:{
    type:Number,
  },
  description:{
    type:String
  }
} , {versionKey: false})

const Log = mongoose.model("Log" , logSchema)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users' ,  async (req, res) => {
  try {
    const u = new User({ username: req.body.username});
    const data = await u.save();
    res.json(data); 
  } 
  catch (err) {
    res.json(err);
  }
})

app.get('/api/users' , async (req,res)=>{
  try{
    const allUser= await User.find({});
    res.json(allUser)
  }
  catch(err){
    res.json(err)
  }
})

app.post('/api/users/:_id/exercises' , async (req,res)=>{
  try{
    const l = new Log({
      userId: req.params._id ,
      description: req.body.description,
      date: req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString(),
      duration: req.body.duration || parseInt('0')
    })

    const u = await User.findOne({_id : req.params._id})

    const savedLog = await l.save()
     res.json({
      username: u.username,
      // ...u,
      description: l.description,
      duration: l.duration,
      date: l.date.toDateString(),
      _id: u._id
    })
  }
  catch(err)
  {
    res.json(err)
  }
})

app.get('/api/users/:_id/logs' , async (req,res)=>{
  try{
    const u = await User.findOne({_id:req.params._id});
    const allLogs = await Log.find({userId : req.params._id})
    const logArray = [] 
    allLogs.map((l)=>{
      logArray.push({
        description: l.description,
        duration: l.duration,
        date: l.date.toDateString(),
      })
    })
    res.json({
      username:u.username,
      count:logArray.length,
      _id:u._id,
      log:logArray
    })
  }
  catch(err)
  {
    res.json(err)
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
