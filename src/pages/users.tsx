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
  Select,
  message,
  Spin,
  Tag
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  KeyOutlined
} from '@ant-design/icons';
import type { User, CreateUser, UpdateUser } from '../types/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser } from '../services/user';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;


const defaultUser: CreateUser = {
  prenom: '',
  nom: '',
  email: '',
  password: ''
};

export default function Users() {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetPasswordForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const {id} = useAuthUser() as {id: string};

  // Requête pour récupérer la liste des utilisateurs
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getUsers
  });

  // Mutation pour créer un nouvel utilisateur
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      messageApi.success('Utilisateur ajouté avec succès');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCancel();
    },
    onError: (error) => {
      console.error('Erreur lors de la création de l\'utilisateur', error);
      messageApi.error('Erreur lors de la création de l\'utilisateur');
    }
  });

  // Mutation pour mettre à jour un utilisateur
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUser }) => updateUser(id, data),
    onSuccess: () => {
      messageApi.success('Utilisateur mis à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCancel();
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour de l\'utilisateur', error);
      messageApi.error('Erreur lors de la mise à jour de l\'utilisateur');
    }
  });

  // Mutation pour supprimer un utilisateur
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      messageApi.success('Utilisateur supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression de l\'utilisateur', error);
      messageApi.error('Erreur lors de la suppression de l\'utilisateur');
    }
  });

  // Mutation pour réinitialiser le mot de passe
  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { password: string } }) => 
      updateUser(id, { password: data.password }),
    onSuccess: () => {
      messageApi.success('Mot de passe réinitialisé avec succès');
      setIsResetPasswordModalOpen(false);
      resetPasswordForm.resetFields();
    },
    onError: (error) => {
      console.error('Erreur lors de la réinitialisation du mot de passe', error);
      messageApi.error('Erreur lors de la réinitialisation du mot de passe');
    }
  });

  const columns = [
    {
      title: 'Nom d\'utilisateur',
      dataIndex: 'prenom',
      key: 'prenom',
      sorter: (a: User, b: User) => a.prenom.localeCompare(b.prenom),
      render: (_: string, record: User) => (
        <Space>
          <UserOutlined />
          <span>{record.prenom} {record.nom}</span>
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
      onFilter: (value: React.Key | boolean, record: User) => {
        if (typeof value === 'string' && record.role) {
          return record.role.includes(value);
        }
        return false;
      },
      render: (role: string[] | undefined) => {
        if (!role || role.length === 0) return <Text>-</Text>;
        
        let color = '';
        let text = '';
        switch (role[0]) {
          case 'admin':
            color = '#1890ff';
            text = 'ADMIN';
            break;
          case 'manager':
            color = '#52c41a';
            text = 'MANAGER';
            break;
          default:
            color = '#faad14';
            text = 'UTILISATEUR';
        }
        return <Tag color={color}>{text}</Tag>;
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
      onFilter: (value: React.Key | boolean, record: User) => {
        return record.isActif === (value === true || value === 'true');
      },
      render: (isActif: boolean) => {
        return (
          <Tag color={isActif ? 'success' : 'error'} style={{ fontWeight: 'bold' }}>
            {isActif ? 'ACTIF' : 'INACTIF'}
          </Tag>
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
            icon={<KeyOutlined />}
            size="small"
            onClick={() => showResetPasswordModal(record)}
          >
            Mot de passe
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

  const filteredUsers = users && Array.isArray(users) ? users.filter(
    (user: User) =>
      user.prenom.toLowerCase().includes(searchText.toLowerCase()) ||
      user.nom.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase())
  ) : [];

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
    setCurrentUser(null);
    form.resetFields();
  };

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setIsEditing(true);
    form.setFieldsValue({
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      role: user.role && user.role.length > 0 ? user.role[0] : 'user',
      isActif: user.isActif
    });
    showModal();
  };
  
  const showResetPasswordModal = (user: User) => {
    setCurrentUser(user);
    setIsResetPasswordModalOpen(true);
    resetPasswordForm.resetFields();
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      cancelText: 'Non',
      onOk: () => {
        deleteUserMutation.mutate(id);
      }
    });
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (isEditing && currentUser && currentUser._id) {
        // Mise à jour d'un utilisateur existant
        const updateData: UpdateUser = {
          prenom: values.prenom,
          nom: values.nom,
          email: values.email,
          role: [values.role],
          isActif: values.isActif === 'active'
        };
        updateUserMutation.mutate({ id: currentUser._id, data: updateData });
      } else {
        // Création d'un nouvel utilisateur
        const newUser: CreateUser = {
          prenom: values.prenom,
          nom: values.nom,
          email: values.email,
          password: values.password
        };
        createUserMutation.mutate(newUser);
      }
    });
  };
  
  const handleResetPassword = () => {
    resetPasswordForm.validateFields().then(values => {
      if (currentUser && currentUser._id) {
        resetPasswordMutation.mutate({
          id: currentUser._id,
          data: { password: values.password }
        });
      }
    });
  };

  return (
    <Layout>
      {contextHolder}
      <Content style={{ padding: '24px' }}>
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
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredUsers.filter(user => user._id !== id)}
              rowKey="_id"
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '30']
              }}
            />
          )}
        </div>

        {/* Modal d'ajout/modification d'utilisateur */}
        <Modal
          title={isEditing ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
          open={isModalOpen}
          onOk={handleSubmit}
          onCancel={handleCancel}
          okText={isEditing ? 'Mettre à jour' : 'Ajouter'}
          cancelText="Annuler"
          confirmLoading={createUserMutation.isPending || updateUserMutation.isPending}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={defaultUser}
          >
            <Form.Item
              label="Prénom"
              name="prenom"
              rules={[{ required: true, message: 'Veuillez saisir un prénom' }]}
            >
              <Input placeholder="Prénom" />
            </Form.Item>

            <Form.Item
              label="Nom"
              name="nom"
              rules={[{ required: true, message: 'Veuillez saisir un nom' }]}
            >
              <Input placeholder="Nom" />
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
              name="isActif"
              rules={[{ required: true, message: 'Veuillez sélectionner un statut' }]}
            >
              <Select placeholder="Sélectionner un statut">
                <Option value="active">Actif</Option>
                <Option value="inactive">Inactif</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal de réinitialisation de mot de passe */}
        <Modal
          title="Réinitialiser le mot de passe"
          open={isResetPasswordModalOpen}
          onOk={handleResetPassword}
          onCancel={() => {
            setIsResetPasswordModalOpen(false);
            resetPasswordForm.resetFields();
          }}
          okText="Réinitialiser"
          cancelText="Annuler"
          confirmLoading={resetPasswordMutation.isPending}
        >
          <Form
            form={resetPasswordForm}
            layout="vertical"
          >
            <Form.Item
              label="Nouveau mot de passe"
              name="password"
              rules={[
                { required: true, message: 'Veuillez saisir un nouveau mot de passe' },
                { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nouveau mot de passe" />
            </Form.Item>

            <Form.Item
              label="Confirmer le mot de passe"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Veuillez confirmer le mot de passe' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Les deux mots de passe ne correspondent pas'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Confirmer le mot de passe" />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}
