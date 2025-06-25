import { OnAuthenticateUser } from "@/actions/auth"
import { redirect } from "next/navigation";


export const dynamic = 'force-dynamic'

const AuthCallbackPage = async () => {

    const auth = await OnAuthenticateUser();

    if(auth.isAuthenticated && (auth.status === 200 || auth.status === 201)) {
        redirect('/home');
    } else {
        redirect('/sign-in');
    }
    // This page is used to handle the callback from the authentication provider
    // It can be used to redirect the user or show a loading state
    return (
        <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting...</p>
        </div>
    )
}

export default AuthCallbackPage