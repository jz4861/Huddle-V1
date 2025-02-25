// import and instantiate express
const express = require("express"); // CommonJS import style!
const cors = require('cors');
const path = require("path");
const axios = require("axios");
const app = express(); // instantiate an Express object
const { v4: uuidv4 } = require('uuid'); 
const mongoose = require("mongoose")
const dotenv = require("dotenv");
const User = require("./models/User");
const Game = require("./models/Game");
const { match } = require("assert");
const Message = require("./models/message");
require('dotenv').config();
const multer  = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images")
  },
  filename: function (req, file, cb) {
    // rename the files to include the current time and date
    cb(null, file.fieldname + "-" + Date.now()+ path.extname(file.originalname));
  },
});
const upload = multer({storage: storage});
const MONGODB_URL = process.env.MONGODB_URL
console.log(MONGODB_URL)
const db = async () => {
  try {
    const con = await mongoose.connect(MONGODB_URL)
    console.log(`MONGODB connected: ${con.connection.host}`)
  } catch (error) {
    console.error (error)
  }
}

// we will put some server logic here later...
// export the express app we created to make it available to other modules


const morgan = require("morgan") // middleware for nice logging of incoming HTTP requests
const cookieParser = require("cookie-parser") // middleware useful for parsing cookies in requests
require("dotenv").config({ silent: true }) // load environmental variables from a hidden file named .env

// the following are used for authentication with JSON Web Tokens
const jwt = require("jsonwebtoken")
const passport = require("passport")

// use this JWT strategy within passport for authentication handling
const jwtStrategy = require("./config/jwt-config.js") // import setup options for using JWT in passport
passport.use(jwtStrategy)

// tell express to use passport middleware
app.use(passport.initialize()) 


app.use(express.static('public'));
// mongoose models for MongoDB data manipulation


const sampleGames = [
    { sportName: 'Basketball', numberOfPeople: 10, tierLevel: 3, locationName: 'Central Gym', time: '2023-11-20T12:00:00Z' },
    { sportName: 'Football', numberOfPeople: 22, tierLevel: 2, locationName: 'Stadium West', time: '2023-11-20T15:00:00Z' },
    { sportName: 'Volleyball', numberOfPeople: 12, tierLevel: 4, locationName: 'North Beach Courts', time: '2023-11-21T10:00:00Z' },
    { sportName: 'Baseball', numberOfPeople: 18, tierLevel: 1, locationName: 'Downtown Field', time: '2023-11-22T16:00:00Z' },
    { sportName: 'Soccer', numberOfPeople: 22, tierLevel: 5, locationName: 'East Park Stadium', time: '2023-11-23T14:00:00Z' },
    { sportName: 'Tennis', numberOfPeople: 2, tierLevel: 3, locationName: 'Riverfront Courts', time: '2023-11-24T09:00:00Z' }
  ];
  
db()  
// app.use(cors());

app.use(express.json()); // decode JSON-formatted incoming POST data
app.use(express.urlencoded({ extended: true })); // decode url-encoded incoming POST data
app.use(morgan("dev", { skip: (req, res) => process.env.NODE_ENV === "test" })) // log all incoming requests, except when in unit test mode.  morgan has a few logging default styles - dev is a nice concise color-coded style

// use express's builtin body-parser middleware to parse any data included in a request

app.use(cookieParser()) // useful middleware for dealing with cookies

// the following cors setup is important when working with cookies on your local machine
app.use(cors({ origin: process.env.FRONT_END_DOMAIN, credentials: true })) // allow incoming requests only from a "trusted" host

// to keep this file neat, we put the logic for the various routes into specialized routing files
const authenticationRoutes = require("./routes/authentication-routes.js")
const cookieRoutes = require("./routes/cookie-routes.js")
const protectedContentRoutes = require("./routes/protected-content-routes.js")

// use the specialized routing files

app.use("/auth", authenticationRoutes()) // all requests for /auth/* will be handled by the authenticationRoutes router
app.use("/cookie", cookieRoutes()) // all requests for /cookie/* will be handled by the cookieRoutes router
app.use("/protected", protectedContentRoutes()) // all requests for /protected/* will be handled by the protectedRoutes router




