import { useEffect,useRef,useState } from "react"
import { Room } from "./copyOfRoom";

export const Landing = () =>{
    const [name,setName] = useState("");
    const [joined,setJoined] = useState(false);
    const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [localVideoTrack, setlocalVideoTrack] = useState<MediaStreamTrack | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    
    const getCam =async() =>{
        const stream = await window.navigator.mediaDevices.getUserMedia({
            video:true,
            audio:true
        })
        const audioTrack = stream.getAudioTracks()[0]
        const videoTrack = stream.getVideoTracks()[0]

        setLocalAudioTrack(audioTrack);
        setlocalVideoTrack(videoTrack);
        if(!videoRef.current){
            return;
        }
        videoRef.current.srcObject = new MediaStream([videoTrack])
    }
    useEffect(()=>{
        if(videoRef && videoRef.current){
            getCam();
        }
    },[videoRef]);

    if(!joined){
        return(
            <>
            <div>
                <video 
                    autoPlay
                    ref={videoRef}
                />
                <input className="border-2 bg-slate-400 text-black" type="text" onChange={(e) =>{
                    setName(e.target.value);
                }}>
                </input>
                <button 
                className="m-2 p-2 border-2 border-to-black bg-blue-400 text-white text-xl rounded-2xl
                hover:bg-blue-800 border-slate-800 
                " 
                onClick={()=>{
                    setJoined(true);    
                }}>Join Room</button>
            </div>
            </>
        )
    }
    return(
        <Room 
            name={name} 
            localAudioTrack={localAudioTrack} 
            localVideoTrack={localVideoTrack}

        />
    )

    
}