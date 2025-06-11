//accounts side server route
"use server";
import {db} from "@/lib/prisma";
import {auth} from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { date } from "zod";
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

export async function updateDefaultAccount(accountId){
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
            await db.account.updateMany({
                where: {userId: user.id,isDefault: true},data: {isDefault: false},
            });

            const account = await db.account.update({
                where:{
                    id:accountId,
                    userId: user.id,
                },
                data: {isDefault: true},
            });

            revalidatePath("/dashboard");
            return {success: true,data:serializeTransaction(account)};
        }
        catch(err){
            return {success:false, error:err.message};
        }
}

//server actions the below one is for accounts/[id] folder when
//we click on certain account
export async function getAccountWithTransactions(accountId){
    const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");
        //to check user exist in Database or not
        const user = await db.user.findUnique({
        where: {clerkUserId:userId},
        
    });
        if(!user){
            throw new Error("User not found");
        }

        const account= await db.account.findUnique({
            where: {id:accountId , userId:user.id},
            include:{
                transactions:{
                    orderBy: {date:"desc"},
                },
                _count:{
                    select: {transactions: true},
                },
            },
        });
        if(!account) return null;
        
        return {
            //converts all of the decimals into numbers
            ...serializeTransaction(account),
            transactions:account.transactions.map(serializeTransaction),
        };
}

export async function bulkDeleteTransactions(transactionIds){
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
            const transactions = await db.transaction.findMany({
                where:{
                    id:{in: transactionIds},
                    userId:user.id,
                },
            });
            const accountBalanceChanges = transactions.reduce((acc,transaction)=>{
            //deciding whether it is expense or income then w.r.t that
            //we are adding +ve or -ve value
            const change =
            transaction.type === "EXPENSE"
            ? transaction.amount: -transaction.amount;
//if the transactions are from multiple different account then we use accumulator
//change is added to the balance
//acc->accumulator
            acc[transaction.accountId] = (acc[transaction.accountId]||0)+change;
            return acc;
            },{});

        //Delete transactions and update account balances in a transaction
        //transaction keyword specific to prisma
        await db.$transaction(async (tx)=>{
            await tx.transaction.deleteMany({
                where:{
                    id:{in: transactionIds},
                    userId: user.id,
                },
            });

        for(const [accountId,balanceChange] of Object.entries(
            accountBalanceChanges
        )){
            await tx.account.update({
                where:{id:accountId},
                data:{
                    balance:{
                        increment:balanceChange,
                    }
                }
            });
        }
        });

        revalidatePath("/dashboard");
revalidatePath("/account/[id]");
        return{success:true};
        }catch(err){
            return {success: false, error:err.message};
        }
}