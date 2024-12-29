import { Badge, Button, Card, Descriptions, Form, message, Spin, Table, Tabs, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { getInterfaceInfoByIdUsingGET } from '@/services/qiApi-backend/interfaceInfoController';

import CodeHighlighting from '@/components/CodeHighlighting';
import { InterfaceRequestMethodEnum, statusEnum } from '@/enum/commonEnum';
import {
  BugOutlined,
  CodeOutlined,
  FileExclamationOutlined,
  FileTextOutlined,
  LoginOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { Column } from 'rc-table';
import './index.less';
import ProCard from '@ant-design/pro-card';
import { errorCode } from '@/enum/ErrorCodeEnum';
import { history, Link, useModel, useParams } from '@@/exports';
import {
  axiosExample,
  convertResponseParams,
  javaExample,
  returnExample,
} from '@/pages/InterfaceInfo/components/CodeTemplate';
import { valueLength } from '@/pages/User/UserInfo';
import Paragraph from 'antd/lib/typography/Paragraph';
import ApiTab from '@/pages/InterfaceInfo/components/ApiTab';
import ToolsTab from '@/pages/InterfaceInfo/components/ToolsTab';
import { stringify } from 'querystring';
import {
  sendRequestToGatewayUsingGet,
  sendRequestToGatewayUsingPost,
} from '@/services/api/sendToGateway';
import { currentUser } from '@/services/ant-design-pro/api';

const InterfaceInfo: React.FC = () => {
  const { search, pathname } = window.location;
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setDate] = useState<API.InterfaceInfo>();
  const [requestParams, setRequestParams] = useState<[]>();
  const [temporaryParams, setTemporaryParams] = useState<any>();
  const [responseParams, setResponseParams] = useState<[]>();
  const [requestExampleActiveTabKey, setRequestExampleActiveTabKey] = useState<string>('javadoc');
  const [activeTabKey, setActiveTabKey] = useState<
    'tools' | 'api' | 'errorCode' | 'sampleCode' | string
  >('api');
  const [result, setResult] = useState<string>();
  const [resultLoading, setResultLoading] = useState<boolean>(false);
  const params = useParams();
  const [form] = Form.useForm();
  const [axiosCode, setAxiosCode] = useState<any>();
  const [totalNum, settotalNum] = useState<number>(0);
  const [javaCode, setJavaCode] = useState<any>();
  const [returnCode, setReturnCode] = useState<any>(returnExample);
  const docUrl =
    process.env.NODE_ENV === 'production' ? 'https://doc.wangkeyao.com' : 'http://localhost:8080';
  const { initialState } = useModel('@@initialState');
  const { loginUser } = initialState || {};

  const loadedData = async () => {
    if (!params.id) {
      message.error('参数不存在');
      return;
    }
    setLoading(true);
    try {
      // @ts-ignore
      const res = await getInterfaceInfoByIdUsingGET({ id: params.id });
      if (res.data && res.code === 0) {
        setDate(res.data || {});
        settotalNum(res.data.totalNum || 0);
        let requestParams = res.data.requestParams;
        let responseParams = res.data.responseParams;
        try {
          setRequestParams(requestParams ? JSON.parse(requestParams) : []);
          setResponseParams(responseParams ? JSON.parse(responseParams) : []);
        } catch (e: any) {
          setRequestParams([]);
          setResponseParams([]);
        }
        const response = res.data.responseParams
          ? JSON.parse(res.data.responseParams)
          : ([] as API.RequestParamsField);
        const convertedParams = convertResponseParams(response);
        setAxiosCode(axiosExample(res.data?.uri, res.data?.method?.toLowerCase()));
        setJavaCode(
          javaExample(
            `${res.data?.protocol}://${res.data?.host}${res.data?.uri}`,
            res.data?.method?.toUpperCase(),
          ),
        );
        setReturnCode(convertedParams);
      }
      setLoading(false);
    } catch (e: any) {
      message.error(e.message);
    }
  };

  useEffect(() => {
    loadedData();
  }, []);

  const requestExampleTabChange = (key: string) => {
    setRequestExampleActiveTabKey(key);
  };

  const responseExampleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  const responseExampleTabList = [
    {
      key: 'api',
      label: (
        <>
          <FileTextOutlined />
          API文档
        </>
      ),
    },
    {
      key: 'tools',
      label: (
        <>
          <BugOutlined />
          在线调试工具
        </>
      ),
    },
    {
      key: 'errorCode',
      label: (
        <>
          <FileExclamationOutlined />
          错误码参照
        </>
      ),
    },
    {
      key: 'sampleCode',
      label: (
        <>
          <CodeOutlined />
          示例代码
        </>
      ),
    },
  ];

  function mapParamsToObject(paramsArray: any[] | undefined) {
    if (undefined === paramsArray) return paramsArray;
    return paramsArray.reduce((accumulator, current) => {
      accumulator[current.fieldName] = current.value;
      return accumulator;
    }, {});
  }

  const onSearch = async (values: any) => {
    if (!loginUser) {
      history.replace({
        pathname: '/user/login',
        search: stringify({
          redirect: pathname + search,
        }),
      });
    }

    if (data?.method === 'GET') {
      setResultLoading(true);
      const res = await sendRequestToGatewayUsingGet({
        interfaceInfo: data,
        userInfo: initialState?.loginUser,
        params: mapParamsToObject(temporaryParams),
      });
      if (res.code === 0) {
        settotalNum(Number(totalNum) + 1);
      }
      setResult(JSON.stringify(res, null, 4));
      setResultLoading(false);
    } else if (data?.method === 'POST') {
      const res = await sendRequestToGatewayUsingPost({
        interfaceInfo: data,
        userInfo: initialState?.loginUser,
        params: mapParamsToObject(temporaryParams),
        ...values,
      });
      if (res.code === 0) {
        settotalNum(Number(totalNum) + 1);
      }
      setResult(JSON.stringify(res, null, 4));
      setResultLoading(false);
    }
  };

  const responseExampleContentList: Record<string, React.ReactNode> = {
    api: (
      <ApiTab
        sampleCode={() => setActiveTabKey('sampleCode')}
        errorCodeTab={() => setActiveTabKey('errorCode')}
        requestParams={requestParams}
        responseParams={responseParams}
        returnCode={returnCode}
      />
    ),
    tools: (
      <ToolsTab
        form={form}
        data={data}
        temporaryParams={temporaryParams}
        onSearch={onSearch}
        requestExampleActiveTabKey={requestExampleActiveTabKey}
        paramsTableChange={(e: any) => {
          setTemporaryParams(e);
        }}
        result={result}
        resultLoading={resultLoading}
      />
    ),
    errorCode: (
      <>
        <p className="highlightLine">错误码：</p>
        <Table dataSource={errorCode} pagination={false} style={{ maxWidth: 800 }} size={'small'}>
          <Column title="参数名称" dataIndex="name" key="name" />
          <Column title="错误码" dataIndex="code" key="code" />
          <Column title="描述" dataIndex="des" key="des" />
        </Table>
      </>
    ),
    sampleCode: (
      <>
        <Tabs
          defaultActiveKey="javadoc"
          centered
          onChange={requestExampleTabChange}
          items={[
            {
              key: 'javadoc',
              label: 'java',
              children: <CodeHighlighting codeString={javaCode} language={'java'} />,
            },
            {
              key: 'javascript',
              label: 'axios',
              children: <CodeHighlighting codeString={axiosCode} language={requestExampleActiveTabKey} />,
            },
          ]}
        />
      </>
    ),
  };

  return (
    <>
    </>
  )
};
