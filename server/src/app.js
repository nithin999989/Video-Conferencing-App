const http = require('http');
const socketIO = require('socket.io');
const express = require("express");
const bcrypt = require('bcrypt')
const app = express();
const cors = require('cors')
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MONGO_URI } = require('./db/connect');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const models = require("./models/schema");

app.use(cors());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
  },
});


const users = {};

// const rooms = {};

// io.on('connection', (socket) => {
//   socket.on('login', (userId, username) => {
//     // Store the user's information
//     users[socket.id] = {
//       id: userId,
//       name: username,
//     };

//     // Notify the user about successful login
//     socket.emit('login-success');

//     // Handle disconnection
//     socket.on('disconnect', () => {
//       delete users[socket.id];
//     });
//   });

//   socket.on('join-room', (roomId, meetingType) => {
//     socket.join(roomId);

//     if (!rooms[roomId]) {
//       rooms[roomId] = {
//         participants: [],
//         meetingType: meetingType,
//       };
//     }

//     const participant = {
//       id: users[socket.id].id,
//       name: users[socket.id].name,
//       socketId: socket.id,
//     };

//     rooms[roomId].participants.push(participant);

//     // Notify other participants about the new user
//     socket.broadcast.to(roomId).emit('user-connected', participant);

//     // Send list of participants to the new user
//     const participants = rooms[roomId].participants.filter((p) => p.id !== participant.id);
//     socket.emit('participants', participants);

//     socket.on('message', (message) => {
//       io.to(roomId).emit('createMessage', message, users[socket.id].name);
//     });

//     // Get participants based on room ID
//     socket.on('get-participants', (roomId) => {
//       const participants = rooms[roomId].participants;
//       socket.emit('participants', participants);
//     });

//     socket.on('disconnect', () => {
//       // Remove the user from the room's participant list
//       const index = rooms[roomId].participants.findIndex((p) => p.socketId === socket.id);
//       if (index !== -1) {
//         rooms[roomId].participants.splice(index, 1);
//       }

//       // Notify other participants about the user's disconnection
//       socket.broadcast.to(roomId).emit('user-disconnected', participant.id);

//       // If there are no participants left, remove the room from the rooms object
//       if (rooms[roomId].participants.length === 0) {
//         delete rooms[roomId];
//       }
//     });
//   });
// });



const rooms = {};

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId, username, meetingType) => {
    socket.join(roomId);
    console.log(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        participants: [],
        meetingType: meetingType,
      };
    }

    const participant = {
      id: userId,
      name: username,
      socketId: socket.id,
    };

    rooms[roomId].participants.push(participant);

    // Notify other participants about the new user
    socket.broadcast.to(roomId).emit('user-connected', participant);

    // Send list of participants to the new user
    const participants = rooms[roomId].participants.filter((p) => p.id !== userId);
    socket.emit('participants', participants);

    socket.on('message', (message) => {
      io.to(roomId).emit('createMessage', message, username);
    });

    console.log(rooms[roomId]);

    // Get participants based on room ID
    socket.on('get-participants', (roomId) => {
      const participants = rooms[roomId].participants;
      socket.emit('participants', participants);
      console.log(participants)
    });

    socket.on('disconnect', () => {
      // Remove the user from the room's participant list
      const index = rooms[roomId].participants.findIndex((p) => p.id === userId);
      if (index !== -1) {
        rooms[roomId].participants.splice(index, 1);
      }

      // Notify other participants about the user's disconnection
      socket.broadcast.to(roomId).emit('user-disconnected', userId);

      // If there are no participants left, remove the room from the rooms object
      if (rooms[roomId].participants.length === 0) {
        delete rooms[roomId];
      }
    });
  });
});




// user schema
app.post('/register', async (req, res) => {
  console.log(req.body)
  try {
    const { firstname, lastname, username, email, password } = req.body;
    const user = await models.User.findOne({ email });
    if (user) {
      return res.status(400).send('User already exists');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new models.User({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword
    });
    const userCreated = await newUser.save();
    console.log(userCreated, 'user created');
    return res.status(201).send('Successfully Registered');
  } catch (error) {
    console.log(error);
    return res.status(500).send('Server Error');
  }
});

//Login 
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await models.User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user._id }, 'mysecretkey1');
  res.json({ user, token });
});



// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
