import { UserService } from "@/services";
import { useQuery } from "@tanstack/react-query";
import axios from "@/utils/axios";

export default function useUser() {
  return useQuery({
    queryKey: ["user/info"],
    queryFn: async () => {
      const token = UserService.getToken();
      if(token){
        axios.defaults.headers.common["Authorization"] = `${token}`;
        return await UserService.getUserInfo();
      }
    },
    staleTime: Infinity,
    cacheTime: Infinity
  });
}