const getuser = () => {
  // create a new router that we can customize
  const router = express.Router();
  
  router.get('/', async function getuser(req, res, next){
    try {
      
      const oneuser = await User.findOne().exec();
      // check if user was found
      if (!oneuser) {
        console.error(`User not found.`);
        next();
      }
      else{
        console.log(oneuser)
        next();
      }
  }
  catch (err) {
    // check error
    console.error(`Error looking up user: ${err}`);
  
    next();
  }
  }
  ) 
  return router;
}




app.use('/', getuser())

app.get("/", (req, res) => {
    res.send("Hello!");
    
  getuser(req,res);
});
app.post('/editprofile', upload.single('file'), async (req, res) => {
  const username = req.body.username;
  const newBio =req.body.bio;
  const newLocation = req.body.location;
  if(req.file!= undefined){
    const image = "http://localhost:3000/images/"+req.file.filename;
    const user = await User.findOne({username: username});
    user.bio = newBio;
    user.location = newLocation;
    user.profilePicture = image;
    await user.save();
  }
  else{
    const user = await User.findOne({username: username});
    user.bio = newBio;
    user.location = newLocation;
    await user.save();

  }

  res.json({success: true});
});


app.post('/auth/createaccount', async (req, res)=> {
  const {username, pw: password, location} = req.body;

  if (!username || !password || !location) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  //create the new user thats about to register 
  const newUser = new User({username, password, location})

  try {
    await newUser.save();
    res.json({message:"SUCCESS"})
    res.status(200).json({ message: "Account created successfully!" });
  } catch (err) {
    console.error("Error creating account", err);
    return res.status(500).json({ message: "Error creating account" });
  }

  
})


app.get('/profile', async (req, res) => {
  // const theUser = await User.findOne({username: "yhunter"});
  const theUser = await User.findOne({_id: "65653a973fad11a425c9a76f"});

  console.log(theUser);
  res.json({
    img: theUser.profilePicture,
    name: theUser.username,
    location: theUser.location,
    bio: theUser.bio,
    comments: theUser.comments,
    success:true
  });
});

app.get('/viewprofile/:slug', async (req, res) => {
    otherUser = req.params.slug;
    const theUser = await User.findOne({username: otherUser});

    let userMatches= [];
    const matchesIDs = theUser.games;
    if(matchesIDs.length>0){
      for(let i =0; i<matchesIDs.length; i++){
        const singleMatch = await Game.findOne({_id:matchesIDs[i] });
        userMatches.push(singleMatch);
      }
    }

   res.json({
    img: theUser.profilePicture,
    name: theUser.username,
    location: theUser.location,
    bio: theUser.bio,
    comments: theUser.comments,
    games: userMatches,
    success:true
  });
  });


app.post('/comment/:slug', async(req,res)=>{
  
  console.log(req.body);
  console.log(req.params.slug);
  const otherUser = await User.findOne({username: req.params.slug});
  const comment = `@${req.body.main} - ${req.body.comment}`;
  otherUser.comments.push(comment);
  otherUser.save();

  res.json({success:true});



});

app.get("/getGame/:gameid", async (req,res,next)=>{
  gameID = req.params.gameid;
  const thegame = await Game.findOne({_id: gameID});
  const t1 = thegame.team1;
  const t2 = thegame.team2;
  let team1 = [];
  let team2 = []

  for(let i = 0; i<t1.length;i++){
    const player = await User.findOne({username: t1[i]});
    team1.push(player);
  }
  for(let j = 0; j<t1.length;j++){
    const player = await User.findOne({username: t2[j]});
    team2.push(player);
  }


  res.json({
    game: thegame, 
    team1: team1,
    team2: team2
  })

});

app.get('/friends', async (req, res) => {
  const allUsers = await User.find();
  res.json({
    users: allUsers.map(user => ({
      img: user.profilePicture,
      name: user.username,
      location: user.location,
    })),
    success: true
  });
});

