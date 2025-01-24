import clsx from "clsx";
import moment from "moment";
import React, { useState,useEffect } from "react";
import { FaBug, FaSpinner, FaTasks, FaThumbsUp, FaUser } from "react-icons/fa";
import { GrInProgress } from "react-icons/gr";
import ImagesModal from '../components/ImagesModal'
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineDoneAll,
  MdOutlineMessage,
  MdTaskAlt,
} from "react-icons/md";
import { RxActivityLog } from "react-icons/rx";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button, Loading, Tabs } from "../components";
import { TaskColor } from "../components/tasks";
import {
  useChangeSubTaskStatusMutation,
  useGetSingleTaskQuery,
  usePostTaskActivityMutation,
  useGetTaskScreenshotsQuery 
} from "../redux/slices/api/taskApiSlice";
import {
  PRIOTITYSTYELS,
  TASK_TYPE,
  getCompletedSubTasks,
  getInitials,
} from "../utils";
import { useSelector } from "react-redux";

const assets = [
  "https://images.pexels.com/photos/2418664/pexels-photo-2418664.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/8797307/pexels-photo-8797307.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/2534523/pexels-photo-2534523.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/804049/pexels-photo-804049.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
];

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const bgColor = {
  high: "bg-red-200",
  medium: "bg-yellow-200",
  low: "bg-blue-200",
};

const TABS = [
  { title: "Task Detail", icon: <FaTasks /> },
  { title: "Activities/Timeline", icon: <RxActivityLog /> },
];

const TASKTYPEICON = {
  commented: (
    <div className='w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white'>
      <MdOutlineMessage />,
    </div>
  ),
  started: (
    <div className='w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white'>
      <FaThumbsUp size={20} />
    </div>
  ),
  assigned: (
    <div className='w-6 h-6 flex items-center justify-center rounded-full bg-gray-500 text-white'>
      <FaUser size={14} />
    </div>
  ),
  bug: (
    <div className='text-red-600'>
      <FaBug size={24} />
    </div>
  ),
  completed: (
    <div className='w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white'>
      <MdOutlineDoneAll size={24} />
    </div>
  ),
  "in progress": (
    <div className='w-8 h-8 flex items-center justify-center rounded-full bg-violet-600 text-white'>
      <GrInProgress size={16} />
    </div>
  ),
};

const act_types = [
  "Started",
  "Completed",
  "In Progress",
  "Commented",
  "Bug",
  "Assigned",
];

