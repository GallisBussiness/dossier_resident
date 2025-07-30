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
  Card,
  Row,
  Col,
  Select,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  SearchOutlined,
  KeyOutlined,
  BankOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { Chambre } from '../types/chambre';
import { useQuery } from '@tanstack/react-query';
import { getChambres } from '../services/chambre';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChambre, updateChambre, deleteChambre } from '../services/chambre';
import type { Pavillon } from '../types/pavillon';
import { getPavillons } from '../services/pavillon';
import { getAnneeUniversitaireActive } from '../services/anneeUniversitaire';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;


export default function Chambres() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<Chambre>();
  const [currentChambre, setCurrentChambre] = useState<Chambre>();
  const [isEditing, setIsEditing] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const queryClient = useQueryClient();

  const { data: activeAnnee } = useQuery({
    queryKey: ['activeAnnee'],
    queryFn: getAnneeUniversitaireActive,
  });


  const { data: chambresData } = useQuery({
    queryKey: ['chambres'],
    queryFn: () => getChambres(activeAnnee?._id || ''),
    enabled: !!activeAnnee,
  });


  const { data: pavilionsData } = useQuery({
    queryKey: ['pavilions'],
    queryFn: () => getPavillons(activeAnnee?._id || ''),
    enabled: !!activeAnnee,
  });

  const { mutate: createChambreMutation } = useMutation({
    mutationFn: createChambre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chambres'] });
      messageApi.success('Chambre ajoutée avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de l\'ajout de la chambre');
    }
  });

  const { mutate: updateChambreMutation } = useMutation({
    mutationFn: updateChambre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chambres'] });
      messageApi.success('Chambre mise à jour avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la mise à jour de la chambre');
    }
  });

  const { mutate: deleteChambreMutation } = useMutation({
    mutationFn: deleteChambre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chambres'] });
      messageApi.success('Chambre supprimée avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la suppression de la chambre');
    }
  });


  // Définition des colonnes du tableau
  const columns = [
    {
      title: 'Numéro',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a: Chambre, b: Chambre) => a.nom.localeCompare(b.nom),
      render: (text: string, record: Chambre) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/dashboard/chambreDetail/${record._id}`)}
          style={{ padding: 0, fontWeight: 500 }}
        >
          <Space>
            <KeyOutlined style={{ color: '#1890ff' }} />
            {text}
          </Space>
        </Button>
      )
    },
    {
      title: 'Pavillon',
      dataIndex: 'pavillonId',
      key: 'pavillonId',
      render: (record: string | {_id: string; nom: string}) => {
        // Si record est une chaîne, c'est l'ID du pavillon sans les données complètes
        const displayName = typeof record === 'string' ? record : record.nom;
        return (
          <Space>
            <BankOutlined />
            <Text>{displayName}</Text>
          </Space>
        );
      },
      sorter: (a: Chambre, b: Chambre) => {
        const nomA = typeof a.pavillonId === 'string' ? '' : a.pavillonId.nom;
        const nomB = typeof b.pavillonId === 'string' ? '' : b.pavillonId.nom;
        return nomA.localeCompare(nomB);
      }
    },
    {
      title: 'Places',
      dataIndex: 'places',
      key: 'places',
      sorter: (a: Chambre, b: Chambre) => a.places - b.places,
      render: (text: number) => <Text>{text}</Text>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Chambre) => (
        <Space size="middle">
          <Tooltip title="Voir détails">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/dashboard/chambreDetail/${record._id}`)}
              style={{
                background: '#1890ff20',
                color: '#1890ff',
                border: 'none',
                borderRadius: '6px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          </Tooltip>
          <Tooltip title="Modifier">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              style={{
                background: '#1890ff20',
                color: '#1890ff',
                border: 'none',
                borderRadius: '6px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record._id || '')}
              style={{
                background: '#ff4d4f20',
                color: '#ff4d4f',
                border: 'none',
                borderRadius: '6px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredChambres = chambresData?.filter(
    chambre => {
      const pavilionNom = typeof chambre.pavillonId === 'string' 
        ? '' // Si c'est juste l'ID, on ne peut pas chercher par le nom du pavillon
        : chambre.pavillonId.nom.toLowerCase();
      
      return chambre.nom.toLowerCase().includes(searchText.toLowerCase()) ||
        pavilionNom.includes(searchText.toLowerCase());
    }
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentChambre(undefined);
    form.resetFields();
  };

  const handleEdit = (chambre: Chambre) => {
    setCurrentChambre(chambre);
    setIsEditing(true);
    form.setFieldsValue({
      nom: chambre.nom,
      pavillonId: typeof chambre.pavillonId === 'string' ? chambre.pavillonId : chambre.pavillonId._id,
      places: chambre.places,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (chambreId: string) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cette chambre ?',
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      cancelText: 'Non',
      onOk: async () => {
        try {
          deleteChambreMutation(chambreId);
        } catch  {
          messageApi.error('Erreur lors de la suppression de la chambre');
        }
      }
    });
  };

  const onFinish = () => {
    form.validateFields().then((values) => {   
      if (isEditing && currentChambre) {
        updateChambreMutation({ ...values, _id: currentChambre._id,places: +values.places});
      } else {
        createChambreMutation({ ...values,anneeUniversitaireId: activeAnnee?._id,places: +values.places});
      }
      handleCancel();
    });
  };

  const renderSummaryCards = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={8} lg={8} xl={8}>
        <Card className="summary-card" hoverable>
          <Space direction="horizontal" size={16} align="center">
            <div className="summary-icon" style={{ color: '#1890ff', background: 'rgba(24, 144, 255, 0.1)' }}>
              <HomeOutlined />
            </div>
            <div>
              <Text type="secondary">Total des chambres</Text>
              <div>
                <Title level={3} style={{ margin: 0 }}>{chambresData?.length}</Title>
              </div>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  // const renderOccupationRate = () => (
  //   <Card title="Taux d'occupation" style={{ marginBottom: 24 }}>
  //     <div style={{ textAlign: 'center', padding: '16px 0' }}>
  //       <Progress
  //         type="circle"
  //         percent={tauxOccupation}
  //         format={percent => `${percent}%`}
  //         status={tauxOccupation > 80 ? 'exception' : tauxOccupation > 60 ? 'normal' : 'success'}
  //         width={120}
  //       />
  //       <div style={{ marginTop: 16 }}>
  //         <Text type="secondary">Taux d'occupation actuel</Text>
  //       </div>
  //     </div>
  //   </Card>
  // );

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
      `}</style>
      <Content style={{ padding: '32px' }}>
        {/* En-tête de la page */}
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
                Gestion des Chambres
              </Typography.Title>
              <Typography.Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                Gérez les chambres des différents pavillons
              </Typography.Text>
            </Col>
          </Row>
        </div>

        {/* Cartes de résumé */}
        {renderSummaryCards()}

        {/* Barre de recherche et bouton d'ajout */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Input
            className="search-input"
            placeholder="Rechercher une chambre..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearchChange}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            className="modern-button"
            style={{
              background: 'linear-gradient(90deg, #1890ff 0%, #52c41a 100%)',
              border: 'none',
              boxShadow: '0 2px 8px rgba(24, 144, 255, 0.35)'
            }}
          >
            Ajouter une chambre
          </Button>
        </div>

        {/* Tableau des chambres */}
        <div style={{ 
          borderRadius: '12px', 
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
        }}>
          <Table 
            columns={columns} 
            dataSource={filteredChambres} 
            rowKey="_id"
            pagination={{
              pageSize: 10,
              position: ['bottomCenter'],
              showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} éléments`,
              style: { marginTop: '16px', padding: '8px 0' }
            }}
            loading={false}
            rowClassName={(_record, index) => index % 2 === 0 ? 'even-row' : 'odd-row'}
          />
        </div>

        {/* Modal pour ajouter/modifier une chambre */}
        <Modal
          title={<span style={{ color: 'white' }}>{isEditing ? 'Modifier' : 'Ajouter'} une chambre</span>}
          open={isModalOpen}
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel} size="large" style={{ borderRadius: '6px' }}>
              Annuler
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              onClick={onFinish}
              size="large"
              style={{ 
                borderRadius: '6px',
                background: isEditing ? 'linear-gradient(90deg, #13c2c2 0%, #36cfc9 100%)' : 'linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)',
                boxShadow: '0 2px 6px rgba(24, 144, 255, 0.3)',
                border: 'none'
              }}
            >
              {isEditing ? 'Mettre à jour' : 'Ajouter'}
            </Button>,
          ]}
          width={600}
          centered
        >
          <Form
            form={form}
            layout="vertical"
          >
                <Form.Item
                  name="nom"
                  label="Numéro"
                  rules={[{ required: true, message: 'Veuillez saisir le numéro de la chambre' }]}
                >
                  <Input placeholder="A101" prefix={<KeyOutlined />} />
                </Form.Item>
                <Form.Item
                  name="pavillonId"
                  label="Pavillon"
                  rules={[{ required: true, message: 'Veuillez sélectionner un pavillon' }]}
                >
                  <Select placeholder="Sélectionner un pavillon">
                    {pavilionsData?.map((pavillon: Pavillon) => (
                      <Option key={pavillon._id} value={pavillon._id}>{pavillon.nom}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="places"
                  label="Places"
                  rules={[{ required: true, message: 'Veuillez saisir le nombre de places' }]}
                >
                  <Input type="number" placeholder="5" />
                </Form.Item>
              </Form>
        </Modal>
      </Content>
    </Layout>
  );
}