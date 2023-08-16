import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  // condition when user is connecting to room
  const [isConnected, setIsConnected] = useState(false);
  // condition when stream is sent
  const [isStreamSent, setIsStreamSent] = useState(false);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
    setIsConnected(true);

  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
    setIsStreamSent(true);
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div className="  bg-gray-900 overflow-hidden min-h-screen max-w-screen flex flex-col items-center justify-center">
      <div className="fixed z-1 left-5 top-5 bg-gray-950 p-5 px-10">

        <h1 className="text-2xl font-bold text-white">By: Satyam Singh </h1>
        <a href="https://portfolio.satyamsingh.me" className="text-blue-500 text-xl">click here</a>
        <h1 className="text-sm text-gray-300">to know more about me  </h1>
        {/* <h1 className="text-2xl font-bold text-white">  </h1> */}
      </div>
      <div className=" bg-gray-800  py-5 px-32 mt-5 rounded rounded-2xl flex flex-col items-center justify-around gap-10">

        <h1 className="text-6xl font-bold text-white">Room </h1>
        <h4 className="text-white bg-gray-800 p-5 px-10">
          {!isConnected && !remoteSocketId ? "No incoming call" : (remoteSocketId && !isConnected ? "You have an incoming call" : "")}
        </h4>
        {remoteSocketId && (
          <button
            className="bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded"
            onClick={handleCallUser}
          >
            {isConnected ? "Connected" : "Connect Call"}
          </button>
        )}
      </div>

      <div className="bg-gray-800 mb-10 flex flex-wrap p-10 mt-10 w-[80%] rounded items-center justify-between">

        {myStream && (
          <div className="video-container">
            <h1 className="text-white">My Stream</h1>
            <ReactPlayer
              playing
              muted
              height="300px"
              width="auto"
              url={myStream}
            />
          </div>
        )}
        {myStream && (

          <button
            className="bg-blue-500 text-white py-2 px-4 rounded"
            onClick={sendStreams}
          >
            {isStreamSent ? "You are Live Now" : "Send Your Video"}
          </button>
        )}
        {remoteStream && (
          <div className="video-container">
            <h1 className="text-white">Remote Stream</h1>
            <ReactPlayer
              playing
              muted
              height="300px"
              width="auto"
              url={remoteStream}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPage;
