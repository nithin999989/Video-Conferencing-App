const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const roomSchema = new mongoose.Schema({
    roomName: { type: String },
    host: { type: String, require: true },
    meetType: { type: String, },
    meetDate: { type: String, },
    meetTime: { type: String, },
    participants: { type: Array },
    currentParticipants: { type: Array }
}, { timestamps: true });


const participantsSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    roomId: { type: String, required:true },
    username: { type: String, required: true },
    meetingType: {type: String, required: true}
})

const messageSchema = new mongoose.Schema({
    senderId: {type: String, required: true},
    content: {type: String, required: true}
})


// Define models using the schemas
const User = mongoose.model('User', userSchema);
const Rooms = mongoose.model('Rooms', roomSchema);
const Participants = mongoose.model('Participants', participantsSchema);
const Message = mongoose.model('Message',messageSchema);

// Export the models
module.exports = {
    User,
    Rooms,
    Participants,
    Message
};
