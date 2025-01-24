import React, { createContext, useContext, useState } from 'react';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [taskStatus, setTaskStatus] = useState('');
  const [taskId, setTaskId] = useState(''); // Add taskId state
  // console.log(".",setTaskId)


  return (<>
    <TaskContext.Provider value={{ taskStatus, setTaskStatus, taskId, setTaskId }}>
      {children}
    </TaskContext.Provider>
  </>
   
  );
};

export const useTaskContext = () => useContext(TaskContext);
