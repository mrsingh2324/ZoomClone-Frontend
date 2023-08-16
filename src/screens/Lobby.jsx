import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className=" min-h-screen flex flex-col justify-between w-screen ">
      {/* //header code  */}
      <div className="flex justify-between border bg-gray-900 p-5 px-10 items-center w-full">

        <div className="flex items-center space-x-4">
          <img
            src="https://cdn-icons-png.flaticon.com/512/174/174857.png"
            alt="logo"
            className="w-10"
          />
          <h1 className="text-3xl text-white">Video Chat</h1>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://portfolio.satyamsingh.me/about"
            className="text-white text-xl hover:text-gray-200 transition duration-300"
          >
            About Me
          </a>
          <a
            href="https://portfolio.satyamsingh.me/contact"
            className="text-white text-xl hover:text-gray-200 transition duration-300"
          >
            Contact Me
          </a>
        </div>
      </div>



      <form onSubmit={handleSubmitForm} className=" gap-5 flex bg-gray-600 self-center mx-auto w-[50%] flex-col border p-10 items-center justify-center ">
        <h1 className="text-4xl font-bold text-black mb-4">Lobby</h1>
        <label htmlFor="email" className="text-white">
          Name
        </label>
        <input
          type="name"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your name"
          className="bg-gray-800 text-white p-2 rounded"
        />
        <label htmlFor="room" className="text-white">
          Room Number
        </label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Enter the room number"
          className="bg-gray-800 text-white p-2 rounded"
        />
        <button className="bg-blue-500 mt-10 text-white py-2 px-4 rounded">
          Join
        </button>
      </form>
      <div className="flex justify-center items-center bg-gray-900 p-5">
        <p className="text-white">Made with ❤️ websocket ❤️ by <a href="#" className="text-blue-500 hover:text-blue-600 transition duration-300">Satyam</a></p>
      </div>


    </div>
  );
};

export default LobbyScreen;
