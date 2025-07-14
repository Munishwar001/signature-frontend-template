import {Form,message, Tag, Spin } from "antd";
import MainAreaLayout from "../components/main-layout/main-layout";
import { useEffect, useState ,useRef} from "react";
import { useParams } from 'react-router';
import { requestClient } from "../store";
import CustomTable from "../components/CustomTable";
import { useAppStore } from "../store";
export default function RejectedPage() {
  const [form] = Form.useForm();
  const [dynamicColumns, setDynamicColumns] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const getSession = useAppStore().init; 
  // const session = useAppStore().session?.userId;
  const userRole = useAppStore().session?.role;
  const templateVariablesRef = useRef([]);
  const  templateTitleRef = useRef('');

  const { id } = useParams();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await requestClient.fetchRejectedData(id);

      if (!response.allfields || response.allfields.length === 0) {
        message.warning('Template has no defined fields');
        setDynamicColumns([]);
        setTableData([]);
        return;
      }
      templateVariablesRef.current = response.templateVariables || [];
      templateTitleRef.current = response.templateName;
      const fieldColumns = response.allfields.map((field: string) => ({
        title: field,
        dataIndex: field,
        key: field,
      }));
       console.log(fieldColumns);
      const completeColumns = [
        ...fieldColumns,
        {
          title: "Rejected Reason",
          dataIndex: "rejectedReason",
          key: "rejectedReason",
          render: (_: any, record: any) => (
            <span>{record.rejectionReason || "—"}</span>
          ),
        },
      ];

      setDynamicColumns(completeColumns);

      const transformedData = response.data.map((item: any, index: number) => {
        const rowData: any = {
          key: index,
          id: item.id,
          signStatus: item.signStatus,
          rejectionReason: item.rejectionReason || "No reason provided", 
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
      title= {templateTitleRef.current}>
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
          columns={
            dynamicColumns.length > 0
              ? dynamicColumns
              : [
                  {
                    title: "No Data Available",
                    dataIndex: "noData",
                    key: "noData",
                    render: () => "Upload data or check template fields",
                  },
                ]
          }
          data={tableData}
        />
      )}

    </MainAreaLayout>
  );
}