app.get('/friends/:userId', async (req, res) => {
  try{
    const {userId} = req.params;
    const user = await User.findById(userId).populate(
      "friends", 
      "name email image"
    )
    
    const friends = user.friends; 
    res.json(friends)
  } catch(error){
    console.log(error);
    res.status(500).json({message:"internal server error "})
  }
  
  // res.json({
  //   users: allUsers.map(user => ({
  //     img: user.profilePicture,
  //     name: user.username,
  //     location: user.location,
  //   })),
  //   success: true
  // });
});
 

app.post('/editmatch/:matchId', async (req, res) => {
  try {
      console.log("we in here");
      console.log(req.body);
      const matchId = req.params.matchId;
      console.log("matchid"+matchId)
      const {location, winner } = req.body;
      const match = await Game.findOne({ _id: matchId });
      console.log(match);

      if (!matchId) {
          return res.status(404).send('Match not found');
      }
      match.location = location;
      match.winner = winner;

      await match.save();
      res.json(match);
  } catch (error) {
      console.error('Error updating match:', error);

      res.status(500).send('Internal Server Error');
  }
});



app.get('/matchHistory', async (req, res) => {
  const allMatches = await Game.find();
  res.json({
    matches: allMatches.map(match => ({
      id: match.id,
      sportName: match.sportName,
      location: match.location,
      inProgress: match.inProgress,
      team1: match.team1,
      team2: match.team2,
      dateAndTime: match.dateAndTime,
      isFull: match.isFull,
      winner: match.winner
    })),
    success: true
  });
});

app.get('/match/:matchId', async (req, res) => {
  try {
      const matchId = req.params.matchId;
      const match = await Game.findOne({ _id: matchId });

      if (!match) {
          return res.status(404).send('Match not found');
      }

      res.json(match);
  } catch (error) {
      console.error('Error fetching match:', error);
      res.status(500).send('Internal Server Error');
  }
});


app.post('/login', (req, res)=> {
    const [email, password] = ['abc','123'];
  console.log(req.body);
  if (email == req.body.email && password == req.body.pw){
    res.json({success:true})
  }
  else{res.json({success:false})}
})
 


 
app.get('/protected/gamesHappeningSoon', async (req, res) => {
    try{let all ={} 
      if (req.body.sportName){
        all=await Game.find({ sportName: req.body.sportName });
      }
      else{
        all= await Game.find();
      }
    // const { sport } = req.params;
    // will later fetch this data from a database
    // const games = gamesData[sport] || [];
    
    // sending the games data back to the client
    res.json(all);}
    catch(err){
      console.log(err)
    }
  });
  
