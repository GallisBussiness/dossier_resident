import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { generateDossierPDF } from '../utils/pdfGenerator';
import {
  Layout,
  Typography,
  Card,
  Descriptions,
  Button,
  Space,
  Divider,
  Tag,
  Row,
  Col,
  Spin,
  Breadcrumb,
  Statistic,
  Timeline,
  Avatar,
  message,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  InputNumber,
  Tabs,
  DatePicker
} from 'antd';
import {
  RollbackOutlined,
  FileOutlined,
  UserOutlined,
  HomeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  PrinterOutlined,
  HistoryOutlined,
  DollarOutlined,
  PlusOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ToolOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { getDossierById, deleteDossier } from '../services/dossier';
import { getEtudiantByNcs } from '../services/etudiant';
import { getPayementsByDossierId, createPayement, updatePayement, deletePayement } from '../services/payement';
import { getAllocationDossierById, createAllocationMateriel, updateAllocationMateriel, deleteAllocationMateriel } from '../services/allocation';
import type { Pavillon } from '../types/pavillon';
import { Mois } from '../types/payement';
import type { Payement, CreatePayement, UpdatePayement } from '../types/payement';
import type { AllocationMateriel, CreateAllocationMateriel, UpdateAllocationMateriel } from '../types/allocation_materiel';
import dayjs from 'dayjs';
import { getEquipements } from '../services/equipement';
import type { Equipement } from '../types/equipement';

// Extend Payement interface to include _id property
interface PayementWithId extends Payement {
  _id?: string;
}

// Extend AllocationMateriel interface to include _id property
interface AllocationMaterielWithId extends AllocationMateriel {
  _id?: string;
}

const { Content } = Layout;
const { Title, Text } = Typography;

export default function DossierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  
  // State for payment form modal
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PayementWithId | null>(null);
  const [form] = Form.useForm();
  
  // State for allocation form modal
  const [isAllocationModalVisible, setIsAllocationModalVisible] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<AllocationMaterielWithId | null>(null);
  const [allocationForm] = Form.useForm();
  
  // State for allocation detail modal
  const [isViewAllocationModalVisible, setIsViewAllocationModalVisible] = useState(false);
  const [viewingAllocation, setViewingAllocation] = useState<AllocationMaterielWithId | null>(null);

  // Fetch dossier data
  const { data: dossier, isLoading } = useQuery({
    queryKey: ['dossier', id],
    queryFn: () => id ? getDossierById(id) : Promise.reject('ID non fourni'),
    enabled: !!id
  });

  const { data: equipements } = useQuery({
    queryKey: ['equipements'],
    queryFn: async () => {
      const response = await getEquipements();
      return response.json();
    }
  });
  
  // Fetch payments for this dossier
  const { data: payments = [], isLoading: isLoadingPayments } = useQuery<PayementWithId[]>({
    queryKey: ['payments', id],
    queryFn: () => id ? getPayementsByDossierId(id) : Promise.reject('ID non fourni'),
    enabled: !!id
  });
  
  // Fetch allocations for this dossier
  const { data: allocations = [], isLoading: isLoadingAllocations } = useQuery<AllocationMaterielWithId[]>({
    queryKey: ['allocations', id],
    queryFn: () => id ? getAllocationDossierById(id) : Promise.reject('ID non fourni'),
    enabled: !!id
  });
  

  // Fetch related data once dossier is loaded
  const { data: etudiant } = useQuery({
    queryKey: ['etudiant', dossier?.etudiantId],
    queryFn: () => {
     return getEtudiantByNcs(dossier?.etudiantId as string);
    },
    enabled: !!dossier?.etudiantId
  });

  // Mutations for payments
  const createPayementMutation = useMutation({
    mutationFn: (newPayement: CreatePayement) => createPayement(newPayement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', id] });
      messageApi.success('Paiement enregistré avec succès');
      setIsPaymentModalVisible(false);
      form.resetFields();
    },
    onError: () => {
      messageApi.error('Erreur lors de l\'enregistrement du paiement');
    }
  });

  const updatePayementMutation = useMutation({
    mutationFn: ({ id, payment }: { id: string; payment: UpdatePayement }) => updatePayement(id, payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', id] });
      messageApi.success('Paiement mis à jour avec succès');
      setIsPaymentModalVisible(false);
      setEditingPayment(null);
      form.resetFields();
    },
    onError: () => {
      messageApi.error('Erreur lors de la mise à jour du paiement');
    }
  });

  const deletePayementMutation = useMutation({
    mutationFn: (paymentId: string) => deletePayement(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', id] });
      messageApi.success('Paiement supprimé avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la suppression du paiement');
    }
  });
  
  // Mutations for allocations
  const createAllocationMutation = useMutation({
    mutationFn: (newAllocation: CreateAllocationMateriel) => createAllocationMateriel(newAllocation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations', id] });
      queryClient.invalidateQueries({ queryKey: ['allocationStats', id] });
      messageApi.success('Allocation enregistrée avec succès');
      setIsAllocationModalVisible(false);
      allocationForm.resetFields();
    },
    onError: () => {
      messageApi.error('Erreur lors de l\'enregistrement de l\'allocation');
    }
  });

  const updateAllocationMutation = useMutation({
    mutationFn: ({ id, allocation }: { id: string; allocation: UpdateAllocationMateriel }) => 
      updateAllocationMateriel(id, allocation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations', id] });
      queryClient.invalidateQueries({ queryKey: ['allocationStats', id] });
      messageApi.success('Allocation mise à jour avec succès');
      setIsAllocationModalVisible(false);
      setEditingAllocation(null);
      allocationForm.resetFields();
    },
    onError: () => {
      messageApi.error('Erreur lors de la mise à jour de l\'allocation');
    }
  });

  const deleteAllocationMutation = useMutation({
    mutationFn: (allocationId: string) => deleteAllocationMateriel(allocationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations', id] });
      queryClient.invalidateQueries({ queryKey: ['allocationStats', id] });
      messageApi.success('Allocation supprimée avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la suppression de l\'allocation');
    }
  });

  // Handle payment form submission
  const handlePaymentSubmit = (values: CreatePayement) => {
    if (editingPayment && editingPayment._id) {
      updatePayementMutation.mutate({
        id: editingPayment._id as string,
        payment: {
          ...values,
          dossierId: id
        }
      });
    } else {
      createPayementMutation.mutate({
        ...values,
        dossierId: id as string
      });
    }
  };

  // Handle payment edit
  const handleEditPayment = (payment: PayementWithId) => {
    setEditingPayment(payment);
    form.setFieldsValue({
      montant: payment.montant,
      mois: payment.mois,
      numero_facture: payment.numero_facture,
    });
    setIsPaymentModalVisible(true);
  };
  
  // Handle allocation form submission
  const handleAllocationSubmit = (values: CreateAllocationMateriel) => {
    const { date, ...rest } = values;
    const allocationData = {
      ...rest,
      dossierId: id as string,
      date: dayjs(date).toDate()
    };
  
    if (editingAllocation && editingAllocation._id) {
      updateAllocationMutation.mutate({
        id: editingAllocation._id,
        allocation: allocationData
      });
    } else {
      createAllocationMutation.mutate(allocationData);
    }
  };
  
  // Handle allocation edit
  const handleViewAllocation = (allocation: AllocationMaterielWithId) => {
    setViewingAllocation(allocation);
    setIsViewAllocationModalVisible(true);
  };
  
  const handleEditAllocation = (allocation: AllocationMaterielWithId) => {
    setEditingAllocation(allocation);
    allocationForm.setFieldsValue({
      equipementId: allocation.equipementId,
      nombre: allocation.nombre,
      description: allocation.description,
      constatation: allocation.constatation,
      date: dayjs(allocation.date)
    });
    setIsAllocationModalVisible(true);
  };
  
  

  const handleDelete = () => {
    if (!id) return;
    
    deleteDossier(id)
      .then(() => {
        handleBack();
      })
      .catch(() => {
        messageApi.error('Erreur lors de la suppression du dossier');
      });
  };

  const handleBack = () => {
    navigate('/dashboard/dossiers');
  };
  
  // Fonction pour générer et ouvrir le PDF du dossier
  const handlePrintDossier = () => {
    if (!dossier || !etudiant) {
      messageApi.error('Impossible de générer le PDF: données manquantes');
      return;
    }
    
    // Générer le PDF avec l'utilitaire
    const pdfDoc = generateDossierPDF(dossier, etudiant, payments);
    
    // Ouvrir le PDF dans une nouvelle fenêtre
    pdfDoc.open({}, window);
  };

  if (isLoading) {
    return (
      <Content style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Spin size="large" spinning={isLoading} />
        </div>
      </Content>
    );
  }

  if (!dossier) {
    return (
      <Content style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Title level={3}>Dossier non trouvé</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
              Le dossier que vous recherchez n'existe pas ou a été supprimé.
            </Text>
            <Button type="primary" onClick={handleBack}>
              Retour aux dossiers
            </Button>
          </div>
        </Card>
      </Content>
    );
  }

  return (
    <Content style={{ padding: '24px' }}>
      {contextHolder}
      
      {/* Breadcrumb navigation */}
      <Breadcrumb 
        style={{ marginBottom: '16px' }}
        items={[
          { title: 'Accueil', href: '/dashboard' },
          { title: 'Dossiers', href: '/dashboard/dossiers' },
          { title: `Dossier ${dossier.numero}` }
        ]}
      />
      
      {/* Header with actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <Space>
              <FileOutlined />
              Dossier {dossier.numero}
            </Space>
          </Title>
          <Text type="secondary">Créé le {dossier.createdAt ? new Date(dossier.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</Text>
        </div>
        <Space size="middle">
          <Button icon={<RollbackOutlined />} onClick={handleBack}>Retour</Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrintDossier}>Imprimer</Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>Supprimer</Button>
        </Space>
      </div>
      
      {/* Main content */}
      <Row gutter={[24, 24]}>
        {/* Left column - Main info */}
        <Col xs={24} lg={16}>
          <Card 
            title={<Space><FileOutlined /> Informations du dossier</Space>} 
            className="card-shadow"
            style={{ marginBottom: '24px' }}
          >
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
              <Descriptions.Item label="N° Dossier">{dossier.numero}</Descriptions.Item>
              <Descriptions.Item label="Statut">
                {dossier.active ? 
                  <Tag icon={<CheckCircleOutlined />} color="success">Actif</Tag> : 
                  <Tag icon={<CloseCircleOutlined />} color="error">Inactif</Tag>
                }
              </Descriptions.Item>
              <Descriptions.Item label="Année Universitaire">
                <Space>
                  <CalendarOutlined />
                  {typeof dossier.anneeUniversitaireId === 'string' ? dossier.anneeUniversitaireId : dossier.anneeUniversitaireId?.nom || 'Non spécifié'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Date de création">
                {dossier.createdAt ? new Date(dossier.createdAt).toLocaleDateString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Caution" span={2}>
                <Text strong style={{ fontSize: '16px' }}>{dossier.caution?.toLocaleString()} FCFA</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Loyer mensuel" span={2}>
                <Text strong style={{ fontSize: '16px' }}>{dossier.taux_loyer_mensuelle?.toLocaleString()} FCFA</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
          
          {/* Étudiant info */}
          <Card 
            title={<Space><UserOutlined /> Informations de l'étudiant</Space>} 
            className="card-shadow"
            style={{ marginBottom: '24px' }}
          >
            {etudiant ? (
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} md={6}>
                  <Avatar size={100} icon={<UserOutlined />} src={`${import.meta.env.VITE_BACKURL_ETUDIANT}/${etudiant.avatar}`} style={{ backgroundColor: '#1890ff' }} />
                </Col>
                <Col xs={24} md={18}>
                  <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="Nom">{etudiant.nom}</Descriptions.Item>
                    <Descriptions.Item label="Prénom">{etudiant.prenom}</Descriptions.Item>
                    <Descriptions.Item label="NCS">{etudiant.ncs}</Descriptions.Item>
                    <Descriptions.Item label="Téléphone">{etudiant.telephone || 'Non spécifié'}</Descriptions.Item>
                    <Descriptions.Item label="CNI">{etudiant.cni || 'Non spécifié'}</Descriptions.Item>
                    <Descriptions.Item label="Email">{etudiant.email || 'Non spécifié'}</Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            ) : (
              <Text type="secondary">Informations de l'étudiant non disponibles</Text>
            )}
          </Card>
          
          {/* Chambre info */}
          <Card 
            title={<Space><HomeOutlined /> Informations de la chambre</Space>} 
            className="card-shadow"
          >
            {dossier.chambreId ? (
              <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Nom de la chambre">{typeof dossier.chambreId === 'string' ? dossier.chambreId : dossier.chambreId.nom}</Descriptions.Item>
                <Descriptions.Item label="Pavillon">
                  {typeof dossier.chambreId === 'string' ? 
                    dossier.chambreId : 
                    (dossier.chambreId.pavillonId as {nom?: string})?.nom || 'Non spécifié'}
                </Descriptions.Item>
                <Descriptions.Item label="Campus">
                  {typeof dossier.chambreId === 'string' ? 
                    'Non spécifié' : 
                    (typeof (dossier.chambreId.pavillonId as {campusId?: string | {nom: string}})?.campusId === 'string' ? 
                      (dossier.chambreId.pavillonId as Pavillon)?.campusId?.nom || 'Non spécifié' : 
                      ((dossier.chambreId.pavillonId as {campusId?: {nom: string}})?.campusId?.nom || 'Non spécifié'))
                  }
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Text type="secondary">Informations de la chambre non disponibles</Text>
            )}
          </Card>
          <Tabs defaultActiveKey="payments" items={[
            {
              key: 'payments',
              label: (
                <span>
                  <DollarOutlined />
                  Suivi des paiements
                </span>
              ),
              children: (
                <Card
                  className="card-shadow"
                  style={{ marginBottom: '24px' }}
                  extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => {
                    setEditingPayment(null);
                    form.resetFields();
                    setIsPaymentModalVisible(true);
                  }}>Nouveau paiement</Button>}
                >
            <Spin spinning={isLoadingPayments}>
              {payments.length > 0 ? (
                <Table
                  dataSource={payments as PayementWithId[]}
                  rowKey="_id"
                  pagination={false}
                  size="small"
                >
                  <Table.Column title="Mois" dataIndex="mois" key="mois" />
                  <Table.Column 
                    title="Montant" 
                    dataIndex="montant" 
                    key="montant"
                    render={(montant) => `${montant.toLocaleString()} FCFA`}
                  />
                  <Table.Column 
                    title="N° Facture" 
                    dataIndex="numero_facture" 
                    key="numero_facture" 
                  />
                  <Table.Column
                    title="Actions"
                    key="actions"
                    render={(_, record: PayementWithId) => (
                      <Space>
                        <Button 
                          type="text" 
                          icon={<EditOutlined />} 
                          onClick={() => handleEditPayment(record)}
                        />
                        <Popconfirm
                          title="Êtes-vous sûr de vouloir supprimer ce paiement ?"
                          onConfirm={() => deletePayementMutation.mutate(record._id as string)}
                          okText="Oui"
                          cancelText="Non"
                          icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                        >
                          <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </Space>
                    )}
                  />
                </Table>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Text type="secondary">Aucun paiement enregistré</Text>
                </div>
              )}
            </Spin>
                </Card>
              ),
            },
            {
              key: 'allocations',
              label: (
                <span>
                  <ToolOutlined />
                  Allocations de matériel
                </span>
              ),
              children: (
                <Card
                  className="card-shadow"
                  style={{ marginBottom: '24px' }}
                  extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => {
                    setEditingAllocation(null);
                    allocationForm.resetFields();
                    setIsAllocationModalVisible(true);
                  }}>Nouvelle allocation</Button>}
                >
                  <Spin spinning={isLoadingAllocations}>
                    {allocations.length > 0 ? (
                      <Table
                        dataSource={allocations as AllocationMaterielWithId[]}
                        rowKey="_id"
                        size="small"
                      >
                        <Table.Column title="Date" dataIndex="date" key="date" 
                          render={(date) => new Date(date).toLocaleDateString('fr-FR')}
                        />
                        <Table.Column title="Matériel" dataIndex="equipementId" key="equipementId" render={(equipementId) => equipementId.nom} />
                        <Table.Column title="Quantité" dataIndex="nombre" key="nombre" />
                        <Table.Column 
                          title="Description" 
                          dataIndex="description" 
                          key="description" 
                          ellipsis={true}
                        />
                        <Table.Column
                          title="Actions"
                          key="actions"
                          render={(_, record: AllocationMaterielWithId) => (
                            <Space>
                              <Button 
                                type="text" 
                                icon={<EyeOutlined />} 
                                onClick={() => handleViewAllocation(record)}
                              />
                              <Button 
                                type="text" 
                                icon={<EditOutlined />} 
                                onClick={() => handleEditAllocation(record)}
                              />
                              <Popconfirm
                                title="Êtes-vous sûr de vouloir supprimer cette allocation ?"
                                onConfirm={() => deleteAllocationMutation.mutate(record._id as string)}
                                okText="Oui"
                                cancelText="Non"
                                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                              >
                                <Button type="text" danger icon={<DeleteOutlined />} />
                              </Popconfirm>
                            </Space>
                          )}
                        />
                      </Table>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Text type="secondary">Aucune allocation enregistrée</Text>
                      </div>
                    )}
                  </Spin>
                </Card>
              ),
            },
          ]} />
        </Col>
        
        {/* Right column - Summary and stats */}
        <Col xs={24} lg={8}>
          <Card 
            title={<Space><DollarOutlined /> Résumé financier</Space>} 
            className="card-shadow"
            style={{ marginBottom: '24px' }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic 
                  title="Caution" 
                  value={dossier.caution || 0} 
                  suffix="FCFA"
                  precision={0}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Loyer mensuel" 
                  value={dossier.taux_loyer_mensuelle || 0} 
                  suffix="FCFA"
                  precision={0}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={24}>
                <Divider style={{ margin: '12px 0' }} />
                <Statistic 
                  title="Total annuel estimé" 
                  value={(dossier.taux_loyer_mensuelle || 0) * 12 + (dossier.caution || 0)} 
                  suffix="FCFA"
                  precision={0}
                  valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
                />
              </Col>
            </Row>
          </Card>
          
          {/* Payment tracking card */}
          <Card 
            title={<Space><HistoryOutlined /> Historique du dossier</Space>} 
            className="card-shadow"
          >
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <>
                      <Text strong>Création du dossier</Text>
                      <br />
                      <Text type="secondary">{new Date(dossier.createdAt as string).toLocaleDateString()}</Text>
                    </>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <>
                      <Text strong>Attribution de la chambre</Text>
                      <br />
                      <Text type="secondary">{new Date(dossier.createdAt as string).toLocaleDateString()}</Text>
                    </>
                  ),
                },
                {
                  color: dossier.active ? 'green' : 'red',
                  children: (
                    <>
                      <Text strong>Statut: {dossier.active ? 'Actif' : 'Inactif'}</Text>
                      <br />
                      <Text type="secondary">Dernière mise à jour: {dossier.updatedAt ? new Date(dossier.updatedAt as string).toLocaleDateString('fr-FR') : 'N/A'}</Text>
                    </>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Payment Form Modal */}
      <Modal
        title={editingPayment ? 'Modifier le paiement' : 'Nouveau paiement'}
        open={isPaymentModalVisible}
        onCancel={() => {
          setIsPaymentModalVisible(false);
          setEditingPayment(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePaymentSubmit}
          initialValues={{
            montant: dossier?.taux_loyer_mensuelle || 0,
          }}
        >
          <Form.Item
            name="montant"
            label="Montant"
            rules={[{ required: true, message: 'Veuillez saisir le montant' }]}
          >
            <Input type="number" suffix="FCFA" />
          </Form.Item>
          
          <Form.Item
            name="mois"
            label="Mois"
            rules={[{ required: true, message: 'Veuillez sélectionner le mois' }]}
          >
            <Select>
              {Object.values(Mois).map(mois => (
                <Select.Option key={mois} value={mois}>{mois}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="numero_facture"
            label="Numéro de facture"
            rules={[{ required: true, message: 'Veuillez saisir le numéro de facture' }]}
          >
            <Input />
          </Form.Item>    
          <Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Button style={{ marginRight: 8 }} onClick={() => {
                setIsPaymentModalVisible(false);
                setEditingPayment(null);
                form.resetFields();
              }}>
                Annuler
              </Button>
              <Button type="primary" htmlType="submit" loading={createPayementMutation.isPending || updatePayementMutation.isPending}>
                {editingPayment ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Allocation Form Modal */}
      <Modal
        title={editingAllocation ? 'Modifier l\'allocation' : 'Nouvelle allocation'}
        open={isAllocationModalVisible}
        onCancel={() => {
          setIsAllocationModalVisible(false);
          setEditingAllocation(null);
          allocationForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={allocationForm}
          layout="vertical"
          onFinish={handleAllocationSubmit}
          initialValues={{
            constatation: 'NEUF',
            nombre: 1
          }}
        >
          <Form.Item
            name="equipementId"
            label="Nom du matériel"
            rules={[{ required: true, message: 'Veuillez saisir le nom du matériel' }]}
          >
            <Select
              showSearch
              placeholder="Sélectionner un matériel"
              optionFilterProp="children"
            >
              {equipements?.map((equipement) => (
                <Select.Option key={equipement._id} value={equipement._id}>
                  {equipement.nom}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="nombre"
            label="Quantité"
            rules={[{ required: true, message: 'Veuillez saisir la quantité' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="date"
            label="Date d'allocation"
            rules={[{ required: true, message: 'Veuillez sélectionner la date' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          
          <Form.Item
            name="constatation"
            label="Constatation"
            rules={[{ required: true, message: 'Veuillez sélectionner l\'état' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          
          <Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Button style={{ marginRight: 8 }} onClick={() => {
                setIsAllocationModalVisible(false);
                setEditingAllocation(null);
                allocationForm.resetFields();
              }}>
                Annuler
              </Button>
              <Button type="primary" htmlType="submit" loading={createAllocationMutation.isPending || updateAllocationMutation.isPending}>
                {editingAllocation ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Allocation Detail Modal */}
      <Modal
        title="Détail de l'allocation"
        open={isViewAllocationModalVisible}
        onCancel={() => {
          setIsViewAllocationModalVisible(false);
          setViewingAllocation(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsViewAllocationModalVisible(false);
            setViewingAllocation(null);
          }}>
            Fermer
          </Button>
        ]}
      >
        {viewingAllocation && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Équipement">
              {(viewingAllocation.equipementId as unknown as Equipement).nom || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Quantité">{viewingAllocation.nombre}</Descriptions.Item>
            <Descriptions.Item label="Date d'allocation">
              {dayjs(viewingAllocation.date).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {viewingAllocation.description || 'Aucune description'}
            </Descriptions.Item>
            <Descriptions.Item label="Constatation">
              {viewingAllocation.constatation}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
      
      {/* Add custom styles */}
      <style>{`
        .card-shadow {
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 
                      0 2px 4px rgba(0, 0, 0, 0.03), 
                      0 4px 8px rgba(0, 0, 0, 0.03);
          border-radius: 8px;
        }
        
        @media print {
          .ant-layout-header,
          .ant-layout-sider,
          .ant-btn,
          .ant-breadcrumb {
            display: none !important;
          }
          
          .ant-layout-content {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </Content>
  );
}