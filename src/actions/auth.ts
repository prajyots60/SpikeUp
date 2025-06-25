"use server"

import { prismaClient } from "@/lib/prismaClient";
import { currentUser } from "@clerk/nextjs/server"

export async function OnAuthenticateUser() {
    try {
        const user = await currentUser();

        if(!user){
            return {
                isAuthenticated: false,
                user: null,
                status: 403
            }
        }

        const userExists = await prismaClient.user.findUnique({
            where: {
                clerkId : user.id
            }
        })

        if(userExists){
            return {
                isAuthenticated: true,
                user: userExists,
                status: 200
            }
        }

        const newUser = await prismaClient.user.create({
            data: {
                clerkId : user.id,
                email   : user.emailAddresses[0]?.emailAddress || "",
                name    : user.firstName + ' ' + user.lastName,
                profileImage   : user.imageUrl,
            }
        })

        if(!newUser){
            return {
                isAuthenticated: false,
                user: null,
                status: 500,
                message: "Failed to create user"
            }
        }

        return {
            isAuthenticated: true,
            user: newUser,
            status: 201
        }
    } catch (error) {
        console.log("Error in OnAuthenticateUser:", error);
        return {
            isAuthenticated: false,
            user: null,
            status: 500,
            message: "Internal server error"            
        }
    }
}