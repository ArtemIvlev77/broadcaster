import React, { useEffect, useState } from 'react';
import { Select, Form, Input, Layout, Menu, Modal } from 'antd';
import { UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import './UserProfile.css';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import UserStats from '../UserStats/UserStats';
import UserStreamList from '../UserStreamsList/UserStreamsList';
import UserAccount from '../UserAccount/UserAccount';
import { getAllTagsAC } from '../../redux/actionCreators/getAllTagsAC';
import { createNewStreamAC } from '../../redux/actionCreators/createNewStreamAC';
import { getLatestKeyAC } from '../../redux/actionCreators/getLatestKeyAC';
import useUxios from '../../hooks/useUxios'
import ErrorComponent from '../ErrorComponent/index';
import Loading from '../Loading/index';

const { Header, Content, Footer, Sider } = Layout;

const CollectionCreateForm = ({ visible, onCreate, onCancel, tags, error, loading }) => {
  console.log('Modal rendered');

  const [form] = Form.useForm();
  const [selectedTags, setselectedTags] = useState([]);

  function handleChange(selectedTags) {
    setselectedTags(selectedTags);
  }

  return (
    <Modal
      visible={visible}
      title="Создать новый стрим"
      okText="Сохранить"
      cancelText="Отмена"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{
          modifier: 'public',
        }}
      >
        <Form.Item
          name="title"
          label="Название"
          rules={[
            {
              required: true,
              message: 'Введите название вашего стрима',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="preview"
          label="Обложка"
          rules={[
            {
              required: true,
              message: 'Введите ссылку на изображение для обложки',
            },
          ]}
        >
          <Input type="textarea" />
        </Form.Item>
        <Form.Item
          name="tags"
          label="Категория"
          rules={[
            {
              required: true,
              message: 'Выберите минимум одну категорию',
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Выберите категории"
            value={selectedTags}
            onChange={handleChange}
            style={{ width: '100%' }}
          >
            {tags.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.tag}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <div className='errorText'>
          <ErrorComponent message={error} />
          <Loading loading={loading} />
        </div>
      </Form>
    </Modal >
  );
};

const UserProfile = () => {
  console.log('UserProfile rendered');

  const [visible, setVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState();
  const auth = useSelector((store) => store.auth);
  const tags = useSelector((store) => store.tags);
  const keys = useSelector((store) => store.keys);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const getTags = () => {
    dispatch(getAllTagsAC());
  }
  const getLatestKey = () => {
    dispatch(getLatestKeyAC(auth.id));
  }


  const { error, loading, uxios } = useUxios();
  const onCreate = (values) => {
    dispatch(createNewStreamAC({
      user_id: auth.id,
      title: values.title,
      preview: values.preview,
      tags: values.tags,
      service: { error, loading, uxios }
    }))
    setVisible(false);
  };

  useEffect(() => {
    if (!auth.ok) {
      navigate('/login');
    }
    getTags();
    getLatestKey();
  }, [auth, keys, navigate]);

  const componentsSwitch = (key) => {
    switch (key) {
      case '1':
        return (
          <UserStreamList />
        );
      case '2':
        return (
          <UserAccount />
        );
      case '3':
        return (
          <UserStats />
        );
      default:
        break;
    }
  };

  return (
    <div className='container'>
      <Layout>
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
        >
          <HelloUserName className="logo" >
            <span>Привет, Username!</span>
          </HelloUserName>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectedMenuItem}
            onClick={(e) =>
              setSelectedMenuItem(e.key)}
          >
            <Menu.Item
              key="1"
              icon={<VideoCameraOutlined />}
            >
              <span>Стримы</span>
            </Menu.Item>
            <Menu.Item
              key="2"
              icon={<UserOutlined />}
            >
              <span>Аккаунт</span>
            </Menu.Item>
            <Menu.Item
              key="3"
              icon={<UploadOutlined />}
            >
              <span>Статистика</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header className="site-layout-sub-header-background" style={{ padding: 0 }} />
          <Content style={{ margin: '24px 16px 0' }}>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
              <DivContainer>
                <StartStreamButton
                  type="button"
                  onClick={() => {
                    setVisible(true);
                  }}
                >
                  Начать новый стрим
                </StartStreamButton>
                <p style={{ color: 'white' }}>Последний stream key: {keys}</p>
                <div>
                  <CollectionCreateForm
                    visible={visible}
                    okText="Сохранить"
                    cancelText="Отмена"
                    onCreate={onCreate}
                    onCancel={() => {
                      setVisible(false);
                    }}
                    tags={tags}
                    user_id={auth.id}
                    error={error}
                    loading={loading}
                  />
                </div>

              </DivContainer>
              {!selectedMenuItem && <UserStreamList />}
              {componentsSwitch(selectedMenuItem)}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Veschatel ©2022</Footer>
        </Layout>
      </Layout>
    </div>
  );
}

export default UserProfile;

const HelloUserName = styled.div`
  display: flex;
  flex-direction: column;
  justify-items: center;
  justify-content: center;
  align-items: center;
  color: white;
`
const StartStreamButton = styled.button`
    font-family: 'Robert Sans Medium', Arial, sans-serif;
    color: #fff;
    margin-bottom: 30px;
    width: 200px;
    height: 40px;
    background-color: #ee4540;
    border-radius: 20px;
    border: none;
    transition: scale .4s ease;
    &hover: {
      transform:scale(1.1)
    }
`
const DivContainer = styled.div`
&:hover ${StartStreamButton} {
    transform: scale(1.1);
  }
`
// const GenerateStreamKeyButton = styled.button`
//     font-family: 'Robert Sans Medium', Arial, sans-serif;
//     color: #fff;
//     margin-right: 30px;
//     // margin-bottom: 30px;
//     width: 250px;
//     height: 40px;
//     background-color: #ee4540;
//     border-radius: 20px;
//     border: none;
//     transition: scale .4s ease;
//     &hover: {
//       transform:scale(1.1)
//     }
// `
