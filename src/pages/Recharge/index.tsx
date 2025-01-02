import React, { useEffect, useState } from 'react';
import { Button, Card, message, Spin, Tooltip } from 'antd';
// import ProCard, {CheckCard} from "@ant-design/pro-card";
import { CheckCard } from '@ant-design/pro-components';
import { ProCard } from '@ant-design/pro-components';
import KunCoin from '@/components/Icon/KunCoin';
import { history, useModel } from '@umijs/max';
import { listProductInfoByPageUsingGET } from '@/services/qiApi-backend/productInfoController';
import wechat from '../../../public/assets/WeChat.jpg';
import { getLoginUserUsingGET } from '@/services/qiApi-backend/userController';
import Settings from '../../../config/defaultSettings';

const PayOrder: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [product, setProduct] = useState<API.ProductInfo[]>();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { loginUser } = initialState || {};
  const [total, setTotal] = useState<any>('0.00');
  const [productId, setProductId] = useState<any>('');

  useEffect(() => {
    if (total === '0.00') {
      setProductId('');
    }
  }, [total]);

  const loadData = async () => {
    const userdata = await getLoginUserUsingGET();
    if (userdata.data && userdata.code === 0) {
      if (initialState?.settings.navTheme === 'light') {
        setInitialState({ loginUser: userdata.data, settings: { ...Settings, navTheme: 'light' } });
      } else {
        setInitialState({
          loginUser: userdata.data,
          settings: { ...Settings, navTheme: 'realDark' },
        });
      }
    }
    setLoading(true);
    const res = await listProductInfoByPageUsingGET({});
    if (res.data && res.code === 0) {
      setProduct(res.data.records || []);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <Spin spinning={loading}>
        <Card style={{ minWidth: 360 }}>
          <ProCard
            type={'inner'}
            headerBordered
            bordered
            tooltip={'用于平台接口调用'}
            title={<strong>我的钱包</strong>}
          >
            <strong>金币：</strong>
            <span style={{ color: 'red', fontSize: 18 }}>{loginUser?.balance}</span>
          </ProCard>
          <br/>
          <Card
            type={"inner"}
            title={<strong>积分商城</strong>}
          >
            <ProCard wrap>
              <CheckCard.Group
                onChange={(checkedValue) => {
                  if (!checkedValue) {
                    setTotal("0.00")
                    return
                  }
                  setTotal(checkedValue)
                }}
              >

              //todo 01021727
              </CheckCard.Group>
            </ProCard>
          </Card>
        </Card>
      </Spin>
    </>
  );
};
