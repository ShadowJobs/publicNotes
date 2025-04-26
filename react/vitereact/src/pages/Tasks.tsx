import useUser from "@/hooks/useUser";
import React, { useState } from "react"
const Tasks: React.FC<{}> = ({ }) => {
  const { data } = useUser();
  return <>
   user is {data?.name}
  </>
}
export default Tasks