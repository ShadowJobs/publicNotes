import { getAdminUsers } from "@/services/user";
import { proxy } from "valtio";

export const userStore = proxy({
  adminInfo: getAdminUsers().then((res:any) => res.data)
});
