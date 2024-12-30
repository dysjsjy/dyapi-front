import { history, useModel } from '@umijs/max';
import {
  Button,
  Descriptions,
  message,
  Modal,
  Spin,
  Tooltip,
  Tour,
  TourProps,
  Upload,
  UploadFile,
  UploadProps,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { RcFile } from 'antd/es/upload';
import { EditOutlined, PlusOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import {
  getLoginUserUsingGET,
  updateUserUsingPOST,
  updateVoucherUsingPOST,
  userBindEmailUsingPOST,
  userUnBindEmailUsingPOST,
} from '@/services/qiApi-backend/userController';
import Settings from '../../../../config/defaultSettings';
import Paragraph from 'antd/lib/typography/Paragraph';
import ProCard from '@ant-design/pro-card';
import { requestConfig } from '@/requestConfig';
import { doDailyCheckInUsingPOST } from '@/services/qiApi-backend/dailyCheckInController';
import SendGiftModal from '@/components/Gift/SendGift';
import EmailModal from '@/components/EmailModal';

export const valueLength = (val: any) => {
  return val && val.trim().length > 0;
};

const UserInfo: React.FC = () => {
  const unloadFileTypeList = [
    'image/jpeg',
    'image/jpg',
    'image/svg',
    'image/png',
    'image/webp',
    'image/jfif',
  ];
  const { initialState, setInitialState } = useModel('@@initialState');
  const { loginUser } = initialState || {};
  const [previewOpen, setPreviewOpen] = useState(false);
  const [voucherLoading, setVoucherLoading] = useState<boolean>(false);
  const [dailyCheckInLoading, setDailyCheckInLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const handleCancel = () => setPreviewOpen(false);
  const [userName, setUserName] = useState<string | undefined>('');
  const [open, setOpen] = useState(false);
  const [openEmailModal, setOpenEmailModal] = useState(false);

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);

  const [openTour, setOpenTour] = useState<boolean>(false);

  const steps: TourProps['steps'] = [
    {
      title: '个人信息设置',
      description: (
        <span>
          这里是你的账号信息，您可以便捷的查看您的基本信息。
          <br />
          您还可以修改和更新昵称和头像。
          <br />
          邮箱主要用于接收<strong>支付订单信息</strong>，不绑定无法接收哦，快去绑定吧！！🥰
        </span>
      ),
      target: () => ref1.current,
    },
    {
      title: '我的钱包',
      description: (
        <span>
          这里是您的钱包，坤币用于平台接口的调用费用。
          <br />
          除了充值坤币外，您还可以每日签到或者邀请好友注册来获得坤币
        </span>
      ),
      target: () => ref2.current,
    },
    {
      title: '接口调用凭证',
      description: '这里是您调用接口的凭证，没有凭证将无法调用接口',
      target: () => ref3.current,
    },
    {
      title: '开发者SDK',
      description: '您可以使用开发者SDK，快速高效的接入接口到您的项目中',
      target: () => ref4.current,
    },
  ];

  const loadData = async () => {
    setLoading(true);
    const res = await getLoginUserUsingGET();
    if (res.data && res.code === 0) {
      if (initialState?.settings.navTheme === 'light') {
        setInitialState({ loginUser: res.data, settings: { ...Settings, navTheme: 'light' } });
      } else {
        setInitialState({ loginUser: res.data, settings: { ...Settings, navTheme: 'realDark' } });
      }
      const updatedFileList = [...fileList];
      if (loginUser && loginUser.userAvatar) {
        updatedFileList[0] = {
          // @ts-ignore
          uid: loginUser?.userAccount,
          // @ts-ignore
          name: loginUser?.userAvatar?.substring(loginUser?.userAvatar!.lastIndexOf('-') + 1),
          status: 'done',
          percent: 100,
          url: loginUser?.userAvatar,
        };
        setFileList(updatedFileList);
      }
      setUserName(loginUser?.userName);
      setLoading(false);
    }
    // PC端显示指引
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
    if (isMobile) {
      setOpenTour(false);
    } else {
      const tour = localStorage.getItem('tour');
      if (!tour) {
        setOpenTour(true);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('-') + 1));
  };

  const uploadButton = () => {
    return (
      <div>
        <PlusOutlined/>
        <div style={{marginTop: 8}}>Upload</div>
      </div>
    );
  }

  const beforeUpload = async (file: RcFile) => {
    const fileType = unloadFileTypeList.includes(file.type)
    if (!fileType) {
      message.error('图片类型有误,请上传jpg/png/svg/jpeg/webp格式!');
    }
    const isLt2M = file.size / 1024 / 1024 < 1;
    if (!isLt2M) {
      message.error('文件大小不能超过 1M !');
    }
    if (!isLt2M && !fileType) {
      const updatedFileList = [...fileList];
      updatedFileList[0] = {
        // @ts-ignore
        uid: loginUser?.userAccount,
        // @ts-ignore
        name:  "error",
        status: "error",
        percent: 100
      }
      setFileList(updatedFileList);
      return false
    }
    return fileType && isLt2M;
  };

  const updateVoucher = async () => {
    setVoucherLoading(true)
    const res = await updateVoucherUsingPOST();
    if (res.data && res.code === 0) {
      setInitialState({loginUser: res.data, settings: Settings})
      setTimeout(() => {
        message.success(`凭证更新成功`);
        setVoucherLoading(false)
      }, 800);
    }
  }
};
