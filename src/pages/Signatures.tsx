import React from 'react';
import { Layout, Typography, Upload, Button, message, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

const Signatures: React.FC = () => {
  const props = {
    name: 'file',
    multiple: false,
    action: '/api/upload',
    onChange(info: any) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
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
            maxWidth: '1000px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Upload {...props}>
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Card>
      </Content>
    </Layout>
  );
};

export default Signatures;
