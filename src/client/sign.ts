import { Client } from "./abstract";

export class SignClient extends Client {
    constructor(url: string) {
        super(url);
    }
    async upload(formData:any){
        try {
        const res = await this.request("POST",  `/api/signatures/upload`, {
            data: formData,
            headers: { "Content-Type" : "multipart/form-data"}
        });     
           console.log("res from upload req",res);
        } catch(err){
            console.log("Error while uploading the signature =>",err);
        }
    }
}

