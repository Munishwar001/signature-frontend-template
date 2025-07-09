import React, { useState } from 'react';
import { Layout, Typography, Upload, Button, message, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { signClient } from  "../store";


const { Header, Content } = Layout;
const { Title } = Typography;

const Signatures: React.FC = () => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('file', file as any); 
    });

    setUploading(true);
    await signClient.upload(formData);
    setUploading(false);
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#1890ff' }}>
        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 600 }}>
          Signatures
        </div>
      </Header>

      <Content
        style={{
          padding: '40px 24px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Card
          title={<Title level={3}>Upload a Signature File</Title>}
          style={{
            width: '100%',
            maxWidth: '600px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
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
            {uploading ? 'Uploading...' : 'Start Upload'}
          </Button>
        </Card>
      </Content>
    </Layout>
  );
};

export default Signatures;
