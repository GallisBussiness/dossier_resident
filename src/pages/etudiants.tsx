import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import type { Etudiant } from '../types/etudiant';
import { 
  Layout, 
  Typography, 
  Button, 
  Row, 
  Col, 
  Card, 
  Input, 
  Avatar, 
  Modal, 
  Form, 
  DatePicker, 
  Divider, 
  message, 
  Spin, 
  Space, 
  Empty 
} from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, HomeOutlined, GlobalOutlined } from '@ant-design/icons';
const { Content } = Layout;

const defaultEtudiant: Etudiant = {
  prenom: '',
  nom: '',
  email: '',
  tel: '',
  dateDeNaissance: '',
  lieuDeNaissance: '',
  nationalite: '',
  avatar: 'https://via.placeholder.com/150',
  ncs: ''
};

export default function Etudiants() {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEtudiant, setCurrentEtudiant] = useState<Etudiant>(defaultEtudiant);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    // Simuler le chargement des données depuis une API
    const fetchEtudiants = async () => {
      try {
        // À remplacer par un appel API réel
        setTimeout(() => {
          const mockData: Etudiant[] = [
            {
              _id: '1',
              prenom: 'Jean',
              nom: 'Dupont',
              email: 'jean.dupont@example.com',
              tel: '123456789',
              dateDeNaissance: '1998-05-15',
              lieuDeNaissance: 'Paris',
              nationalite: 'Française',
              avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
              ncs: 'NCS123456'
            },
            {
              _id: '2',
              prenom: 'Marie',
              nom: 'Martin',
              email: 'marie.martin@example.com',
              tel: '987654321',
              dateDeNaissance: '1999-07-22',
              lieuDeNaissance: 'Lyon',
              nationalite: 'Française',
              avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
              ncs: 'NCS654321'
            }
          ];
          setEtudiants(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erreur lors du chargement des étudiants", error);
        messageApi.error("Erreur lors du chargement des étudiants");
        setLoading(false);
      }
    };

    fetchEtudiants();
  }, [messageApi]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredEtudiants = etudiants.filter(etudiant => 
    etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    etudiant.ncs.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (etudiant?: Etudiant) => {
    if (etudiant) {
      setCurrentEtudiant(etudiant);
      setIsEditing(true);
    } else {
      setCurrentEtudiant(defaultEtudiant);
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (name: string, value: string) => {
    setCurrentEtudiant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Ici vous implémenteriez la logique pour sauvegarder dans la base de données
    if (isEditing) {
      // Mise à jour d'un étudiant existant
      setEtudiants(prev => prev.map(e => e._id === currentEtudiant._id ? currentEtudiant : e));
      messageApi.success('Étudiant mis à jour avec succès');
    } else {
      // Ajout d'un nouvel étudiant
      const newEtudiant = {
        ...currentEtudiant,
        _id: Date.now().toString() // Génération d'un ID temporaire
      };
      setEtudiants(prev => [...prev, newEtudiant]);
      messageApi.success('Étudiant ajouté avec succès');
    }
    handleCloseDialog();
  };

  const handleDeleteEtudiant = (email: string) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cet étudiant ?',
      content: 'Cette action est irréversible.',
      okText: 'Oui',
      cancelText: 'Non',
      onOk: () => {
        setEtudiants(prev => prev.filter(e => e.email !== email));
        messageApi.success('Étudiant supprimé avec succès');
      }
    });
  };

  // La notification est gérée par Ant Design Message API

  return (
    <Layout>
      {contextHolder}
      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Typography.Title level={2}>
              Gestion des Étudiants
            </Typography.Title>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => handleOpenDialog()}
            >
              Ajouter un étudiant
            </Button>
          </Col>
          <div style={{ marginBottom: 24 }}>
            <Input
              placeholder="Rechercher un étudiant..."
              value={searchTerm}
              onChange={handleSearchChange}
              prefix={<SearchOutlined />}
              size="large"
              style={{ width: '100%' }}
            />
          </div>
        </Row>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '48px 0' }}>
            <Spin />
          </div>
        ) : filteredEtudiants.length > 0 ? (
          <Row gutter={16}>
            {filteredEtudiants.map((etudiant) => (
              <Col xs={24} sm={12} md={8} key={etudiant._id}>
                <Card
                  hoverable
                  style={{ marginBottom: 16 }}
                >
                  <Card.Meta
                    avatar={<Avatar src={etudiant.avatar} />}
                    title={<Typography.Text strong>{etudiant.prenom} {etudiant.nom}</Typography.Text>}
                    description={<Typography.Text>{etudiant.ncs}</Typography.Text>}
                  />
                  <Divider />
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <Typography.Text strong><MailOutlined /> Email: </Typography.Text>
                      <Typography.Text>{etudiant.email}</Typography.Text>
                    </div>
                    <div>
                      <Typography.Text strong><PhoneOutlined /> Téléphone: </Typography.Text>
                      <Typography.Text>{etudiant.tel}</Typography.Text>
                    </div>
                    <div>
                      <Typography.Text strong><CalendarOutlined /> Date de naissance: </Typography.Text>
                      <Typography.Text>{etudiant.dateDeNaissance}</Typography.Text>
                    </div>
                    <div>
                      <Typography.Text strong><HomeOutlined /> Lieu de naissance: </Typography.Text>
                      <Typography.Text>{etudiant.lieuDeNaissance}</Typography.Text>
                    </div>
                    <div>
                      <Typography.Text strong><GlobalOutlined /> Nationalité: </Typography.Text>
                      <Typography.Text>{etudiant.nationalite}</Typography.Text>
                    </div>
                  </Space>
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => handleOpenDialog(etudiant)}
                    >
                      Modifier
                    </Button>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteEtudiant(etudiant.email)}
                    />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Card style={{ textAlign: 'center', padding: '48px 0' }}>
            <Empty description="Aucun étudiant trouvé" />
          </Card>
        )}

        {/* Formulaire d'ajout/modification */}
        <Modal
          title={isEditing ? 'Modifier un étudiant' : 'Ajouter un étudiant'}
          open={openDialog}
          onCancel={handleCloseDialog}
          width={800}
          footer={[
            <Button key="cancel" onClick={handleCloseDialog}>
              Annuler
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              onClick={handleSubmit}
            >
              {isEditing ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          ]}
        >
          <Form layout="vertical">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item 
                  label="Prénom" 
                  required
                >
                  <Input 
                    placeholder="Prénom de l'étudiant"
                    value={currentEtudiant.prenom}
                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item 
                  label="Nom" 
                  required
                >
                  <Input 
                    placeholder="Nom de l'étudiant"
                    value={currentEtudiant.nom}
                    onChange={(e) => handleInputChange('nom', e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item 
                  label="Email" 
                  required
                >
                  <Input 
                    type="email"
                    placeholder="email@exemple.com"
                    value={currentEtudiant.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item 
                  label="Téléphone" 
                  required
                >
                  <Input 
                    placeholder="+123 456 7890"
                    value={currentEtudiant.tel}
                    onChange={(e) => handleInputChange('tel', e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item 
                  label="Date de naissance" 
                  required
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    placeholder="Sélectionner une date"
                    value={currentEtudiant.dateDeNaissance ? dayjs(currentEtudiant.dateDeNaissance) : null}
                    onChange={(_, dateString) => handleInputChange('dateDeNaissance', dateString as string)}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item 
                  label="Lieu de naissance" 
                  required
                >
                  <Input 
                    placeholder="Ville de naissance"
                    value={currentEtudiant.lieuDeNaissance}
                    onChange={(e) => handleInputChange('lieuDeNaissance', e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item 
                  label="Nationalité" 
                  required
                >
                  <Input 
                    placeholder="Nationalité"
                    value={currentEtudiant.nationalite}
                    onChange={(e) => handleInputChange('nationalite', e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item 
                  label="NCS (Numéro Carte Scolaire)" 
                  required
                >
                  <Input 
                    placeholder="Numéro de carte"
                    value={currentEtudiant.ncs}
                    onChange={(e) => handleInputChange('ncs', e.target.value)}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

      </Content>
    </Layout>
  );
}
