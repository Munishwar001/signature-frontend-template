import React, { useState } from 'react';
import { Layout, Typography, Upload, Button, message, Card ,Image} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { signClient } from  "../store";
import { useEffect } from 'react';
import { useAppStore } from "../store";
const { Header, Content } = Layout;
const { Title  } = Typography;

const Signatures: React.FC = () => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const getSession = useAppStore().init; 
  const session = useAppStore().session?.userId;
  const userRole = useAppStore().session?.role;
  const [signatures, setSignatures] = useState<any[]>([]);

  const handleUpload = async () => {
    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('file', file as any); 
    });

    setUploading(true);
    try {
     const imageData = await signClient.upload(formData); 
      setSignatures((prev)=>[...prev, { url: imageData.url }])
     message.success("Signature Uploaded Successfully")
  } catch (error:any) {
      message.error("Invalid file Type");
  }
    setUploading(false);
    setFileList([]);
  };

  const uploadProps = {
    beforeUpload: (file: any) => {
      setFileList([file]); 
      return false; 
    },
    onRemove: () => {
      setFileList([]);
    },
    fileList,
  };
 useEffect(()=>{
  async function fetchSign(){ 
    const loggedUserId = session ; 
    const response = await signClient.getSign(loggedUserId);
    setSignatures(response);
    }
    fetchSign();
 },[])
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ background: "#1890ff" }}>
        <div style={{ color: "#fff", fontSize: "20px", fontWeight: 600 }}>
          Signatures
        </div>
      </Header>

      <Content
        style={{
          padding: "40px 24px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Card
          title={
            <Title level={3}>Upload a Signature (.jpg or .png only)</Title>
          }
          style={{
            width: "100%",
            maxWidth: "600px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            overflowY: "auto",
          }}
        >
          {fileList.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>Preview</Title>
              <Image
                src={URL.createObjectURL(fileList[0])}
                alt="Signature Preview"
                style={{
                  width: 150,
                  border: "1px solid #ccc",
                  padding: 4,
                }}
              />
            </div>
          )}
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>

          <Button
            type="primary"
            onClick={handleUpload}
            disabled={fileList.length === 0 || uploading}
            loading={uploading}
            style={{ marginTop: 16 }}
          >
            {uploading ? "Uploading..." : "Start Upload"}
          </Button>
          <br />
          {signatures.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <Title level={4}>Uploaded Signatures</Title>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                {signatures.map((sig, idx) => (
                  <div key={idx}>
                    <Image
                      src={sig.url}
                      alt={`Signature ${idx + 1}`}
                      style={{
                        width: 150,
                        border: "1px solid #ccc",
                        padding: 4,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default Signatures;
