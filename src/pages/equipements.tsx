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
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  ToolOutlined
} from '@ant-design/icons';
import type { Equipement } from '../types/equipement';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEquipements, createEquipement, updateEquipement, deleteEquipement } from '../services/equipement';

const { Content } = Layout;
const { Title } = Typography;

export default function Equipements() {
  const [searchText, setSearchText] = useState('');
  const [currentEquipement, setCurrentEquipement] = useState<Equipement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm<Equipement>();
  const [messageApi, contextHolder] = message.useMessage();

  const queryClient = useQueryClient();
  
  // Fetch equipements data
  const { data: equipements = [], isLoading: loading } = useQuery({
    queryKey: ['equipements'],
    queryFn: async () => {
      const response = await getEquipements();
      return response.json();
    }
  });
  
  // Mutations
  const { mutate: createEquipementMutation } = useMutation({
    mutationFn: createEquipement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipements'] });
      messageApi.success('Équipement créé avec succès');
      handleCancel();
    },
    onError: () => {
      messageApi.error('Erreur lors de la création de l\'équipement');
    }
  });
  
  const { mutate: updateEquipementMutation } = useMutation({
    mutationFn: (params: { id: string, equipement: Equipement }) => {
      return updateEquipement(params.id, params.equipement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipements'] });
      messageApi.success('Équipement mis à jour avec succès');
      handleCancel();
    },
    onError: () => {
      messageApi.error('Erreur lors de la mise à jour de l\'équipement');
    }
  });
  
  const { mutate: deleteEquipementMutation } = useMutation({
    mutationFn: deleteEquipement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipements'] });
      messageApi.success('Équipement supprimé avec succès');
    },
    onError: () => {
      messageApi.error('Erreur lors de la suppression de l\'équipement');
    }
  });
  
  // Handle form actions
  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentEquipement(null);
    form.resetFields();
  };

  const showCreateModal = () => {
    setIsEditing(false);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (equipement: Equipement) => {
    setCurrentEquipement(equipement);
    setIsEditing(true);
    form.setFieldsValue({
      nom: equipement.nom,
      description: equipement.description
    });
    setIsModalOpen(true);
  };

  const onFinish = (values: Equipement) => {
    if (isEditing && currentEquipement?._id) {
      updateEquipementMutation({ id: currentEquipement._id, equipement: values });
    } else {
        console.log(values);
      createEquipementMutation(values);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cet équipement?',
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: () => {
        deleteEquipementMutation(id);
      }
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value.toLowerCase());
  };

  // Filter equipements based on search
  const filteredEquipements = searchText && Array.isArray(equipements)
    ? equipements.filter(
        (equipement: Equipement) =>
          equipement.nom.toLowerCase().includes(searchText) ||
          (equipement.description?.toLowerCase().includes(searchText) || false)
      )
    : equipements;

  // Table columns definition
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a: Equipement, b: Equipement) => a.nom.localeCompare(b.nom),
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text || '-'}</span>
        </Tooltip>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Equipement) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            type="primary"
            size="small"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id!)}
            danger
            size="small"
          />
        </Space>
      )
    }
  ];

  return (
    <Layout style={{ padding: '0 24px 24px' }}>
      {contextHolder}
      <Content
        style={{
          padding: 24,
          margin: 0,
          background: 'white',
          borderRadius: 10,
          minHeight: 280
        }}
      >
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
          <Title level={3}>
            <ToolOutlined /> Gestion des Équipements
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            Ajouter un équipement
          </Button>
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Rechercher un équipement..."
            prefix={<SearchOutlined />}
            onChange={handleSearchChange}
            style={{ width: 300 }}
          />
        </div>
        
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredEquipements}
              rowKey="_id"
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '30']
              }}
            />
          )}
        </div>
        
        {/* Create/Edit Modal */}
        <Modal
          title={isEditing ? 'Modifier l\'équipement' : 'Créer un nouvel équipement'}
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              label="Nom"
              name="nom"
              rules={[{ required: true, message: 'Veuillez entrer le nom de l\'équipement' }]}
            >
              <Input placeholder="Nom de l'équipement" />
            </Form.Item>
            
            <Form.Item
              label="Description"
              name="description"
            >
              <Input.TextArea 
                rows={4} 
                placeholder="Description de l'équipement (optionnel)" 
              />
            </Form.Item>
            
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
