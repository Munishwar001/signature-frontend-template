import { any } from "zod";
import { Client } from "./abstract";

export class SignClient extends Client {
    constructor(url: string) {
        super(url);
    }
    async upload(formData:any){
        try {
        const response = await this.request("POST",  `/api/signatures/upload`, {
            data: formData,
            headers: { "Content-Type" : "multipart/form-data"}
        });     
         return response.data ;
        } catch (err) {
            console.log("Error while uploading the signature =>", err);
            throw err;
        }
    } 
    async getSign(loggedUserId:any){
        try { 
            const response = await this.request("GET",  `/api/signatures/getSignature/${loggedUserId}`);
            console.log(response.data.response);     
            return response.data.response ;
            } catch (err) {
                console.log("Error while uploading the signature =>", err);
                throw err;
            }
    }
}

