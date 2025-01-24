import { Menu, Transition } from "@headlessui/react";
import clsx from "clsx";
import { Fragment, useState, useEffect , useRef} from "react";
import { AiTwotoneFolderOpen } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { FaExchangeAlt } from "react-icons/fa";
import { HiDuplicate } from "react-icons/hi";
import { MdAdd, MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import {
  useChangeTaskStageMutation,
  useDuplicateTaskMutation,
  useTrashTastMutation,
  useGetAllTaskQuery
} from "../../redux/slices/api/taskApiSlice";
import ConfirmatioDialog from "../ConfirmationDialog";
import AddSubTask from "./AddSubTask";
import AddTask from "./AddTask";
import { useTaskContext } from '../contextapi/TaskContext';
import { useScreenRecording } from "../contextapi/RecordingContext";
import TaskColor from "./TaskColor";
import { useSelector } from "react-redux";

const CustomTransition = ({ children }) => (
  <Transition
    as={Fragment}
    enter="transition ease-out duration-100"
    enterFrom="transform opacity-0 scale-95"
    enterTo="transform opacity-100 scale-100"
    leave="transition ease-in duration-75"
    leaveFrom="transform opacity-100 scale-100"
    leaveTo="transform opacity-0 scale-95"
  >
    {children}
  </Transition>
);

const ChangeTaskActions = ({ _id, stage , onUpdateStatus}) => {
  const [changeStage] = useChangeTaskStageMutation();
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const videoRef = useRef(null);
  const { setTaskStatus, setTaskId} = useTaskContext();
  const { startRecording, stopRecording, attachStreamToVideo } = useScreenRecording();
  const [isSharing, setIsSharing] = useState(false);
  const [screenshots, setScreenshots] = useState([]);



  // const { data: tasks = [], isLoading, isFetching } = useGetAllTaskQuery();

  useEffect(() => {
    attachStreamToVideo(videoRef);
  }, [attachStreamToVideo]);  

  const { data } = useGetAllTaskQuery();

// console.log(data)

  // useEffect(() => {
  //   if (data?.tasks?._id) {
  //      // Set the taskId in context
  //   }
  // }, [data, setTaskId]);

  const handleConfirmInProgress = () => {
    try {
      const status = 'In Progress';
      setTaskStatus(status); 
      console.log('Task marked as In Progress:', status);
      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      console.error('Error marking task as In Progress:', error);
    }
  };

  const changeHandler = async (val) => {
    try {
      const data = { id: _id, stage: val };
      // console.log("task id from dialog",data?.id)
      const res = await changeStage(data).unwrap();
      toast.success(res?.message);
      setTaskId(data.id);
      // console.log(_id)

      if (val === "in progress") {
        handleConfirmInProgress();
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const items = [
    {
      label: "To-Do",
      stage: "todo",
      icon: <TaskColor className="bg-blue-600" />,
      onClick: () => changeHandler("todo"),
    },
    {
      label: "In Progress",
      stage: "in progress",
      icon: <TaskColor className="bg-yellow-600" />,
      onClick: () => setOpenConfirmation(true),
    },
    {
      label: "Completed",
      stage: "completed",
      icon: <TaskColor className="bg-green-600" />,
      onClick: () => changeHandler("completed"),
    },
  ];

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button
          className={clsx(
            "inline-flex w-full items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300"
          )}
        >
          Change Task
        </Menu.Button>

        <CustomTransition>
          <Menu.Items className="absolute p-4 left-0 mt-2 w-40 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div className="px-1 py-1 space-y-2">
              {items.map((el) => (
                <Menu.Item key={el.label} disabled={stage === el.stage}>
                  {({ active }) => (
                    <button
                      disabled={stage === el.stage}
                      onClick={el?.onClick}
                      className={clsx(
                        active ? "bg-gray-200 text-gray-900" : "text-gray-900",
                        "group flex gap-2 w-full items-center rounded-md px-2 py-2 text-sm disabled:opacity-50"
                      )}
                    >
                      {el.icon}
                      {el.label}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </CustomTransition>
      </Menu>
      {openConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-medium text-gray-900">
              Move Task to In Progress
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to move this task to "In Progress"?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setOpenConfirmation(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setOpenConfirmation(false);
                  changeHandler("in progress")
                  }
                }
                className="px-4 py-2 bg-yellow-600 text-white rounded-md"
              >
                Move Task to In Progress
              </button>
            </div>
          </div>
        </div>
        
      )}
       <video ref={videoRef} autoPlay className="hidden" />

    </> 
  );
};

export default function TaskDialog({ task, onScreenShareStart }) {
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const navigate = useNavigate();

  const [deleteTask] = useTrashTastMutation();
  const [duplicateTask] = useDuplicateTaskMutation();

  const deleteClicks = () => {
    setOpenDialog(true);
  };

  const deleteHandler = async () => {
    try {
      const res = await deleteTask({
        id: task._id,
        isTrashed: "trash",
      }).unwrap();

      toast.success(res?.message);

      setTimeout(() => {
        setOpenDialog(false);
        window.location.reload();
      }, 500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const duplicateHanlder = async () => {
    try {
      const res = await duplicateTask(task._id).unwrap();

      toast.success(res?.message);

      setTimeout(() => {
        setOpenDialog(false);
        window.location.reload();
      }, 500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const items = [
    {
      label: "Open Task",
      icon: <AiTwotoneFolderOpen className="mr-2 h-5 w-5" aria-hidden="true" />,
      onClick: () => navigate(`/task/${task._id}`),
    },
    {
      label: "Edit",
      icon: <MdOutlineEdit className="mr-2 h-5 w-5" aria-hidden="true" />,
      onClick: () => setOpenEdit(true),
    },
    {
      label: "Add Sub-Task",
      icon: <MdAdd className="mr-2 h-5 w-5" aria-hidden="true" />,
      onClick: () => setOpen(true),
    },
    {
      label: "Duplicate",
      icon: <HiDuplicate className="mr-2 h-5 w-5" aria-hidden="true" />,
      onClick: () => duplicateHanlder(),
    },
  ];

  return (
    <>
      <div className="">
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <BsThreeDots />
          </Menu.Button>

          <CustomTransition>
            <Menu.Items className="absolute p-4 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
              <div className="px-1 py-1 space-y-2">
                {items.map((el, index) => (
                  <Menu.Item key={el.label}>
                    {({ active }) => (
                      <button
                        disabled={index === 0 ? false : !user.isAdmin}
                        onClick={el?.onClick}
                        className={`${
                          active ? "bg-blue-500 text-white" : "text-gray-900"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm disabled:text-gray-400`}
                      >
                        {el.icon}
                        {el.label}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
              {!user.isAdmin && (
                <div className="px-1 py-1">
                  <Menu.Item>
                    <ChangeTaskActions id={task._id} {...task} onScreenShareStart={onScreenShareStart}/>
                  </Menu.Item>
                </div>
              )}

              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      disabled={!user.isAdmin}
                      onClick={() => deleteClicks()}
                      className={`${
                        active ? "bg-red-100 text-red-900" : "text-red-900"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm disabled:text-gray-400`}
                    >
                      <RiDeleteBin6Line
                        className="mr-2 h-5 w-5 text-red-600"
                        aria-hidden="true"
                      />
                      Delete
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </CustomTransition>
        </Menu>
      </div>

      <AddTask
        open={openEdit}
        setOpen={setOpenEdit}
        task={task}
        key={new Date().getTime()}
      />
      <AddSubTask open={open} setOpen={setOpen} />
      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />
    </>
  );
}
