import MainAreaLayout from "../components/main-layout/main-layout";
import CustomTable from "../components/CustomTable";
import { useState, useEffect } from "react";
import { UploadOutlined, DownOutlined } from "@ant-design/icons";
import { courtClient } from "../store";
import { requestClient } from "../store";
import { useNavigate } from "react-router";
import { useAppStore } from "../store";
import {
  Button,
  Drawer,
  Form,
  Input,
  Upload,
  Select,
  Tag,
  Space,
  Spin,
  Popconfirm,
  message,
  Dropdown,
  Menu ,
  Modal
} from "antd";

interface RequestItem {
  id: string;
  templateName?: string;
  documentCount?: number;
  data?:Array<any>;
  signStatus?:number;
  rejectedCount?: number;
  createdAt?: string;
  status?: string;
}

const Requests: React.FC = () => {
    const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [officer, setOfficers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<string | null>(null); 
  const [, setCurrentPage] = useState<number>(1);
  const [request, setRequest] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search , setSearch] = useState("");
  const getSession = useAppStore().init; 
  const session = useAppStore().session?.userId;
  const userRole = useAppStore().session?.role;


  const handleDrawer = () => {
    setIsDrawerOpen(true);
  };
  
  const handleDelete = async (id: string) => { 
    try {
      const res = await requestClient.deleteWholeTemplate(id);
      if (res) {
      await fetchRequest();
      message.success("Request deleted successfully");
      } 
  }catch(err){
    // console.log("Error deleting request", err);
  } 
}
  const handleAddNewRequest = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await requestClient.uploadFormData(values);
      message.success('Request submitted successfully');
      form.resetFields();
      setIsDrawerOpen(false);
      await fetchRequest();
    } catch (error) {
      // console.error("Error submitting request:", error);
      message.error('Failed to submit request');
    }finally{
      setLoading(false);
    } 
  };
 const handleSend = async (record:any) =>{
  const hasData =   record.data.length;
   try {
    if(hasData<=0){
        message.info("Plesae upload the Bulk Data First");
        return ;}

        setSelectedRequest(record);
        setIsModalOpen(true);  
      
}
  catch(err){ 
    console.log("Error while sending the request to officer =>",err)
  }
 } 

 const handleOfficerSelection = async () => { 
  if (!selectedOfficer || !selectedRequest) {
    message.error("Please select an officer.");
    return;
  }
     alert(selectedOfficer);
     console.error("  wqdfegrhjkjyhgfdsdfghjjhytgfdsasdfgh")
  try {
    await requestClient.sendRequestToOfficer({
      recordId: selectedRequest.id,
      officerId: selectedOfficer 
    });
    message.success("Request sent for signaturjhbvcvbnbvbne");
    setIsModalOpen(false); 
    setSelectedRequest(null);
    setSelectedOfficer(null);
    // await fetchRequest(); 
  } catch (err) {
    console.error("Error sending request:", err);
    message.error("Failed to send request");
  }
};
  const columns = [
    {
      title: "Request",
      dataIndex: "templateName",
      key: "name",
    },
    {
      title: "No. of Document",
      dataIndex: "data",
      key: "NoOfDocument",
    render: (count:any[] , record: any) => (
                    <Button
                        type="link"
                        onClick={() => {navigate(`/dashboard/request/${record.id}`) }}
                    >
                        {count.length || 0}  
                    </Button>
                ),
    },
    {
      title: "Rejected Document",
      dataIndex: "rejectCount",
      key: "RejectedDocument",
      render: (count: number) => count || 0,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "CreatedAt",
      sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    render: (createdAt: string) => {
    const date = new Date(createdAt);
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  },
    },
    {
      title: "Status",
      dataIndex: "signStatus",
      key: "signStatus",
      render: (_: any, record: any) => (
        <Tag color={record.signStatus  == 0 ? 'orange' : record.signStatus  == 1 ? 'green' : 'red'}  onClick={ () => {console.log(record.signStatus )}}>
                      {record.signStatus  == 0 ? 'Unsigned' : record.signStatus  == 1 ? 'Signed' : record.signStatus  == 4 ?'inProgress' : 'Rejected'}
                  </Tag>
      ),
    },
    {
      //  title: "Actions",
      key: "actions",
      render: (_: any, record: any) => {
        const handleMenuClick = ({ key }: any) => {
          if (key === "clone") {
            requestClient.cloneFormData(record._id)
        .then(() => {
          message.success("Request cloned successfully");
          fetchRequest(); 
        })
        .catch(() => {
          message.error("Failed to clone request");
        });
          } else if (key === "send") { 
            handleSend(record);
          } else if (key === "delete") {
            handleDelete(record._id);
          }
        };

        const menu = (
          <Menu onClick={handleMenuClick}> 
            <Menu.Item key="clone">Clone</Menu.Item>
            { userRole==3 ? <Menu.Item key="send">Send for Signature</Menu.Item> :<Menu.Item key="delegate">Delegate for Signature</Menu.Item>} 
            {(userRole==3 &&  record.signStatus!=4)&& <Menu.Item key="delete">Delete</Menu.Item> }
            {userRole==2 && <Menu.Item key="sign">Sign</Menu.Item>}
          </Menu>
        );

        return (
          <Dropdown overlay={menu} trigger={['click']}>
            <Button>
              Actions <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  const filteredRequest = request.filter((item) =>
    item.templateName?.toLowerCase().includes(search.toLowerCase())
  );

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await requestClient.getRequest();
      setRequest(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      message.error('Failed to fetch requests');
      setRequest([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getOfficers = async () => {
      try {
        const response = await courtClient.getOfficers();
        setOfficers(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Error fetching officers:", error);
        setOfficers([]);
      }
    };
    
    getOfficers();
    fetchRequest();
  }, []);

  return (
    <MainAreaLayout
      title={userRole==3?"Request Management" : "Officer functionality"}
      extra={
        <>
          <Input placeholder="Search here........" 
          type="search" 
          onChange={(e) => setSearch(e.target.value)}
           />
          <Button
            type="primary"
            onClick={handleDrawer}
            className="px-6 py-2 text-lg rounded-md"
          >
            New Request for Signature
          </Button>
        </>
      }
    >
      <Spin spinning={loading}>
        <CustomTable
          serialNumberConfig={{
            name: "",
            show: true,
          }}
          columns={columns}
          data={filteredRequest}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Spin>

      <Drawer
        title="Send Request"
        placement="right"
        width={400}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleAddNewRequest}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Enter Title Of Your Request" />
          </Form.Item>

          <Form.Item
            label="Select the word file"
            name="file"
            rules={[{ required: true, message: 'Please upload a file' }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => e.fileList}
          >
            <Upload beforeUpload={() => false} accept=".doc,.docx" maxCount={1}>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>

          {/* <Form.Item
            label="Select the officer"
            name="officer"
            rules={[{ required: true, message: 'Please select an officer' }]}
          >
            <Select
              mode="tags"
              options={officer.map(el => ({
                label: `${el.name} <${el.email}>`,
                value: el.id,
              }))}
              placeholder="Please enter the officer"
            />
          </Form.Item> */}

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input.TextArea rows={5} placeholder="Enter Description" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
          >
            Send Request
          </Button>
        </Form>
      </Drawer>
      <Modal
        title="Select Officer for Signature"
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleOfficerSelection}
        okText="Send Request"
        cancelText="Cancel"
      >
        <Form layout="vertical">
          <Form.Item
            label="Select Officer"
            required
          >
            <Select
              placeholder="Select an officer"
              value={selectedOfficer}
              onChange={(value) => {
                console.log("Selected officer:", value); 
                setSelectedOfficer(value);
              }}              
              options={officer.map(o => ({
                label: `${o.name} <${o.email}>`,
                value: o.id
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </MainAreaLayout>
  );
};

export default Requests;