app.get('/games/:sportName', async (req, res) => {
  try {
      const sportName = req.params.sportName;
      // Use a case-insensitive regex search to match the sport name.
      const games = await Game.find({ sportName: new RegExp('^' + sportName + '$', 'i') });
      console.log(games);
      res.json(games);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

app.post('/games/join/:id', async (req, res) => {
  const id = req.params.id;
  const userid = req.body.username;
  console.log("in /games/join/:id");
  console.log(id);
  console.log(userid);
  try {
    const game = await Game.findById(id);
    
    // Check if the game exists and is not already full
    if (!game) {
      return res.status(404).send('Game not found');
    }
    
    if (game.team1.length + game.team2.length >= game.maxPlayers) {
      return res.status(400).send('Game is already full');
    }
    console.log("this the game"+game);
    console.log(game.maxPlayers);
    console.log(game.team1);
    console.log(game.team2);

    // Check if the user exists
    const user = await User.findOne({username:userid});
    if (!user) {
      return res.status(400).send('User not found');
    }
    
    const username = user.username;
    if(game.team1.includes(username) || game.team2.includes(username)){
      console.log("in already");
      return res.status(400).send('User already in game');
    }
    
    // Add the user to the team
    if(game.team1.length < game.maxPlayers/2){
      console.log("choice one: game.team1.length <= game.maxPlayers/2")
      game.team1.push(username);
      user.games.push(game._id);
    }
    else if(game.team2.length < game.maxPlayers/2)
    {
      console.log("choice two: game.team1.length <= game.maxPlayers/2")
      game.team2.push(username);
      user.games.push(game._id);
    }
    else{
      return res.status(400).send('Game is already full');
    }
     
    await game.save();
    await user.save();
    
    res.status(200).json(game);
  } catch (error) {
    res.status(500).send('Server error');
  }
});



app.get('/search', async (req, res) => {
    try {
        const username = req.query.username;
        const users = await User.find({ username: new RegExp(username, 'i') });
        res.json(users);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/createGame', (req, res) => {
  const newGame = new Game({
      ...req.body,
      id: uuidv4(), // Generate a unique ID for the game
      // Default values for other fields are set by the schema
  });

  newGame.save()
      .then(game => res.json(game))
      .catch(err => res.status(400).json('Error: ' + err));
});


app.get("/messages", async (req, res) => {

  // const singlemessage = await Message.findOne({_id : "6566008dcbd6e0752876b6ab"})
  // console.log(singlemessage.body); 
  // console.log(singlemessage);
    res.json({
        from: "person A",
        text: "hey! hows..."
 
    });
});

// app.get('/viewprofile', async (req, res) => {
    
//   const theUser = await User.findOne({username: "ihunt"});
//  console.log(theUser);
//  res.json({
//   img: theUser.profilePicture,
//   name: theUser.username,
//   location: theUser.location,
//   bio: theUser.bio,
//   comments: theUser.comments,
//   success:true
// });
// });


app.get("/chat", async (req, res) => {
  //  const singlemessage = await Message.findOne({_id : "6566008dcbd6e0752876b6ab"})
  //  console.log(singlemessage.body); 
  //  console.log(singlemessage);

  //  res.json({
  //       _id: "6566008dcbd6e0752876b6ab", 
  //       time: Timestamp({ t: 0, i: 0 }),
  //       body: " this is a test chat message"
  //     });
  
  // res.send("messages!");

    res.json({
        person: "person A",
        sentmsg: ["Hey",
        "sure what time works?", 
        "my friend wants to join... can you find another player for a 2 on 2?"], 
        rcvdmsg: ["want to play bball?", 
        "I get off work at 5"]
        
        
    });
});

//gettting all the users but excluding current logged in
app.get("/users/:userId", (req, res) => {
  const loggedInUserId = req.params.userId;

  User.find({ _id: { $ne: loggedInUserId } })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.log("Error retrieving users", err);
      res.status(500).json({ message: "Error retrieving users" });
    });
});

app.post('/sendFriendRequest', async (req, res) => {
  console.log("in sendfriend request");
  console.log(req.body);
  const senderUsername = req.body.senderId;
  const receiverUsername = req.body.receiverId;
  console.log(senderUsername);
  console.log(receiverUsername);


  try {
    //find the user adding a friend
    let friends = []
    const mainUser = await User.findOne({username: senderUsername});
    friends = mainUser.friends;
    if(friends.includes(receiverUsername)){
      res.status(400).send("Already friends.");
    }else{
      friends.push(receiverUsername);
      mainUser.friends = friends;
      await mainUser.save(); 
      res.status(200).send('Friend request sent.');

    }
  } catch (error) {
    res.status(500).send('Error sending friend request: ' + error);
  }
});


app.post('/acceptFriendRequest', async (req, res) => {
  const { userId, requestId } = req.body;

  try {
    // Move requestId from userId's friendrequests to friends
    await User.updateOne({ username: userId }, { 
      $pull: { friendrequests: requestId },
      $addToSet: { friends: requestId }
    });

    // Move userId from requestId's sentFriendRequests to friends
    await User.updateOne({ username: requestId }, { 
      $pull: { sentFriendRequests: userId },
      $addToSet: { friends: userId }
    });

    res.status(200).send('Friend request accepted.');
  } catch (error) {
    res.status(500).send('Error accepting friend request: ' + error);
  }
});

app.post('/declineFriendRequest', async (req, res) => {
  const { userId, requestId } = req.body;

  try {
    // Remove requestId from userId's friendrequests
    await User.updateOne({ username: userId }, { $pull: { friendrequests: requestId } });

    // Remove userId from requestId's sentFriendRequests
    await User.updateOne({ username: requestId }, { $pull: { sentFriendRequests: userId } });

    res.status(200).send('Friend request declined.');
  } catch (error) {
    res.status(500).send('Error declining friend request: ' + error);
  }
});


// export the express app we created to make it available to other modules
module.exports = app
