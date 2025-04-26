import { Navigate } from "react-router-dom";
function AuthComponent({children}){
    let token=localStorage.getItem('token')
    return token? (<>{children}</>)
        :<Navigate to="/login"/>
}

export default AuthComponent