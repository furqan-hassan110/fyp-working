import React, { useEffect, useState, useRef } from "react";
import { FaList } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { MdGridView } from "react-icons/md";
import { useParams, useSearchParams } from "react-router-dom";
import { Button, Loading, Table, Tabs, Title } from "../components";
import { AddTask, BoardView, TaskTitle } from "../components/tasks";
import { useChangeTaskStageMutation, useGetAllTaskQuery } from "../redux/slices/api/taskApiSlice";
import { useUploadImageMutation } from '../redux/slices/api/taskApiSlice';
import { TASK_TYPE } from "../utils";
import { useSelector } from "react-redux";
import TaskDialog from "../components/tasks/TaskDialog";
import { useTaskContext } from '../components/contextapi/TaskContext';
import { useScreenRecording } from '../components/contextapi/RecordingContext'

const TABS = [
  { title: "Board View", icon: <MdGridView /> },
  { title: "List View", icon: <FaList /> },
];

const Tasks = ({onScreenShareStart}) => {
  const { taskId } = useTaskContext();
  const params = useParams();
  const { user } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const [searchTerm] = useState(searchParams.get("search") || "");
  const { taskStatus } = useTaskContext();
  const { stream, startRecording, stopRecording } = useScreenRecording();
  
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const videoRef = useRef(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // For TaskDialog

  const status = params?.status || "";

  // const { taskId } = useTaskContext();
  // useEffect(() => {
  //   // console.log("Updated taskId:", taskId);
  // }, [taskId]); // Logs whenever taskId changes

  const { data, isLoading, refetch } = useGetAllTaskQuery({
    strQuery: status,
    isTrashed: "",
    search: searchTerm,
  });
  console.log(data?.tasks)
  const [uploadImage] = useUploadImageMutation();

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
      };
    }
  }, [stream]);

  useEffect(() => {
    if (taskStatus) {
      handleScreenShareStart();
    }
  }, [taskStatus]);
  

  const startTakingScreenshots = (stream, taskId) => {
    console.log("Task ID:", taskId);
  
    if (!videoRef.current) {
      console.log("Video reference not available.");
      return;
    }
  
    const interval = setInterval(async () => {
      const video = videoRef.current;
  
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
  
        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              // Convert blob to ArrayBuffer
              const arrayBuffer = await blob.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
  
              console.log("Uploading raw screenshot data:", uint8Array);
              const response= "image uploaded"
              // Call the RTK mutation with the raw data
              // const response = await uploadImage({
              //   taskId,
              //   uint8Array, // Pass raw binary data
              // }).unwrap();
  
              console.log("Image uploaded successfully:", response);
            } catch (error) {
              console.error("Error uploading screenshot:", error);
            }
          }
        }, "image/png");
      } else {
        console.log("Video is not ready or has no data to capture.");
      }
    }, 5000);
  
    // Stop interval when the screen sharing ends
    stream.getVideoTracks()[0].onended = () => {
      clearInterval(interval);
      console.log("Screen sharing stopped, clearing screenshot interval.");
    };
  };
  
  
  
  

  const handleScreenShareStart = async () => {
    try {      
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      console.log("Stream received in TaskDialog:", stream);
  
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
      startRecording();
      startTakingScreenshots(stream, taskId);
    } catch (err) {
      console.error("Error starting screen share:", err);
    }
  };
  
//   const startTakingScreenshots = (stream) => {
//   if (!videoRef.current) {
//     console.log("Video reference not available.");
//     return;
//   }

//   const interval = setInterval(() => {
//     const video = videoRef.current;

//     // Check if video is ready to capture data
//     if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
//       const canvas = document.createElement('canvas');
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;

//       const context = canvas.getContext('2d');
//       context.drawImage(video, 0, 0, canvas.width, canvas.height);

//       // Convert the canvas image to a Base64 URL
//       const screenshot = canvas.toDataURL('image/png');

//       // Automatically trigger download
//       const link = document.createElement('a');
//       link.href = screenshot;
//       link.download = `screenshot-${Date.now()}.png`; // Unique filename
//       document.body.appendChild(link); // Append to the DOM to make it functional
//       link.click(); // Trigger download
//       document.body.removeChild(link); // Remove the link element after download
//     } else {
//       console.log("Video is not ready or has no data to capture.");
//     }
//   }, 5000); // Capture and download every 5 seconds

//   // Stop taking screenshots when screen-sharing ends
//   stream.getVideoTracks()[0].onended = () => {
//     clearInterval(interval);
//     console.log('Screen sharing stopped, clearing screenshot interval.');
//   };
// };

  
  

  useEffect(() => {
    refetch();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [open]);

  return isLoading ? (
    <div className="py-10">
      <Loading />
    </div>
  ) : (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Title title={status ? `${status} Tasks` : "Tasks"} />
        {!status && user?.isAdmin && (
          <Button
            label="Create Task"
            icon={<IoMdAdd className="text-lg" />}
            className="flex flex-row-reverse gap-1 items-center bg-purple-600 text-white rounded-md py-2 2xl:py-2.5"
            onClick={() => setOpen(true)}
          />
        )}
      </div>

      <div>
        <Tabs tabs={TABS} setSelected={setSelected}>
          {!status && (
            <div className="w-full flex justify-between gap-4 md:gap-x-12 py-4">
              <TaskTitle label="To Do" className={TASK_TYPE.todo} />
              <TaskTitle label="In Progress" className={TASK_TYPE["in progress"]} />
              <TaskTitle label="Completed" className={TASK_TYPE.completed} />
            </div>
          )}

          {selected === 0 ? (
            <BoardView tasks={data?.tasks} />
          ) : (
            <Table tasks={data?.tasks} />
          )}
        </Tabs>
      </div>

      <video ref={videoRef} autoPlay style={{display:'none'}} />

      
      {isDialogOpen && (
        <TaskDialog
          onScreenShareStart={handleScreenShareStart}
          onClose={() => setIsDialogOpen(true)}
        />
      )}
      <AddTask open={open} setOpen={setOpen} />
    </div>
  );
};

export default Tasks;
