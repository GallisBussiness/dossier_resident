import { useState } from 'react';
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
  Space,
  Switch,
  Empty,
  Select
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ImportOutlined
} from '@ant-design/icons';
import type { AnneeUniversitaire, Importations } from '../types/annee_universitaire';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAnneeUniversitaires, updateAnneeUniversitaire, deleteAnneeUniversitaire, createAnneeUniversitaire, Import } from '../services/anneeUniversitaire';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function AnneeUniversitaire() {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [form] = Form.useForm<AnneeUniversitaire>();
  const [importForm] = Form.useForm<Importations>();
  const [currentAnnee, setCurrentAnnee] = useState<AnneeUniversitaire | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const {data: anneesData, isLoading: anneesLoading} = useQuery({
    queryKey: ['annees'],
    queryFn: () => getAnneeUniversitaires(), 
  });

  const {mutate: updateAnneeUniversitaireMutation} = useMutation({
    mutationFn: updateAnneeUniversitaire,
    onSuccess: () => {
      messageApi.success('Année universitaire mise à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['annees'] });
      queryClient.invalidateQueries({ queryKey: ['activeAnnee'] });
    },
    onError: (e) => {
      console.error(e);
      messageApi.error('Erreur lors de la mise à jour de l\'année universitaire');
    }
  });

  const {mutate: importAnneeUniversitaireMutation} = useMutation({
    mutationFn: Import,
    onSuccess: () => {
      messageApi.success('Année universitaire importée avec succès');
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
      queryClient.invalidateQueries({ queryKey: ['pavilions'] });
      queryClient.invalidateQueries({ queryKey: ['chambres'] });
    },
    onError: (e) => {
      console.error(e);
      messageApi.error('Erreur lors de l\'importation de l\'année universitaire');
    }
  });

  const {mutate: deleteAnneeUniversitaireMutation} = useMutation({
    mutationFn: deleteAnneeUniversitaire,
    onSuccess: () => {
      messageApi.success('Année universitaire supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['annees'] });
      queryClient.invalidateQueries({ queryKey: ['activeAnnee'] });
    },
    onError: () => {
      messageApi.error('Erreur lors de la suppression de l\'année universitaire');
    }
  });

  const {mutate: createAnneeUniversitaireMutation} = useMutation({
    mutationFn: createAnneeUniversitaire,
    onSuccess: () => {
      messageApi.success('Année universitaire créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['annees'] });
      queryClient.invalidateQueries({ queryKey: ['activeAnnee'] });
    },
    onError: () => {
      messageApi.error('Erreur lors de la création de l\'année universitaire');
    }
  });

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a: AnneeUniversitaire, b: AnneeUniversitaire) => a.nom.localeCompare(b.nom),
      render: (text: string) => <Text style={{ fontWeight: 500 }}>{text}</Text>
    },
    {
      title: 'Active',
      dataIndex: 'isActif',
      key: 'active',
      render: (_: unknown, record: AnneeUniversitaire) => (
        record.isActif ? 
          <Tag 
            color="success" 
            style={{ 
              borderRadius: '12px', 
              padding: '0 12px',
              fontWeight: 500,
              fontSize: '13px',
              height: '24px',
              lineHeight: '24px',
              boxShadow: '0 2px 6px rgba(82, 196, 26, 0.25)'
            }}
          >
            Oui
          </Tag> : 
          <Tag 
            color="default" 
            style={{ 
              borderRadius: '12px',
              padding: '0 12px',
              fontWeight: 500,
              fontSize: '13px',
              height: '24px',
              lineHeight: '24px'
            }}
          >
            Non
          </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: AnneeUniversitaire) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<ImportOutlined />}
            size="small"
            onClick={() => handleImportModalOpen()}
          >
            Importer
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Modifier
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record._id)}
            disabled={record.isActif} // Empêcher la suppression de l'année active
          >
            Supprimer
          </Button>
        </Space>
      ),
    },
  ];

  const filteredAnnees = anneesData?.filter(
    annee =>
      annee.nom.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setCurrentAnnee(null);
    setIsEditing(false);
  };

  const handleImportModalOpen = () => {
    setIsImportModalOpen(true);
    importForm.resetFields();
  };

  const handleImportModalCancel = () => {
    setIsImportModalOpen(false);
    importForm.resetFields();
  };

  const handleImportSubmit = () => {
    importForm.validateFields().then(values => {
      const { anneeFrom, anneeTo } = values;
      if (!anneeFrom || !anneeTo) {
        messageApi.error('Veuillez sélectionner une année source et une année destination');
        return;
      }
      else if(anneeFrom === anneeTo){
        messageApi.error('L\'année source et l\'année destination doivent être différentes');
        return;
      }
      importAnneeUniversitaireMutation(values);
      setIsImportModalOpen(false);
      importForm.resetFields();
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };


  const handleEdit = (annee: AnneeUniversitaire) => {
    setCurrentAnnee(annee);
    setIsEditing(true);
    form.setFieldsValue(annee);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    // Vérifier que l'année n'est pas active
    if (anneesData?.find(a => a._id === id)?.isActif) {
      messageApi.error('Impossible de supprimer l\'année universitaire active');
      return;
    }
    
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cette année universitaire ?',
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      cancelText: 'Non',
      onOk: () => {
        deleteAnneeUniversitaireMutation(id);
        messageApi.success('Année universitaire supprimée avec succès');
      }
    });
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {   
      if (isEditing && currentAnnee) {
        // Mise à jour d'une année existante
        updateAnneeUniversitaireMutation({ ...values, _id: currentAnnee._id });
      } else {
        // Création d'une nouvelle année
        createAnneeUniversitaireMutation(values);
      }
      handleCancel();
    });
  };

  const renderSummaryCards = () => {
    const activeAnnee = anneesData?.find(a => a.isActif);
    
    return (
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} md={12} lg={6}>
          <Card 
            hoverable 
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: 'none',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            className="dashboard-card"
          >
            <Spin spinning={anneesLoading}>
              <div style={{ 
                textAlign: 'center',
                padding: '12px 0',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #1890ff30 0%, #1890ffaa 100%)',
                  padding: '16px',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CalendarOutlined style={{ fontSize: 36, color: '#1890ff' }} />
                </div>
                <Title level={3} style={{ margin: '8px 0', fontSize: '28px' }}>{anneesData?.length || 0}</Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>Années universitaires</Text>
              </div>
            </Spin>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card 
            hoverable 
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: 'none',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            className="dashboard-card"
          >
            <Spin spinning={anneesLoading}>
              <div style={{ 
                textAlign: 'center',
                padding: '12px 0',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #52c41a30 0%, #52c41aaa 100%)',
                  padding: '16px',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircleOutlined style={{ fontSize: 36, color: '#52c41a' }} />
                </div>
                <Title level={3} style={{ margin: '8px 0', fontSize: '28px' }}>
                  {activeAnnee ? activeAnnee.nom.split(' ').pop() : '-'}
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>Année universitaire active</Text>
              </div>
            </Spin>
          </Card>
        </Col>
      </Row>
    );
  };

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
                Gestion des Années Universitaires
              </Typography.Title>
              <Typography.Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                Configurez et gérez les années académiques du système
              </Typography.Text>
            </Col>
          </Row>
        </div>
        {renderSummaryCards()}
        
        <div style={{ marginBottom: 24 }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 24,
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <Input.Search
              placeholder="Rechercher une année universitaire"
              style={{ 
                width: '300px', 
                maxWidth: '100%',
                borderRadius: '8px' 
              }}
              value={searchText}
              onChange={handleSearchChange}
              size="large"
            />
            <Space>
              <Button
                icon={<ImportOutlined />}
                onClick={handleImportModalOpen}
                style={{ 
                  borderRadius: '8px',
                  height: '40px',
                  boxShadow: '0 2px 6px rgba(19, 194, 194, 0.3)',
                  background: 'linear-gradient(90deg, #13c2c2 0%, #36cfc9 100%)',
                  border: 'none',
                  color: 'white',
                  transition: 'all 0.3s ease'
                }}
                size="large"
              >
                Importer des données
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setIsEditing(false);
                  setIsModalOpen(true);
                }}
                style={{ 
                  borderRadius: '8px',
                  height: '40px',
                  boxShadow: '0 2px 6px rgba(24, 144, 255, 0.3)',
                  background: 'linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)',
                  border: 'none',
                  transition: 'all 0.3s ease'
                }}
                size="large"
              >
                Ajouter une année universitaire
              </Button>
            </Space>
          </div>
          {anneesLoading ? (
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
          ) : filteredAnnees && filteredAnnees.length > 0 ? (
            <div style={{ 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}>
              <Table 
                columns={columns} 
                dataSource={filteredAnnees} 
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
                  Aucune année universitaire trouvée
                </span>
              } 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              style={{ 
                padding: '48px 0',
                background: '#f5f7fa',
                borderRadius: '12px',
                boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.03)' 
              }}
            />
          )}
        </div>

        <Modal
          title={
            <span style={{ fontSize: '18px', fontWeight: 600 }}>
              {isEditing ? 'Modifier' : 'Ajouter'} une année universitaire
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
          >
            <Form.Item
              label="Nom de l'année universitaire"
              name="nom"
              rules={[{ required: true, message: 'Veuillez saisir un nom pour l\'année universitaire' }]}
            >
              <Input 
                placeholder="Ex: Année Universitaire 2024-2025" 
                style={{ borderRadius: '6px', height: '40px' }} 
                prefix={<CalendarOutlined style={{ color: '#bfbfbf', marginRight: '8px' }} />}
              />
            </Form.Item>

            <Form.Item
              name="isActif"
              label={<span style={{ fontSize: '15px' }}>Année active</span>}
              valuePropName="checked"
              tooltip={{ 
                title: 'L\'année active sera utilisée par défaut dans toutes les fonctionnalités',
                color: '#1890ff',
                placement: 'right'
              }}
            > 
              <Switch
                checkedChildren="Oui"
                unCheckedChildren="Non"
                style={{ backgroundColor: '#bfbfbf' }}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal d'importation */}
        <Modal
          title={
            <span style={{ fontSize: '18px', fontWeight: 600 }}>
              Importation de données
            </span>
          }
          open={isImportModalOpen}
          onCancel={handleImportModalCancel}
          width={500}
          centered
          bodyStyle={{ padding: '24px' }}
          style={{ borderRadius: '12px', overflow: 'hidden' }}
          maskStyle={{ backdropFilter: 'blur(2px)', background: 'rgba(0, 0, 0, 0.45)' }}
          footer={[
            <Button 
              key="cancel" 
              onClick={handleImportModalCancel}
              style={{ borderRadius: '6px' }}
              size="large"
            >
              Annuler
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              onClick={handleImportSubmit}
              style={{ 
                borderRadius: '6px',
                background: 'linear-gradient(90deg, #13c2c2 0%, #36cfc9 100%)',
                boxShadow: '0 2px 6px rgba(19, 194, 194, 0.3)',
                border: 'none'
              }}
              size="large"
            >
              Importer
            </Button>,
          ]}
        >
          <Form
            form={importForm}
            layout="vertical"
          >
            <Form.Item
              label="Année source"
              name="anneeFrom"
              rules={[{ required: true, message: 'Veuillez sélectionner l\'année source' }]}
            >
              <Select
                placeholder="Sélectionnez l'année source"
                style={{ borderRadius: '6px', height: '40px' }}
                options={anneesData?.map(annee => ({
                  value: annee._id,
                  label: annee.nom
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Année destination"
              name="anneeTo"
              rules={[{ required: true, message: 'Veuillez sélectionner l\'année destination' }]}
            >
              <Select
                placeholder="Sélectionnez l'année destination"
                style={{ borderRadius: '6px', height: '40px' }}
                options={anneesData?.map(annee => ({
                  value: annee._id,
                  label: annee.nom
                }))}
              />
            </Form.Item>

            <div style={{ background: '#f6ffed', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #b7eb8f' }}>
              <Text style={{ fontSize: '14px', color: '#52c41a', display: 'flex', alignItems: 'center' }}>
                <CheckCircleOutlined style={{ marginRight: '8px' }} />
                L'importation copiera toutes les structures (campus, pavillons et chambres) de l'année source vers l'année destination.
              </Text>
            </div>
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

