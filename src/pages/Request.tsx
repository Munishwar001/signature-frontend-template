import { Button, Drawer, Form, Upload, Space, message, Tag, Spin , Popconfirm } from "antd";
import MainAreaLayout from "../components/main-layout/main-layout";
import { useEffect, useState } from "react";
import { useParams } from 'react-router';
import { UploadOutlined } from "@ant-design/icons";
import { requestClient } from "../store";
import CustomTable from "../components/CustomTable";
import { useAppStore } from "../store";

export default function RequestPage() {
  const [form] = Form.useForm();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dynamicColumns, setDynamicColumns] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const getSession = useAppStore().init; 
  const session = useAppStore().session?.userId;
  const userRole = useAppStore().session?.role;
  const { id } = useParams();

  const handleDrawer = () => setIsDrawerOpen(true);

  const handleAddNewRequest = async () => {
    try {
      const values = await form.validateFields();
      const response = await requestClient.uploadBulkData(values, id);
      
      if (response.allfields && response.templateData?.data) {
        await fetchData();
        message.success('Data uploaded successfully');
        form.resetFields();
        setIsDrawerOpen(false);
      }
    } catch (error) {
      console.error("Error submitting request:", error); 
      message.error('Failed to submit request');
    }
  };
  const handleDelete = async (record:any) =>{
    try {
      //  alert("in handle delete function ");
      const response = await requestClient.deleteRequest(record , id);
      if (response) {
      message.success(`Deleted`);
      await fetchData();
      }
    }catch(err){
      console.log("Error while deleting request =>", err);
    }
  }

 const handlePreview = (record:any) => {
    try {
    const previewUrl = `http://localhost:3000/api/templates/preview/${id}/${record.id}`;
    window.open(previewUrl, "_blank");
  } catch (err) {
    message.error("Preview failed");
  }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await requestClient.fetchRequestData(id);

      if (!response.allfields || response.allfields.length === 0) {
        message.warning('Template has no defined fields');
        setDynamicColumns([]);
        setTableData([]);
        return;
      }

      const fieldColumns = response.allfields.map((field: string) => ({
        title: field,
        dataIndex: field,
        key: field,
      }));

      const completeColumns = [
        ...fieldColumns,
        {
          title: "Status",
          dataIndex: "signStatus",
          key: "signStatus",
          render: (status: number) => (
            <Tag color={status === 0 ? 'orange' : status === 1 ? 'green' : 'red'}>
              {status === 0 ? 'Unsigned' : status === 1 ? 'Signed' : 'Rejected'}
            </Tag>
          ),
        },
        {
          title: "Actions",
          key: "actions",
          render: (_: any, record: any) => (
            <Space size="middle">
              <Button type="link" onClick={() => handlePreview(record)}>View</Button>
              <Popconfirm
                  title="Are you sure you want to delete this record?"
                  onConfirm={() => handleDelete(record)}
                  okText="Yes"
                  cancelText="No"
                >
                <Button type="link" onClick={() => console.log(record)} style={{ color: '#ff4d4f' }}>Delete</Button>
              </Popconfirm>
            </Space>
          ),
        }
      ];

      setDynamicColumns(completeColumns);

      const transformedData = response.data.map((item: any, index: number) => {
        const rowData: any = {
          key: index,
          id: item.id,
          signStatus: item.signStatus
        };

        const dataEntries = item.data instanceof Map ? 
          Array.from(item.data.entries()) : 
          Object.entries(item.data);

        dataEntries.forEach(([key, value]:any) => { 
          rowData[key] = value;
        });

        return rowData;
      });

      setTableData(transformedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error('Failed to load template data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {          
    if (id) {
      fetchData();
    }
  }, [id]);

  return (
    <MainAreaLayout
  title="Template Data Manager"
  extra={
    userRole === 3 && (
      <>
        <Button
          type="primary"
          onClick={handleDrawer}
          className="px-6 py-2 text-lg rounded-md"
        >
          Bulk Upload
        </Button>
        <Button
          type="primary"
          className="px-6 py-2 text-lg rounded-md"
        >
          Download Format Template 
        </Button>
      </>
    )
  }
>
      {loading ? (
        <div className="text-center py-8">
          <Spin size="large" />
        </div>
      ) : (
        <CustomTable
          serialNumberConfig={{
            name: "",
            show: true,
          }}
          columns={dynamicColumns.length > 0 ? dynamicColumns : [
            {
              title: "No Data Available",
              dataIndex: "noData",
              key: "noData",
              render: () => "Upload data or check template fields",
            }
          ]}
          data={tableData}
        />
      )}
      
      <Drawer
        title="Upload Data"
        placement="right"
        width={400}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <Form
          layout="vertical"
          form={form}
        >
          <Form.Item
            label="Excel File"
            name="file"
            rules={[{ required: true, message: 'Please upload a file' }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => e.fileList}
          >
            <Upload 
              beforeUpload={() => false} 
              accept=".xlsx,.xls" 
              maxCount={1}
              disabled={loading}
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
             <p> <strong>Note :</strong> Ensure the placeholders in the Template, match the 
             column headers in the Excel file. Upload the file with text data only, avoiding 
             special characters and images</p> <br />
          <Button
            type="primary"
            htmlType="submit"
            block
            onClick={handleAddNewRequest}
            loading={loading}
          >
            Upload Data
          </Button>
        </Form>
      </Drawer>
    </MainAreaLayout>
  );
}