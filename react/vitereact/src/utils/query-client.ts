import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();
// React Query的核心是QueryClient, 常用功能如下
// // 直接设置查询数据
// queryClient.setQueryData(['user'], (old) => ({
//   ...old,
//   name: 'New Name',
// }));

// // 获取查询数据
// const userData = queryClient.getQueryData(['user']);

// // 使查询无效并重新获取
// queryClient.invalidateQueries(['user']);

// 创建一个状态管理器
// const useStore = () => {
//   // 获取用户数据
//   const userQuery = useQuery({
//     queryKey: ['user'],
//     queryFn: fetchUser,
//   });

//   // 获取用户设置
//   const settingsQuery = useQuery({
//     queryKey: ['settings'],
//     queryFn: fetchSettings,
//   });

//   // 获取通知
//   const notificationsQuery = useQuery({
//     queryKey: ['notifications'],
//     queryFn: fetchNotifications,
//   });

//   return {
//     user: userQuery.data,
//     settings: settingsQuery.data,
//     notifications: notificationsQuery.data,
//     isLoading: userQuery.isLoading || settingsQuery.isLoading || notificationsQuery.isLoading,
//   };
// };

// // 1. 使用 enabled 控制查询时机
// const { data } = useQuery({
//   queryKey: ['data', dependencyId],
//   queryFn: fetchData,
//   enabled: !!dependencyId, // 只在 dependencyId 存在时查询
// });

// // 2. 使用 select 转换数据
// const { data } = useQuery({
//   queryKey: ['users'],
//   queryFn: fetchUsers,
//   select: (users) => users.map(user => user.name), // 只返回用户名列表
// });

// // 3. 预加载数据
// const prefetchTodos = async () => {
//   await queryClient.prefetchQuery({
//     queryKey: ['todos'],
//     queryFn: fetchTodos,
//   });
// };

// // 4. 乐观更新
// const mutation = useMutation({
//   mutationFn: updateTodo,
//   onMutate: async (newTodo) => {
//     await queryClient.cancelQueries(['todos']);
//     const previousTodos = queryClient.getQueryData(['todos']);
//     queryClient.setQueryData(['todos'], old => [...old, newTodo]);
//     return { previousTodos };
//   },
//   onError: (err, newTodo, context) => {
//     queryClient.setQueryData(['todos'], context.previousTodos);
//   },
// });
export default queryClient;