const Activities = ({ activity, id, refetch }) => {
  const [selected, setSelected] = useState("Started");
  const [text, setText] = useState("");

  const [postActivity, { isLoading }] = usePostTaskActivityMutation();

  const handleSubmit = async () => {
    try {
      const data = {
        type: selected?.toLowerCase(),
        activity: text,
      };
      const res = await postActivity({
        data,
        id,
      }).unwrap();
      setText("");
      toast.success(res?.message);
      refetch();
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const Card = ({ item }) => {
    return (
      <div className={`flex space-x-4`}>
        <div className='flex flex-col items-center flex-shrink-0'>
          <div className='w-10 h-10 flex items-center justify-center'>
            {TASKTYPEICON[item?.type]}
          </div>
          <div className='h-full flex items-center'>
            <div className='w-0.5 bg-gray-300 h-full'></div>
          </div>
        </div>

        <div className='flex flex-col gap-y-1 mb-8'>
          <p className='font-semibold'>{item?.by?.name}</p>
          <div className='text-gray-500 space-x-2'>
            <span className='capitalize'>{item?.type}</span>
            <span className='text-sm'>{moment(item?.date).fromNow()}</span>
          </div>
          <div className='text-gray-700'>{item?.activity}</div>
        </div>
      </div>
    );
  };

  return (
    <div className='w-full flex gap-10 2xl:gap-20 min-h-screen px-10 py-8 bg-white shadow rounded-md justify-between overflow-y-auto'>
      <div className='w-full md:w-1/2'>
        <h4 className='text-gray-600 font-semibold text-lg mb-5'>Activities</h4>
        <div className='w-full space-y-0'>
            {activity?.map((item, index) => (
              <Card
                key={item.id}
                item={item}
                isConnected={index < activity?.length - 1}
              />
            ))}
        </div>
      </div>

      <div className='w-full md:w-1/3'>
        <h4 className='text-gray-600 font-semibold text-lg mb-5'>
          Add Activity
        </h4>
        <div className='w-full flex flex-wrap gap-5'>
          {act_types.map((item, index) => (
            <div key={item} className='flex gap-2 items-center'>
              <input
                type='checkbox'
                className='w-4 h-4'
                checked={selected === item ? true : false}
                onChange={(e) => setSelected(item)}
              />
              <p>{item}</p>
            </div>
          ))}
          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Type ......'
            className='bg-white w-full mt-10 border border-gray-300 outline-none p-4 rounded-md focus:ring-2 ring-blue-500'
          ></textarea>
          {isLoading ? (
            <Loading />
          ) : (
            <Button
              type='button'
              label='Submit'
              onClick={handleSubmit}
              className='bg-blue-600 text-white rounded'
            />
          )}
        </div>
      </div>
    </div>
  );
};

const TaskDetail = () => {
  const { id } = useParams();
  const [images, setImages] = useState([]);
  const [isLoadingImages, setLoadingImages] = useState(false);
  const { user } = useSelector((state) => state.auth);
  // console.log(id);
  const { data, isLoading, refetch } = useGetSingleTaskQuery(id);
  // console.log(new Date(data?.tasks?.screenshot?.createdAt).toLocaleString())
  
  
  const [isModalOpen, setModalOpen] = useState(false);

  // const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  // const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  // const [selectedImage, setSelectedImage] = useState(null);

  // const openGallery = () => setIsGalleryOpen(true);
  // const closeGallery = () => setIsGalleryOpen(false);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Replace with your actual image URLs
  const screenshots = [
    { id: 1, uri: "https://via.placeholder.com/150/FF0000/FFFFFF" },
    { id: 2, uri: "https://via.placeholder.com/150/00FF00/FFFFFF" },
    { id: 3, uri: "https://via.placeholder.com/150/0000FF/FFFFFF" },
    { id: 4, uri: "https://via.placeholder.com/150/FFFF00/FFFFFF" },
  ];

  const openImageModal = (image) => {
    setSelectedImage(image);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setIsImageModalOpen(false);
  };

  const [subTaskAction, { isLoading: isSubmitting }] =
    useChangeSubTaskStatusMutation();
    // const { data, error, isLoading } = useGetTaskScreenshotsQuery(taskId);


    // console.log(data?.screenshots)
  // const status = params?.status || "";


  const [selected, setSelected] = useState(0);
  const task = data?.task || [];

  const convertBufferToBase64 = (screenshot) => {
    const buffer = screenshot?.data; // Access the nested data property
    if (buffer && buffer.type === "Buffer" && Array.isArray(buffer.data)) {
      try {
        // Convert the buffer data into a Uint8Array
        const uint8Array = new Uint8Array(buffer.data);
  
        // Process in chunks to avoid stack overflow
        let binaryString = "";
        const chunkSize = 1024; // Adjust chunk size based on your needs
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.subarray(i, i + chunkSize);
          binaryString += String.fromCharCode(...chunk);
        }
  
        // Convert the binary string to Base64
        const base64String = btoa(binaryString);
        return `data:image/png;base64,${base64String}`; // Update with the correct MIME type if necessary
      } catch (error) {
        console.error("Error in converting buffer to Base64:", error);
        return null;
      }
    }
    console.warn("Invalid buffer format:", screenshot);
    return null;
  };

  
  
  // Convert screenshots to Base64 when data is loaded
  useEffect(() => {
    console.log("Fetched screenshots data:", data?.task?.screenshots);

    if (data?.task?.screenshots) {
      console.log("Screenshot data:", data?.task?.screenshots);
      const createdAt = data?.tasks?.screenshot?.createdAt;
      console.log(createdAt)
  
      if (createdAt) {
        const formattedDate = new Date(createdAt).toLocaleString();
        if (isNaN(new Date(createdAt))) {
          console.error("Invalid Date format:", createdAt);
        } else {
          console.log("Formatted Date:", formattedDate);
        }
      } else {
        console.warn("createdAt field is missing in the screenshot data");
      }
    }
  
    if (data?.task?.screenshots?.length > 0) {
      const base64Images = data.task.screenshots
      // const date = data.task.uploadedAt
      console.log(date)
        .map((screenshot) => convertBufferToBase64(screenshot)) // Pass each screenshot object
        .filter((image) => image !== null); // Filter out invalid conversions
  
      setImages(base64Images); // Store Base64 images in state
      console.log("Base64 images stored in state:", base64Images);
      const uploadDate = data.task.uploadedAt; // Extract the uploaded date
    console.log("Upload date:", uploadDate);
    } else {
      console.warn("No valid screenshots found.");
    }
  }, [data]);
  
    
  
  const handleButtonClick = () => {
    console.log("Current images state:", images);
    if (images.length > 0) {
      setModalOpen(true);
    } else {
      console.warn("No images available to display.");
    }
  };
  
  // useEffect(() => {
    
  // }, [data]);

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // const images = [
  //   'https://via.placeholder.com/600x400', // Replace with your image URLs
  //   'https://via.placeholder.com/600x400?text=Image+2',
  //   'https://via.placeholder.com/600x400?text=Image+3',
  // ];

  const handleSubmitAction = async (el) => {
    try {
      const data = {
        id: el.id,
        subId: el.subId,
        status: !el.status,
      };
      const res = await subTaskAction({
        ...data,
      }).unwrap();

      toast.success(res?.message);
      refetch();
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  if (isLoading)
    <div className='py-10'>
      <Loading />
    </div>;

  const percentageCompleted =
    task?.subTasks?.length === 0
      ? 0
      : (getCompletedSubTasks(task?.subTasks) / task?.subTasks?.length) * 100;

  return (
    <div className='w-full flex flex-col gap-3 mb-4 overflow-y-hidden'>
      {/* task detail */}
      <h1 className='text-2xl text-gray-600 font-bold'>{task?.title}</h1>
      <Tabs tabs={TABS} setSelected={setSelected}>
        {selected === 0 ? (
          <>
            <div className='w-full flex flex-col md:flex-row gap-5 2xl:gap-8 bg-white shadow rounded-md px-8 py-8 overflow-y-auto'>
              <div className='w-full md:w-1/2 space-y-8'>
                <div className='flex items-center gap-5'>
                  <div
                    className={clsx(
                      "flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full",
                      PRIOTITYSTYELS[task?.priority],
                      bgColor[task?.priority]
                    )}
                  >
                    <span className='text-lg'>{ICONS[task?.priority]}</span>
                    <span className='uppercase'>{task?.priority} Priority</span>
                  </div>

                  <div className={clsx("flex items-center gap-2")}>
                    <TaskColor className={TASK_TYPE[task?.stage]} />
                    <span className='text-black uppercase'>{task?.stage}</span>
                  </div>
                </div>

                <p className='text-gray-500'>
                  Created At: {new Date(task?.date).toDateString()}
                </p>

                <div className='flex items-center gap-8 p-4 border-y border-gray-200'>
                  <div className='space-x-2'>
                    <span className='font-semibold'>Assets :</span>
                    <span>{task?.assets?.length}</span>
                  </div>
                  <span className='text-gray-400'>|</span>
                  <div className='space-x-2'>
                    <span className='font-semibold'>Sub-Task :</span>
                    <span>{task?.subTasks?.length}</span>
                  </div>
                </div>
                {!status && user?.isAdmin && (
                <div>
                   
                <Button
                  label="Track Task"
                  className="flex flex-row-reverse gap-1 items-center bg-purple-600 text-white rounded-md py-2 2xl:py-2.5"
                  onClick={handleButtonClick} // Call handleButtonClick when button is clicked
                />
                
                {/* Open ImagesModal with the images passed */}
                <ImagesModal open={isModalOpen} onClose={() => setModalOpen(false)} images={images}>
                  {isLoading && <p>Loading images...</p>}
                  {!isLoading && images.length === 0 && <p>No images available.</p>}
                </ImagesModal>
              </div>
                  )}

                <div className='space-y-4 py-6'>
                  <p className='text-gray-500 font-semibold text-sm'>
                    TASK TEAM
                  </p>
                  <div className='space-y-3'>
                    {task?.team?.map((m, index) => (
                      <div
                        key={index + m?._id}
                        className='flex gap-4 py-2 items-center border-t border-gray-200'
                      >
                        <div
                          className={
                            "w-10 h-10 rounded-full text-white flex items-center justify-center text-sm -mr-1 bg-blue-600"
                          }
                        >
                          <span className='text-center'>
                            {getInitials(m?.name)}
                          </span>
                        </div>
                        <div>
                          <p className='text-lg font-semibold'>{m?.name}</p>
                          <span className='text-gray-500'>{m?.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {task?.subTasks?.length > 0 && (
                  <div className='space-y-4 py-6'>
                    <div className='flex items-center gap-5'>
                      <p className='text-gray-500 font-semibold text-sm'>
                        SUB-TASKS
                      </p>
                      <div
                        className={`w-fit h-8 px-2 rounded-full flex items-center justify-center text-white ${
                          percentageCompleted < 50
                            ? "bg-rose-600"
                            : percentageCompleted < 80
                            ? "bg-amber-600"
                            : "bg-emerald-600"
                        }`}
                      >
                        <p>{percentageCompleted.toFixed(2)}%</p>
                      </div>
                    </div>
                    <div className='space-y-8'>
                      {task?.subTasks?.map((el, index) => (
                        <div key={index + el?._id} className='flex gap-3'>
                          <div className='w-10 h-10 flex items-center justify-center rounded-full bg-violet-200'>
                            <MdTaskAlt className='text-violet-600' size={26} />
                          </div>

                          <div className='space-y-1'>
                            <div className='flex gap-2 items-center'>
                              <span className='text-sm text-gray-500'>
                                {new Date(el?.date).toDateString()}
                              </span>

                              <span className='px-2 py-0.5 text-center text-sm rounded-full bg-violet-100 text-violet-700 font-semibold lowercase'>
                                {el?.tag}
                              </span>

                              <span
                                className={`px-2 py-0.5 text-center text-sm rounded-full font-semibold ${
                                  el?.isCompleted
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-50 text-amber-600"
                                }`}
                              >
                                {el?.isCompleted ? "done" : "in progress"}
                              </span>
                            </div>
                            <p className='text-gray-700 pb-2'>{el?.title}</p>

                            <>
                              <button
                                disabled={isSubmitting}
                                className={`text-sm outline-none bg-gray-100 text-gray-800 p-1 rounded ${
                                  el?.isCompleted
                                    ? "hover:bg-rose-100 hover:text-rose-800"
                                    : "hover:bg-emerald-100 hover:text-emerald-800"
                                } disabled:cursor-not-allowed`}
                                onClick={() =>
                                  handleSubmitAction({
                                    status: el?.isCompleted,
                                    id: task?._id,
                                    subId: el?._id,
                                  })
                                }
                              >
                                {isSubmitting ? (
                                  <FaSpinner className='animate-spin' />
                                ) : el?.isCompleted ? (
                                  " Mark as Undone"
                                ) : (
                                  " Mark as Done"
                                )}
                              </button>
                            </>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className='w-full md:w-1/2 space-y-3'>
                {task?.description && (
                  <div className='mb-10'>
                    <p className='text-lg font-semibold'>TASK DESCRIPTION</p>
                    <div className='w-full'>{task?.description}</div>
                  </div>
                )}

                {task?.assets?.length > 0 && (
                  <div className='pb-10'>
                    <p className='text-lg font-semibold'>ASSETS</p>
                    <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {task?.assets?.map((el, index) => (
                        <img
                          key={index}
                          src={el}
                          alt={index}
                          className='w-full rounded h-auto md:h-44 2xl:h-52 cursor-pointer transition-all duration-700 md:hover:scale-125 hover:z-50'
                        />
                      ))}
                    </div>
                  </div>
                )}

                {task?.links?.length > 0 && (
                  <div className=''>
                    <p className='text-lg font-semibold'>SUPPORT LINKS</p>
                    <div className='w-full flex flex-col gap-4'>
                      {task?.links?.map((el, index) => (
                        <a
                          key={index}
                          href={el}
                          target='_blank'
                          className='text-blue-600 hover:underline'
                        >
                          {el}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <Activities activity={task?.activities} refetch={refetch} id={id} />
          </>
        )}
      </Tabs>
    </div>
  );
};

export default TaskDetail;
