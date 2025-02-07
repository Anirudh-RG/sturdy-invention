import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";
import ChatBox from "./ChatBox";

const URL = "http://localhost:3000";

export const Room = ({
    name,
    localAudioTrack,
    localVideoTrack
}: {
    name: string,
    localAudioTrack: MediaStreamTrack | null,
    localVideoTrack: MediaStreamTrack | null,
}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [lobby, setLobby] = useState(true);
    const [socket, setSocket] = useState<null | Socket>(null);
    const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
    const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(null);
    const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const socket = io(URL);
        socket.on('send-offer', async ({roomId}: {roomId: string}) => {
            console.log("sending offer");
            setLobby(false);
            const pc = new RTCPeerConnection();

            setSendingPc(pc);
            if (localVideoTrack) {
                console.log("added track");
                console.log(localVideoTrack);
                pc.addTrack(localVideoTrack);
            }
            if (localAudioTrack) {
                console.log("added track");
                console.log(localAudioTrack);
                pc.addTrack(localAudioTrack);
            }

            pc.onicecandidate = async (e) => {
                console.log("receiving ice candidate locally");
                if (e.candidate) {
                   socket.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    type: "sender",
                    roomId
                   });
                }
            };

            pc.onnegotiationneeded = async () => {
                console.log("on negotiation needed, sending offer");
                const sdp = await pc.createOffer();
                await pc.setLocalDescription(sdp);
                socket.emit("offer", {
                    sdp,
                    roomId
                });
            };
        });

        socket.on("offer", async ({roomId, sdp: remoteSdp}: {roomId: string, sdp: RTCSessionDescriptionInit}) => {
            console.log("received offer");
            setLobby(false);
            const pc = new RTCPeerConnection();
            await pc.setRemoteDescription(remoteSdp);
            const sdp = await pc.createAnswer();
            await pc.setLocalDescription(sdp);
            const stream = new MediaStream();
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }

            setRemoteMediaStream(stream);
            setReceivingPc(pc);

            pc.ontrack = (e: RTCTrackEvent) => {
                alert("ontrack");
            };

            pc.onicecandidate = async (e) => {
                if (!e.candidate) {
                    return;
                }
                console.log("on ice candidate on receiving side");
                if (e.candidate) {
                   socket.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    type: "receiver",
                    roomId
                   });
                }
            };

            socket.emit("answer", {
                roomId,
                sdp: sdp
            });

            setTimeout(() => {
                const track1 = pc.getTransceivers()[0].receiver.track;
                const track2 = pc.getTransceivers()[1].receiver.track;
                console.log(track1);
                if (track1.kind === "video") {
                    setRemoteAudioTrack(track2);
                    setRemoteVideoTrack(track1);
                } else {
                    setRemoteAudioTrack(track1);
                    setRemoteVideoTrack(track2);
                }
                if (remoteVideoRef.current && remoteVideoRef.current.srcObject instanceof MediaStream) {
                    remoteVideoRef.current.srcObject.addTrack(track1);
                    remoteVideoRef.current.srcObject.addTrack(track2);
                    remoteVideoRef.current.play();
                }
            }, 5000);
        });

        socket.on("answer", ({roomId, sdp: remoteSdp}: {roomId: string, sdp: RTCSessionDescriptionInit}) => {
            setLobby(false);
            setSendingPc((pc: RTCPeerConnection | null) => {
                pc?.setRemoteDescription(remoteSdp);
                return pc;
            });
            console.log("loop closed");
        });

        socket.on("lobby", () => {
            setLobby(true);
        });

        socket.on("add-ice-candidate", ({candidate, type}: {candidate: RTCIceCandidate, type: string}) => {
            console.log("add ice candidate from remote");
            console.log({candidate, type});
            if (type === "sender") {
                setReceivingPc((pc: RTCPeerConnection | null) => {
                    if (!pc) {
                        console.error("receiving pc not found");
                    } else {
                        console.error(pc.ontrack);
                    }
                    pc?.addIceCandidate(candidate);
                    return pc;
                });
            } else {
                setSendingPc((pc: RTCPeerConnection | null) => {
                    if (!pc) {
                        console.error("sending pc not found");
                    }
                    pc?.addIceCandidate(candidate);
                    return pc;
                });
            }
        });

        setSocket(socket);
    }, [name]);

    useEffect(() => {
        if (localVideoRef.current && localVideoTrack) {
            localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
            localVideoRef.current.play();
        }
    }, [localVideoRef, localVideoTrack]);

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-100">
          <div className="flex-1 p-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome, {name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <video autoPlay ref={localVideoRef} className="w-full h-auto rounded-lg shadow-lg" />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">{name}</div>
              </div>
              <div className="relative">
                <video
                  autoPlay
                  ref={remoteVideoRef}
                  className={`w-full h-auto rounded-lg shadow-lg ${lobby ? "opacity-0" : "opacity-100"}`}
                />
                {lobby && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
                    <p className="text-gray-600">Waiting to connect you to someone...</p>
                  </div>
                )}
                <div
                  className={`absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded ${
                    lobby ? "hidden" : "block"
                  }`}
                >
                  ???
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 p-4">
            <ChatBox name={name} />
          </div>
        </div>
      );
      
    
};