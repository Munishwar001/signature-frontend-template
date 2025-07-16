import { any } from "zod";
import { Client } from "./abstract";

export class OtpClient extends Client {
  constructor(url: string) {
    super(url);
  }
  async generateOtp(id: any) {
    try {
      const response = await this.request("GET", `/api/otp/${id}`);
      return response.data;
    } catch (err) {
      console.log("Error while uploading the signature =>", err);
      throw err;
    }
  }
  async verifyOtpAndSign(otp: string, recordId: any, signature: any) {
    try {
      const response = await this.request("POST", `/api/otp/verify`, {
        data: {
          otp: otp,
          recordId: recordId,
          selectedImg: signature
        },
      });
      console.log(response.data.response);
      return response.data.success;
    } catch (err) {
      console.log("Error while uploading the signature =>", err);
      throw err;
    }
  }
}

