import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Layout,
  Typography,
  Table,
  Button,
  Form,
  Input,
  Modal,
  Tag,
  message,
  Spin,
  Card,
  Row,
  Col,
  Empty,
  Space,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { Campus } from '../types/campus';
import { getCampus, createCampus, updateCampus, deleteCampus } from '../services/campus';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAnneeUniversitaireActive } from '../services/anneeUniversitaire';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function Campuses() {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<Campus>();
  const [currentCampus, setCurrentCampus] = useState<Campus>();
  const [isEditing, setIsEditing] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: activeAnnee } = useQuery({
    queryKey: ['activeAnnee'],
    queryFn: getAnneeUniversitaireActive,
  });


  const { data: campusesData, isLoading } = useQuery({
    queryKey: ['campuses'],
    queryFn: () => getCampus(activeAnnee?._id || ''),
    enabled: !!activeAnnee,
  });


  const { mutate: createCampusMutation } = useMutation({
    mutationFn: createCampus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
      messageApi.success('Campus ajouté avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de l\'ajout du campus');
    }
  });

  const { mutate: updateCampusMutation } = useMutation({
    mutationFn: updateCampus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
      messageApi.success('Campus mis à jour avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la mise à jour du campus');
    }
  });

  const { mutate: deleteCampusMutation } = useMutation({
    mutationFn: deleteCampus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
      messageApi.success('Campus supprimé avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la suppression du campus');
    }
  });

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a: Campus, b: Campus) => a.nom.localeCompare(b.nom),
      render: (text: string, record: Campus) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/dashboard/campusDetail/${record._id}`)}
          style={{ padding: 0, fontWeight: 500 }}
        >
          {text}
        </Button>
      )
    },
    {
      title: 'Latitude',
      dataIndex: 'latitude',
      key: 'latitude',
      sorter: (a: Campus, b: Campus) => {
        // S'assurer que la fonction retourne toujours un nombre
        const latA = a.latitude || '';
        const latB = b.latitude || '';
        return latA.localeCompare(latB);
      },
      render: (text: string) => (
        <Tag color="blue" icon={<EnvironmentOutlined />}>
          {text}
        </Tag>
      )
    },
    {
      title: 'Longitude',
      dataIndex: 'longitude',
      key: 'longitude',
      sorter: (a: Campus, b: Campus) => {
        // S'assurer que la fonction retourne toujours un nombre
        const latA = a.longitude || '';
        const latB = b.longitude || '';
        return latA.localeCompare(latB);
      },
      render: (text: string) => (
        <Tag color="blue" icon={<EnvironmentOutlined />}>
          {text}
        </Tag>
      )
    },
    {
      title: 'Adresse',
      dataIndex: 'adresse',
      key: 'adresse',
      ellipsis: true
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Campus) => (
        <Space>
          <Button
            type="primary"
            size="middle"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/dashboard/campusDetail/${record._id}`)}
            style={{ 
              background: '#1890ff20',
              color: '#1890ff',
              border: 'none',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(24, 144, 255, 0.1)',
              width: '32px',
              height: '32px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
          <Button
            type="primary"
            size="middle"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ 
              background: '#1890ff20',
              color: '#1890ff',
              border: 'none',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(24, 144, 255, 0.1)',
              width: '32px',
              height: '32px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
          <Button
            type="primary"
            danger
            size="middle"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id!)}
            style={{ 
              background: '#ff4d4f20',
              color: '#ff4d4f',
              border: 'none',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(255, 77, 79, 0.1)',
              width: '32px',
              height: '32px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        </Space>
      ),
    },
  ];

  const filteredCampuses = campusesData?.filter(
    (campus: Campus) =>
      campus.nom.toLowerCase().includes(searchText.toLowerCase()) ||
      campus.adresse!.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    form.resetFields();
  };

  const handleEdit = (campus: Campus) => {
    setCurrentCampus(campus);
    setIsEditing(true);
    form.setFieldsValue({
      nom: campus.nom,
      adresse: campus.adresse,
      latitude: campus.latitude,
      longitude: campus.longitude,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer ce campus ?',
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      cancelText: 'Non',
      onOk: () => {
        deleteCampusMutation(id);
      }
    });
  };

  const handleSubmit = () => {
    form.validateFields().then(async values => {
      try {
        if (isEditing && currentCampus?._id) {
          // Mise à jour d'un campus existant
          updateCampusMutation({ ...values, _id: currentCampus._id });
        } else if (!isEditing && !currentCampus?._id) {
          // Création d'un nouveau campus
          createCampusMutation({ ...values, anneeUniversitaireId: activeAnnee?._id });
        }
        handleCancel();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du campus', error);
        messageApi.error('Erreur lors de la sauvegarde du campus');
      }
    });
  };

  const renderSummaryCards = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={8}>
        <Card hoverable>
          <Spin spinning={isLoading}>
            <div style={{ textAlign: 'center' }}>
              <HomeOutlined style={{ fontSize: 36, color: '#1890ff' }} />
              <Title level={3}>{campusesData?.length}</Title>
              <Text>Campus disponibles</Text>
            </div>
          </Spin>
        </Card>
      </Col>
    </Row>
  );

  return (
    <Layout>
      {contextHolder}
      <Content style={{ padding: '32px' }}>
        <div className="page-header" style={{ 
          marginBottom: 32,
          background: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          color: 'white'
        }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Typography.Title level={2} style={{ color: 'white', margin: 0 }}>
                Gestion des Campus
              </Typography.Title>
              <Typography.Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                Gérez les différents campus de l'établissement
              </Typography.Text>
            </Col>
          </Row>
        </div>
        
        {renderSummaryCards()}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Input
            placeholder="Rechercher un campus..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearchChange}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Ajouter un campus
          </Button>
        </div>
        {isLoading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            padding: '48px 0',
            borderRadius: '12px',
            background: '#f5f7fa',
            boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.03)',
            minHeight: '300px',
            alignItems: 'center'
          }}>
            <Spin size="large" />
          </div>
        ) : filteredCampuses && filteredCampuses.length > 0 ? (
          <div style={{ 
            borderRadius: '12px', 
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}>
            <Table 
              columns={columns} 
              dataSource={filteredCampuses} 
              rowKey="_id"
              pagination={{
                pageSize: 10,
                position: ['bottomCenter'],
                showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} éléments`,
                style: { marginTop: '16px', padding: '8px 0' }
              }}
              rowClassName={(_record, index) => index % 2 === 0 ? 'even-row' : 'odd-row'}
            />
          </div>
        ) : (
          <Empty 
            description={
              <span style={{ fontSize: '16px', color: '#8c8c8c' }}>
                Aucun campus trouvé
              </span>
            } 
            style={{ 
              padding: '48px 0',
              background: '#f5f7fa',
              borderRadius: '12px',
              boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.03)' 
            }}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
        <Modal
          title={
            <span style={{ fontSize: '18px', fontWeight: 600 }}>
              {isEditing ? 'Modifier' : 'Ajouter'} un campus
            </span>
          }
          open={isModalOpen}
          onCancel={handleCancel}
          width={500}
          centered
          bodyStyle={{ padding: '24px' }}
          style={{ borderRadius: '12px', overflow: 'hidden' }}
          maskStyle={{ backdropFilter: 'blur(2px)', background: 'rgba(0, 0, 0, 0.45)' }}
          footer={[
            <Button 
              key="cancel" 
              onClick={handleCancel}
              style={{ borderRadius: '6px' }}
              size="large"
            >
              Annuler
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              onClick={handleSubmit}
              style={{ 
                borderRadius: '6px',
                background: isEditing ? 'linear-gradient(90deg, #13c2c2 0%, #36cfc9 100%)' : 'linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)',
                boxShadow: '0 2px 6px rgba(24, 144, 255, 0.3)',
                border: 'none'
              }}
              size="large"
            >
              {isEditing ? 'Mettre à jour' : 'Ajouter'}
            </Button>,
          ]}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={currentCampus}
          >
            <Form.Item
              label={<span style={{ fontSize: '15px' }}>Nom du campus</span>}
              name="nom"
              rules={[{ required: true, message: 'Veuillez saisir un nom de campus' }]}
            >
              <Input 
                placeholder="Nom du campus" 
                style={{ borderRadius: '6px', height: '40px' }} 
                prefix={<HomeOutlined style={{ color: '#bfbfbf', marginRight: '8px' }} />}
              />
            </Form.Item>
            <Form.Item
              label={<span style={{ fontSize: '15px' }}>Adresse</span>}
              name="adresse"
              rules={[{ required: true, message: 'Veuillez saisir une adresse' }]}
            >
              <Input 
                placeholder="Adresse" 
                style={{ borderRadius: '6px', height: '40px' }} 
                prefix={<EnvironmentOutlined style={{ color: '#bfbfbf', marginRight: '8px' }} />}
              />
            </Form.Item>  
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ fontSize: '15px' }}>Latitude</span>}
                  name="latitude"
                  rules={[{ required: true, message: 'Veuillez saisir une latitude' }]}
                >
                  <Input 
                    placeholder="Latitude" 
                    style={{ borderRadius: '6px', height: '40px' }}
                    prefix={<span style={{ color: '#bfbfbf', marginRight: '8px', fontSize: '12px' }}>Lat</span>} 
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ fontSize: '15px' }}>Longitude</span>}
                  name="longitude"
                  rules={[{ required: true, message: 'Veuillez saisir une longitude' }]}
                >
                  <Input 
                    placeholder="Longitude" 
                    style={{ borderRadius: '6px', height: '40px' }}
                    prefix={<span style={{ color: '#bfbfbf', marginRight: '8px', fontSize: '12px' }}>Long</span>} 
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </Content>
      <style>{`
        .ant-table-thead > tr > th {
          background: #f0f7ff !important;
          font-weight: 600;
          border: none;
        }
        .ant-table-tbody > tr.ant-table-row:hover > td {
          background: #f0f7ff !important;
        }
        .ant-table-tbody > tr.even-row > td {
          background-color: #ffffff;
        }
        .ant-table-tbody > tr.odd-row > td {
          background-color: #f9fafc;
        }
        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }
        .ant-form-item-label > label {
          font-weight: 500;
        }
        .ant-form-item {
          margin-bottom: 24px;
        }
        .ant-modal-content {
          border-radius: 12px;
          overflow: hidden;
        }
      `}</style>
    </Layout>
  );
}
