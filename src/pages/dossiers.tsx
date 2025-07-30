import { useState } from 'react';
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
  Tooltip,
  Select,
  Switch,
  Row,
  Col,
  Tabs
} from 'antd';
import {
  FileOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  HomeOutlined,
  PlusOutlined,
  SaveOutlined,
  EyeOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import type { Dossier, CreateDossier, UpdateDossier } from '../types/dossier';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDossiers, createDossier, updateDossier, deleteDossier } from '../services/dossier';
import { getAnneeUniversitaireActive } from '../services/anneeUniversitaire';
import type { Chambre } from '../types/chambre';
import { getChambres } from '../services/chambre';
import { getEtudiants } from '../services/etudiant';
import type { Etudiant } from '../types/etudiant';
import { useNavigate } from 'react-router';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function Dossiers() {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<string>('active');
  const [currentDossier, setCurrentDossier] = useState<Dossier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm<CreateDossier>();
  const [messageApi, contextHolder] = message.useMessage();

  const navigate = useNavigate();
  
  const queryClient = useQueryClient();
  
  // Fetch dossiers data
  const { data: dossiers = [], isLoading: loading } = useQuery({
    queryKey: ['dossiers'],
    queryFn: getDossiers
  });
  
  // Fetch années universitaires for form
  const { data: anneeUniversitaireActive} = useQuery({
    queryKey: ['activeAnnee'],
    queryFn: getAnneeUniversitaireActive
  });


  const { data: etudiants } = useQuery({
    queryKey: ['etudiants'],
    queryFn: getEtudiants
  });

  // Fetch chambres for form
  const { data: chambres = [] } = useQuery({
    queryKey: ['chambres'],
    queryFn: () => getChambres(anneeUniversitaireActive?._id || ''),
    enabled: !!anneeUniversitaireActive,
  });
  
  // Mutations
  const { mutate: createDossierMutation } = useMutation({
    mutationFn: createDossier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
      messageApi.success('Dossier créé avec succès');
      handleCancel();
    },
    onError: () => {
      messageApi.error('Erreur lors de la création du dossier');
    }
  });
  
  const { mutate: updateDossierMutation } = useMutation({
    mutationFn: updateDossier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
      messageApi.success('Dossier mis à jour avec succès');
      handleCancel();
    },
    onError: () => {
      messageApi.error('Erreur lors de la mise à jour du dossier');
    }
  });
  
  const { mutate: deleteDossierMutation } = useMutation({
    mutationFn: deleteDossier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
      messageApi.success('Dossier supprimé avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la suppression du dossier');
    }
  });

  const handleDetail = (id: string) => {
    navigate(`/dashboard/dossierDetail/${id}`);
  };
  
  // Handle form actions
  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentDossier(null);
    form.resetFields();
  };

  const showCreateModal = () => {
    setIsEditing(false);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (dossier: Dossier) => {
    setCurrentDossier(dossier);
    setIsEditing(true);
    form.setFieldsValue({
      chambreId: typeof dossier.chambreId === 'string' ? dossier.chambreId : dossier.chambreId._id,
      etudiantId: dossier.etudiantId,
      anneeUniversitaireId: typeof dossier.anneeUniversitaireId === 'string' ? 
        dossier.anneeUniversitaireId : dossier.anneeUniversitaireId._id,
      active: dossier.active,
      caution: dossier.caution,
      taux_loyer_mensuelle: dossier.taux_loyer_mensuelle
    });
    setIsModalOpen(true);
  };


  const onFinish = () => {
    form.validateFields().then((values) => {
      if (isEditing && currentDossier) {
        updateDossierMutation({ ...values, _id: currentDossier._id } as UpdateDossier);
      } else {
        createDossierMutation({ ...values, anneeUniversitaireId: anneeUniversitaireActive?._id } as CreateDossier);
      }
    });
  };
  // Table columns
  const columns = [
    {
      title: 'N° Dossier',
      dataIndex: 'numero',
      key: 'numero',
      sorter: (a: Dossier, b: Dossier) => a.numero.localeCompare(b.numero),
      render: (text: string) => (
        <Space>
          <FileOutlined style={{ color: '#1890ff' }} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Étudiant',
      key: 'etudiantId',
      render: (_: unknown, record: Dossier) => (
        <Space>
          <UserOutlined style={{ color: '#52c41a' }} />
          <span>{typeof record.etudiantId === 'string' ? record.etudiantId : record.etudiantId}</span>
        </Space>
      ),
      sorter: (a: Dossier, b: Dossier) => {
        const etudiantA = typeof a.etudiantId === 'string' ? a.etudiantId : a.etudiantId;
        const etudiantB = typeof b.etudiantId === 'string' ? b.etudiantId : b.etudiantId;
        return `${etudiantA}`.localeCompare(`${etudiantB}`);
      }
    },
    {
      title: 'Chambre',
      key: 'chambreId',
      render: (_: unknown, record: Dossier) => (
        <Space>
          <HomeOutlined style={{ color: '#722ed1' }} />
          <span>{typeof record.chambreId === 'string' ? record.chambreId : record.chambreId.nom}</span>
        </Space>
      )
    },
   {
    title:'Annee Universitaire',
    dataIndex:'anneeUniversitaireId',
    key:'anneeUniversitaireId',
    render:(_:unknown,record:Dossier)=>(
      <Space>
        <CalendarOutlined style={{color:'#1890ff'}}/>
        <span>{typeof record.anneeUniversitaireId === 'string' ? record.anneeUniversitaireId : record.anneeUniversitaireId.nom}</span>
      </Space>
    )
   },
    {
      title: 'Date de création',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
      sorter: (a: Dossier, b: Dossier) => {
        if (!a.createdAt) return -1;
        if (!b.createdAt) return 1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Dossier) => (
        <Space size="middle">
         <Tooltip title="Consulter">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleDetail(record._id || '')}
              style={{
                background: '#ff4d4f20',
                color: '#ff4d4f',
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
              type="text"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
              style={{
                background: '#52c41a20',
                color: '#52c41a',
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
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id || '')}
              style={{
                background: '#ff4d4f20',
                color: '#ff4d4f',
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

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer ce dossier ?',
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      cancelText: 'Non',
      onOk: () => {
        deleteDossierMutation(id);
      }
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value.toLowerCase());
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const filteredDossiers = dossiers.filter(dossier => {
    // Filtrer par statut actif/inactif
    const matchesStatus = activeTab === 'active' ? dossier.active === true : dossier.active === false;
    
    // Filtrer par texte de recherche
    const matchesSearch = 
      dossier.numero.toLowerCase().includes(searchText) ||
      (typeof dossier.anneeUniversitaireId === 'string' ? dossier.anneeUniversitaireId : dossier.anneeUniversitaireId.nom).toLowerCase().includes(searchText) ||
      dossier.etudiantId.toLowerCase().includes(searchText);
    
    return matchesStatus && matchesSearch;
  });

  const activeDossiersCount = dossiers.filter(dossier => dossier.active === true).length;
  const inactiveDossiersCount = dossiers.filter(dossier => dossier.active === false).length;

  return (
    <Layout>
      {contextHolder}
      <Content style={{ padding: '24px'}}>
        <Title level={2}>Gestion des Dossiers</Title>  
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Input
              placeholder="Rechercher un dossier..."
              prefix={<SearchOutlined />}
              onChange={handleSearchChange}
              style={{ width: 300 }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showCreateModal}
              style={{ 
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Nouveau Dossier
            </Button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Tabs 
                activeKey={activeTab} 
                onChange={handleTabChange}
                items={[
                  { 
                    key: 'active', 
                    label: `Dossiers Actifs (${activeDossiersCount})`,
                    children: (
                      <Table
                        columns={columns}
                        dataSource={filteredDossiers}
                        rowKey="_id"
                        pagination={{
                          defaultPageSize: 10,
                          showSizeChanger: true,
                          pageSizeOptions: ['10', '20', '30']
                        }}
                      />
                    )
                  },
                  { 
                    key: 'inactive', 
                    label: `Dossiers Inactifs (${inactiveDossiersCount})`,
                    children: (
                      <Table
                        columns={columns}
                        dataSource={filteredDossiers}
                        rowKey="_id"
                        pagination={{
                          defaultPageSize: 10,
                          showSizeChanger: true,
                          pageSizeOptions: ['10', '20', '30']
                        }}
                      />
                    )
                  },
                ]}
              />
            </>
          )}
        </div>
        
        {/* Create/Edit Modal */}
        <Modal
          title={isEditing ? 'Modifier le dossier' : 'Créer un nouveau dossier'}
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          width={700}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ active: true }}
          > 
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Étudiant"
                  name="etudiantId"
                  rules={[{ required: true, message: 'Veuillez sélectionner un étudiant' }]}
                >
                 <Select showSearch placeholder="Sélectionner un étudiant" optionFilterProp="label" filterOption={(input, option) => !!option?.label && option.label.toLowerCase().includes(input.toLowerCase())} options={etudiants?.map((etudiant: Etudiant) => ({ value: etudiant.ncs, label: `${etudiant.nom}-${etudiant.prenom}-${etudiant.ncs}` }))} />
                </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item
                  label="Chambre"
                  name="chambreId"
                  rules={[{ required: true, message: 'Veuillez sélectionner une chambre' }]}
                >
                  <Select showSearch placeholder="Sélectionner une chambre" optionFilterProp="label" filterOption={(input, option) => !!option?.label && option.label.toLowerCase().includes(input.toLowerCase())} options={chambres.map((chambre: Chambre) => ({ value: chambre._id, label: `${chambre.nom}-${typeof chambre.pavillonId === 'string' ? chambre.pavillonId : chambre.pavillonId.nom}-${typeof chambre.pavillonId === 'string' ? chambre.pavillonId : chambre.pavillonId.campusId.nom}` }))} />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Statut"
                  name="active"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="Actif" 
                    unCheckedChildren="Inactif" 
                    defaultChecked 
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                Annuler
              </Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                {isEditing ? 'Mettre à jour' : 'Créer'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}
