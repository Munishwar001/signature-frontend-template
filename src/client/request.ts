import { message } from "antd";
import { Client } from "./abstract";

export class RequestClient extends Client {
  constructor(url: string) {
    super(url);
  }
  async uploadFormData(formValues: {
    title: string;
    description: string;
    file: any;
  }) {
    try {
      const formData = new FormData();
      formData.append("title", formValues.title);
      console.log("title", formValues.title);
      formData.append("description", formValues.description);
      console.log("description", formValues.description);
      formData.append("file", formValues.file[0].originFileObj);
      console.log("file", formValues.file[0].originFileObj);
      for (var pair of formData.entries()) {
        console.log("pair", pair);
      }
      const res = await this.request("POST", `/api/templates`, {
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(res);
      return res;
    } catch (err) {
      console.log(err);
    }
  }
  async sendRequestToOfficer(data: { recordId: String; officerId: String }) {
    try {
      console.log("data while sending for sign ", data);
      const res = await this.request("POST", `/api/templates/sendForSign`, {
        data: { data },
        headers: { "Content-Type": "application/json" },
      });
      console.log(res);
      return res;
    } catch (err) {
      console.log("error while send for signature =>", err);
    }
  }
  async cloneFormData(id: String) {
    try {
      const res = await this.request("GET", `/api/templates/${id}/clone`);
      console.log(res);
      return res;
    } catch (err) {
      console.log(err);
    }
  }
  async getRequest() {
    const res = await this.request("GET", `/api/templates`);
    return res.data;
  }

  async uploadBulkData(
    formValues: {
      title: string;
      file: any;
    },
    templateId: any
  ) {
    try {
      const formData = new FormData();
      formData.append("title", formValues.title);
      formData.append("file", formValues.file[0].originFileObj);
      formData.append("templateId", templateId);
      for (var pair of formData.entries()) {
        console.log(pair);
      }
      const res = await this.request("POST", `/api/templates/datahandling`, {
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("response of this bulkUpload", res);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  }

  async fetchRequestData(id: any) {
    try {
      const response = await this.request("GET", `/api/templates/${id}`);
      console.log("response in fetchRequestData", response);
      return {
        ...response.data,
        data:
          response.data.data?.map((item: any) => ({
            ...item,
            data: new Map(Object.entries(item.data)),
          })) || [],
        templateVariables: response.data.templateVariables || [],
        templateName: response.data.templateName,
		signStatus:response.data.signStatus,
      };   
    } catch (error) {
      throw error;
    }
  }

  async deleteRequest(record: any, id: any) {
    console.log("id from the deleteRequest", id);
    try {
      const res = await this.request("POST", `/api/templates/delete/${id}`, {
        data: record,
      });
      console.log("response of this deleteRequest", res);
      return res.data.success;
    } catch (err) {
      console.log("Error while deleting the template => ", err);
    }
  }

  async deleteWholeTemplate(id: String) {
    try {
      const res = await this.request(
        "DELETE",
        `/api/templates/deleteWholeTemplate/${id}`
      );
      console.log("response of this deleteWholeTemplate", res);
      return res.status === 201;
    } catch (err) {
      console.log("Error while deleting the template => ", err);
    }
  }

  async handleDelegate(record: any) {
    try {
      const res = await this.request("POST", `/api/templates/delegate`, {
        data: record,
      });
      console.log("response of this requestClient", res);
      return res;
    } catch (error) {
      console.log("Error while Delegation the request => ", error);
    }
  }

  async previewDocs(id: String) {
    try {
      const previewUrl = `http://localhost:3000/api/templates/previewDocs/${id}`;
      window.open(previewUrl, "_blank");
    } catch (error) {
      console.log("Error while preview the DocsTemplate =>", error);
      message.error("Enable for preview");
    }
  }
  async fetchRejectedData(id: any) {
    try {
      const response = await this.request(
        "GET",
        `/api/templates/fetchRejected/${id}`
      );
      console.log("fetching response", response);
      return {
        ...response.data,
        data:
          response.data.data?.map((item: any) => ({
            ...item,
            data: new Map(Object.entries(item.data)),
          })) || [],
        templateVariables: response.data.templateVariables || [],
        templateName: response.data.templateName,
      };
    } catch (error) {
      console.log("Error while fetching the rejected Communication =>", error);
    }
  }

  async rejectTemplate(record: any, id: any) {
    console.log("id from the deleteRequest", id);
    try {
      const res = await this.request("POST", `/api/templates/reject/${id}`, {
        data: record,
      });
      console.log("response of this deleteRequest", res);
      return res.data.success;
    } catch (err) {
      console.log("Error while rejecting the template => ", err);
    }
  }
  async handleRejectRequest(id:any , reason: string) {
    try { 
		console.log("in the sendRejected Request section =>",id ,reason);
      const res = await this.request("POST", `/api/templates/rejectWholeRequest/${id}`, {
        data:{ reason}, 
      });
      console.log("response of this requestClient", res);
      return res;
    } catch (error) {
      console.log("Error while rejecting the request => ", error);
    }
  }
}
