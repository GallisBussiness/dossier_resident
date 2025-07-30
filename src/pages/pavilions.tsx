import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Layout,
  Typography,
  Button,
  Table,
  Space,
  Input,
  Modal,
  Form,
  message,
  Spin,
  Card,
  Row,
  Col,
  Select,
  Empty
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BuildOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { Pavillon } from '../types/pavillon';
import { getPavillons, createPavillon, updatePavillon, deletePavillon } from '../services/pavillon';
import { getCampus } from '../services/campus';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Campus } from '../types/campus';
import { getAnneeUniversitaireActive } from '../services/anneeUniversitaire';
const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function Pavilions() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [currentPavillon, setCurrentPavillon] = useState<Pavillon>();
  const [isEditing, setIsEditing] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const queryClient = useQueryClient();

  const { data: activeAnnee } = useQuery({
    queryKey: ['activeAnnee'],
    queryFn: getAnneeUniversitaireActive,
  });

  const { data: campusesData, isLoading } = useQuery({
    queryKey: ['campuses'],
    queryFn: () => getCampus(activeAnnee?._id || ''),
    enabled: !!activeAnnee,
  });

  const { data: pavilionsData } = useQuery({
    queryKey: ['pavilions'],
    queryFn: () => getPavillons(activeAnnee?._id || ''),
    enabled: !!activeAnnee,
  });

  const { mutate: createPavillonMutation } = useMutation({
    mutationFn: createPavillon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pavilions'] });
      messageApi.success('Pavillon ajouté avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de l\'ajout du pavillon');
    }
  });

  const { mutate: updatePavillonMutation } = useMutation({
    mutationFn: updatePavillon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pavilions'] });
      messageApi.success('Pavillon mis à jour avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la mise à jour du pavillon');
    }
  });

  const { mutate: deletePavillonMutation } = useMutation({
    mutationFn: deletePavillon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pavilions'] });
      messageApi.success('Pavillon supprimé avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la suppression du pavillon');
    }
  });

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a: Pavillon, b: Pavillon) => a.nom.localeCompare(b.nom),
      render: (text: string, record: Pavillon) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/dashboard/pavillonDetail/${record._id}`)}
          style={{ padding: 0, fontWeight: 500 }}
        >
          <Space>
            <BuildOutlined />
            {text}
          </Space>
        </Button>
      )
    },
    {
      title: 'Campus',
      dataIndex: 'campusId',
      key: 'campusId',
      render: (record: Campus) => (
        <Text style={{ fontWeight: 500 }}>{record.nom}</Text>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Pavillon) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/dashboard/pavillonDetail/${record._id}`)}
            className="modern-button"
            style={{
              background: '#1890ff20',
              color: '#1890ff',
              border: 'none',
              marginRight: 8
            }}
          >
            Voir
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            className="modern-button"
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)',
              border: 'none'
            }}
          >
            Modifier
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record._id || '')}
          >
            Supprimer
          </Button>
        </Space>
      ),
    },
  ];

  const filteredPavilions = pavilionsData?.filter(
    pavillon =>
      pavillon.nom.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentPavillon(undefined);
    form.resetFields();
  };

  const handleEdit = (pavillon: Pavillon) => {
    setCurrentPavillon(pavillon);
    setIsEditing(true);
    form.setFieldsValue({
      nom: pavillon.nom,
      campusId: pavillon.campusId._id,
      description: pavillon.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer ce pavillon ?',
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      cancelText: 'Non',
      onOk: async () => {
        try {
          deletePavillonMutation(id);
        } catch (error) {
          console.error('Erreur lors de la suppression du pavillon', error);
          messageApi.error('Erreur lors de la suppression du pavillon');
        }
      }
    });
  };

  const onFinish = () => {
    form.validateFields().then(values => {   
      if (isEditing && currentPavillon) {
        // Mise à jour d'un pavillon existant
        updatePavillonMutation({ ...values, _id: currentPavillon._id });
      } else {
        // Création d'un nouveau pavillon
        createPavillonMutation({ ...values,anneeUniversitaireId: activeAnnee?._id });
      }
      handleCancel();
    });
  };

  // Calcul du nombre total de places dans les pavillons

  const renderSummaryCards = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={8} lg={8} xl={8}>
        <Card className="summary-card">
          <Space direction="horizontal" size={16} align="center">
            <div className="summary-icon" style={{ color: '#1890ff', background: 'rgba(24, 144, 255, 0.1)' }}>
              <BuildOutlined />
            </div>
            <div>
              <Text type="secondary">Total des pavillons</Text>
              <div>
                <Title level={3} style={{ margin: 0 }}>{pavilionsData?.length}</Title>
              </div>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  return (
    <Layout>
      {contextHolder}
      <style>{`
        .ant-table-thead > tr > th {
          background: #f0f7ff !important;
          font-weight: 600;
          color: #1f3c88;
        }
        .even-row {
          background-color: #ffffff;
        }
        .odd-row {
          background-color: #f9fcff;
        }
        .ant-table-row:hover td {
          background-color: #e6f7ff !important;
        }
        .ant-modal-content {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
        .ant-modal-header {
          padding: 20px 24px;
          background: linear-gradient(135deg, #1890ff 0%, #52c41a 100%);
          border-bottom: none;
        }
        .ant-modal-title {
          color: white;
          font-weight: 600;
        }
        .ant-modal-close-x {
          color: white;
        }
        .ant-form-item-label > label {
          font-weight: 500;
        }
        .ant-input, .ant-input-number-input, .ant-select-selector {
          border-radius: 6px;
          height: 38px;
        }
        .ant-form-item-control-input-content .ant-btn {
          height: 38px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modern-button {
          border-radius: 8px;
          height: 40px;
          display: flex;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.3s;
        }
        .modern-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .search-input {
          border-radius: 8px;
          height: 40px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }
        .summary-card {
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        }
        .summary-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .summary-icon {
          font-size: 24px;
          padding: 12px;
          border-radius: 12px;
          background: rgba(24, 144, 255, 0.1);
        }
        .ant-pagination-item {
          border-radius: 6px;
        }
        .ant-pagination-item-active {
          background: #1890ff;
          border-color: #1890ff;
        }
        .ant-pagination-item-active a {
          color: white;
        }
      `}
      </style>
      <Content style={{ padding: '32px'}}>
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
                Gestion des Pavillons
              </Typography.Title>
              <Typography.Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                Gérez les pavillons des différents campus
              </Typography.Text>
            </Col>
          </Row>
        </div>

        {renderSummaryCards()}

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Input
              placeholder="Rechercher un pavillon..."
              value={searchText}
              onChange={handleSearchChange}
              className="search-input"
              style={{ width: 250 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
            >
              Ajouter un pavillon
            </Button>
          </div>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : filteredPavilions && filteredPavilions.length > 0 ? (
            <div style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)' }}>
              <Table
                dataSource={filteredPavilions}
                columns={columns}
                rowKey="_id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50'],
                  showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} éléments`,
                  style: { marginTop: '16px', padding: '8px 0' }
                }}
                rowClassName={(_record, index) => index % 2 === 0 ? 'even-row' : 'odd-row'}
              />
            </div>
          ) : (
            <Empty
              description={
                searchText ? 'Aucun pavillon ne correspond à votre recherche' : 'Aucun pavillon disponible'
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ margin: '40px 0' }}
            />
          )}
        </div>

        <Modal
          title={isEditing ? 'Modifier un pavillon' : 'Ajouter un nouveau pavillon'}
          open={isModalOpen}
          onCancel={handleCancel}
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
              onClick={onFinish}
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
          centered
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            name="pavillon_form"
            initialValues={{ capacite: 0 }}
            onFinish={onFinish}
          >
            <Form.Item
              label="Nom du pavillon"
              name="nom"
              rules={[{ required: true, message: 'Veuillez saisir un nom' }]}
            >
              <Input placeholder="Nom du pavillon" />
            </Form.Item>

            <Form.Item
              label="Campus"
              name="campusId"
              rules={[{ required: true, message: 'Veuillez sélectionner un campus' }]}
            >
              <Select placeholder="Sélectionnez un campus">
                {campusesData?.map(campus => (
                  <Option key={campus._id} value={campus._id}>
                    {campus.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Description"
              name="description"
            >
              <TextArea rows={4} placeholder="Description du pavillon" />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}
