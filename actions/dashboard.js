"use server";
import {db} from "@lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

const serializeTransaction = (obj) => {
    const serialized = {...obj };
    if(obj.balance){
        serialized.balance=obj.balance.toNumber();
    }
    if(obj.amount){
        serialized.amount=obj.amount.toNumber();
    }
    return serialized;
};


export async function createAccount(data){
    try{
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");
        //to check user exist in Database or not
        const user = await db.user.findUnique({
            where: {clerkUserId:userId},
        
        });
        if(!user){
            throw new Error("User not found");
        }

        //convert balance to float before saving
        const balanceFloat = parseFloat(data.balance);
        if(isNaN(balanceFloat)){
            throw new Error("Invalid balance account");
        }
        //check if this is the user's first account
        const existingAccounts = await db.account.findMany({
            where: {userId: user.id},
        });


        const shouldBeDefault = existingAccounts.length===0?true : data.isDefault;

        //if this account should be default, unset other default accounts
        if(shouldBeDefault){
            await db.account.updateMany({
                where: {userId: user.id,isDefault: true},data: {isDefault: false},
            });
        }

        const account = await db.account.create({
            data:{
                ...data,
                balance: balanceFloat,
                userId:user.id,
                isDefault:shouldBeDefault,
            },
        });
        //next.js does nt support float values so it should be serialised
        const serializedAccount = serializeTransaction(account);
        //refetch the values of a page
        revalidatePath("/dashboard");
        return {success:true,data : serializedAccount};

    }catch(err){
        throw new Error(err.message);
    }
}

export async function getUserAccounts(){
    const {userId} = await auth();
    if(!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {clerkUserId:userId},
        });
        if(!user){
            throw new Error("User not found");
        }

        const accounts = await db.account.findMany({
            where : {userId: user.id},
            orderBy: {createdAt: "desc"},
            include:{
                _count:{
                    select:{
                        transactions:true,
                    }
                }
            }
        });
        const serializedAccount= accounts.map(serializeTransaction);
        return serializedAccount;
}

export async function getDashboardData() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    });

    if (!user) {
    throw new Error("User not found");
    }

  // Get all user transactions
    const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    });

    return transactions.map(serializeTransaction);
}