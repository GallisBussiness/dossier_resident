import { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Button,
  Table,
  Space,
  Input,
  Modal,
  Form,
  Select,
  message,
  Spin
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined
} from '@ant-design/icons';
import type { User } from '../types/user';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;


const defaultUser: User = {
  prenom: '',
  nom: '',
  email: '',
  isActif: true,
  role: ['user'],
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);
  const [isEditing, setIsEditing] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    // Simuler le chargement des données
    const fetchData = async () => {
      try {
        setTimeout(() => {
          const mockUsers: User[] = [
            {
              _id: '1',
              prenom: 'admin',
              nom: 'admin',
              email: 'admin@example.com',
              role: ['admin'],
              isActif: true,
            },
            {
              _id: '2',
              prenom: 'manager',
              nom: 'manager',
              email: 'manager@example.com',
              role: ['manager'],
              isActif: true,
            },
            {
              _id: '3',
              prenom: 'operator',
              nom: 'operator',
              email: 'operator@example.com',
              role: ['user'],
              isActif: true,
            }
          ];
          setUsers(mockUsers);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs', error);
        messageApi.error('Erreur lors du chargement des utilisateurs');
        setLoading(false);
      }
    };

    fetchData();
  }, [messageApi]);

  const columns = [
    {
      title: 'Nom d\'utilisateur',
      dataIndex: 'prenom',
      key: 'prenom',
      sorter: (a: User, b: User) => a.prenom.localeCompare(b.prenom),
      render: (text: string) => (
        <Space>
          <UserOutlined />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Manager', value: 'manager' },
        { text: 'Utilisateur', value: 'user' }
      ],
      // Corriger la signature de onFilter pour être compatible avec Ant Design
      onFilter: (value: React.Key | boolean, record: User) => {
        if (typeof value === 'string') {
          return record.role.includes(value);
        }
        return false;
      },
      render: (role: string[]) => {
        if (!role || role.length === 0) return <Text>-</Text>;
        
        let color = '';
        switch (role[0]) {
          case 'admin':
            color = '#1890ff';
            break;
          case 'manager':
            color = '#52c41a';
            break;
          default:
            color = '#faad14';
        }
        return <Text style={{ color }}>{role[0].toUpperCase()}</Text>;
      }
    },
    {
      title: 'Statut',
      dataIndex: 'isActif',
      key: 'isActif',
      filters: [
        { text: 'Actif', value: true },
        { text: 'Inactif', value: false }
      ],
      // Corriger la signature de onFilter pour être compatible avec Ant Design
      onFilter: (value: React.Key | boolean, record: User) => {
        return record.isActif === (value === true || value === 'true');
      },
      render: (isActif: boolean) => {
        return (
          <Text
            type={isActif ? 'success' : 'danger'}
            style={{ fontWeight: 'bold' }}
          >
            {isActif ? 'ACTIF' : 'INACTIF'}
          </Text>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: User) => (
        <Space size="middle">
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
            onClick={() => handleDelete(record._id!)}
          >
            Supprimer
          </Button>
        </Space>
      ),
    },
  ];

  const filteredUsers = users.filter(
    user =>
      user.prenom.toLowerCase().includes(searchText.toLowerCase()) ||
      user.nom.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const showModal = () => {
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentUser(defaultUser);
    form.resetFields();
  };

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setIsEditing(true);
    form.setFieldsValue({
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      role: user.role,
      isActif: user.isActif
    });
    showModal();
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      cancelText: 'Non',
      onOk: () => {
        setUsers(prev => prev.filter(user => user._id !== id));
        messageApi.success('Utilisateur supprimé avec succès');
      }
    });
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (isEditing) {
        // Mise à jour d'un utilisateur existant
        const updatedUser = {
          ...currentUser,
          ...values
        };
        setUsers(prev =>
          prev.map(user => (user._id === currentUser._id ? updatedUser : user))
        );
        messageApi.success('Utilisateur mis à jour avec succès');
      } else {
        // Création d'un nouvel utilisateur
        const newUser: User = {
          id: Date.now().toString(),
          ...values
        };
        setUsers(prev => [...prev, newUser]);
        messageApi.success('Utilisateur ajouté avec succès');
      }
      handleCancel();
    });
  };

  return (
    <Layout>
      {contextHolder}
      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={2}>Gestion des Utilisateurs</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showModal}
            >
              Ajouter un utilisateur
            </Button>
          </div>
          <Input
            placeholder="Rechercher un utilisateur..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearchChange}
            style={{ marginBottom: 16 }}
          />
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredUsers}
              rowKey="_id"
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '30']
              }}
            />
          )}
        </div>

        <Modal
          title={isEditing ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
          open={isModalOpen}
          onOk={handleSubmit}
          onCancel={handleCancel}
          okText={isEditing ? 'Mettre à jour' : 'Ajouter'}
          cancelText="Annuler"
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={defaultUser}
          >
            <Form.Item
              label="Nom d'utilisateur"
              name="username"
              rules={[{ required: true, message: 'Veuillez saisir un nom d\'utilisateur' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nom d'utilisateur" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Veuillez saisir un email' },
                { type: 'email', message: 'Email invalide' }
              ]}
            >
              <Input placeholder="email@exemple.com" />
            </Form.Item>

            {!isEditing && (
              <Form.Item
                label="Mot de passe"
                name="password"
                rules={[{ required: true, message: 'Veuillez saisir un mot de passe' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Mot de passe" />
              </Form.Item>
            )}

            <Form.Item
              label="Rôle"
              name="role"
              rules={[{ required: true, message: 'Veuillez sélectionner un rôle' }]}
            >
              <Select placeholder="Sélectionner un rôle">
                <Option value="admin">Administrateur</Option>
                <Option value="manager">Gestionnaire</Option>
                <Option value="user">Utilisateur</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Statut"
              name="status"
              rules={[{ required: true, message: 'Veuillez sélectionner un statut' }]}
            >
              <Select placeholder="Sélectionner un statut">
                <Option value="active">Actif</Option>
                <Option value="inactive">Inactif</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}
