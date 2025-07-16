import { useState } from 'react';
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Spin,
  Select,
  Tabs,
  Alert
} from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  CalendarOutlined,
  DollarOutlined,
  PieChartOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getAnneeUniversitaires, getAnneeUniversitaireActive } from '../services/anneeUniversitaire';
import { getEtudiants } from '../services/etudiant';
// import { getDossierByAnneeUniversitaireId } from '../services/dossier';

const { Content } = Layout;
const { Title, Text } = Typography;


// Define TabKey type before using it
type TabKey = 'general' | 'etudiants' | 'hebergement' | 'finances';

export default function Dashboard() {
  const [selectedAnneeId, setSelectedAnneeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('general');

  const { data: anneeUniversitaires = [], isLoading: loadingAnnees } = useQuery({
    queryKey: ['anneeUniversitaires'],
    queryFn: getAnneeUniversitaires
  });

  const { data: anneeUniversitaireActive } = useQuery({
    queryKey: ['activeAnnee'],
    queryFn: getAnneeUniversitaireActive,
    enabled: !!selectedAnneeId
  });

  const { data: etudiants } = useQuery({
    queryKey: ['etudiants'],
    queryFn: getEtudiants,
    enabled: !!selectedAnneeId
  });

  // const { data: dossiers } = useQuery({
  //   queryKey: ['dossiers'],
  //   queryFn: () => getDossierByAnneeUniversitaireId(selectedAnneeId!),
  //   enabled: !!selectedAnneeId
  // });


  const handleAnneeChange = (value: string) => {
    setSelectedAnneeId(value);
  };


  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <Row gutter={[16, 16]}>
              <Card className="stat-card">
                <Statistic
                  title="Étudiants total"
                  value={etudiants?.length}
                  prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">
                    <span style={{ color: '#52c41a' }}>+{etudiants?.length}</span> nouveaux ce mois
                    {' '} | {' '}
                    <span style={{ color: '#f5222d' }}>-{etudiants?.length}</span> départs
                  </Text>
                </div>
              </Card>
          </Row>
        );
      case 'etudiants':
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Répartition par genre" className="card-shadow">
                <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                       {etudiants && <Statistic
                          title="Hommes"
                          value={etudiants?.filter(etudiant => etudiant.genre === 'H').length}
                          suffix={`(${Math.round(etudiants?.filter(etudiant => etudiant.genre === 'H').length / etudiants?.length * 100)}%)`}
                          valueStyle={{ color: '#1890ff' }}
                        />}
                      </Col>
                      <Col span={12}>
                       {etudiants && <Statistic
                          title="Femmes"
                          value={etudiants?.filter(etudiant => etudiant.genre === 'F').length}
                          suffix={`(${Math.round(etudiants?.filter(etudiant => etudiant.genre === 'F').length / etudiants?.length * 100)}%)`}
                          valueStyle={{ color: '#eb2f96' }}
                        />}
                      </Col>
                    </Row>
                   {etudiants && <Progress
                      percent={Math.round(etudiants?.filter(etudiant => etudiant.genre === 'H').length / etudiants?.length * 100)}
                      status="active"
                      strokeColor={{
                        from: '#1890ff',
                        to: '#eb2f96',
                      }}
                      style={{ marginTop: 30 }}
                    />}
                    <Text type="secondary">Total: {etudiants?.length} étudiants</Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        );
      case 'hebergement':
        return (
          <Row gutter={[16, 16]}>
           
          </Row>
        );
      case 'finances':
        return (
          <Row gutter={[16, 16]}>
           
          </Row>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <Content style={{ padding: '24px'}}>
        {/* Dashboard header with year selection */}
        <div className="dashboard-header" style={{ 
          marginBottom: 24,
          background: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)',
          borderRadius: '8px',
          padding: '24px',
          color: 'white'
        }}>
          <Row align="middle" justify="space-between" gutter={[16, 16]}>
            <Col>
              <Title level={2} style={{ color: 'white', margin: 0 }}>Tableau de bord</Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                Statistiques et indicateurs de performance
              </Text>
            </Col>
            <Col>
              <Select
                loading={loadingAnnees}
                style={{ width: 240, marginRight: 16 }}
                placeholder="Sélectionner une année universitaire"
                onChange={handleAnneeChange}
                value={selectedAnneeId || undefined}
              >
                {anneeUniversitaires.map(annee => (
                  <Select.Option key={annee._id} value={annee._id}>
                    {annee.isActif ? `${annee.nom} (Actif)` : annee.nom}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>
        
        {/* Current selection info */}
        <div style={{ marginBottom: 24 }}>
          <Alert
            message={
              <span>
                <CalendarOutlined /> Statistiques pour l'année universitaire: <strong>{anneeUniversitaireActive?.nom}</strong>
              </span>
            }
            type="info"
            showIcon={false}
          />
        </div>
        
        {/* Dashboard tabs */}
        <Tabs 
          defaultActiveKey="general" 
          onChange={(key: string) => setActiveTab(key as TabKey)}
          className="dashboard-tabs"
          style={{ marginBottom: 24 }}
        >
          <Tabs.TabPane tab={<span><PieChartOutlined /> Général</span>} key="general" />
          <Tabs.TabPane tab={<span><TeamOutlined /> Étudiants</span>} key="etudiants" />
          <Tabs.TabPane tab={<span><HomeOutlined /> Hébergement</span>} key="hebergement" />
          <Tabs.TabPane tab={<span><DollarOutlined /> Finances</span>} key="finances" />
        </Tabs>
        
        {loadingAnnees ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* Render tab content */}
            {renderTabContent()}
            
          </>
        )}
        
        {/* Add custom styles */}
        <style>{`
          .dashboard-header {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
          .dashboard-tabs .ant-tabs-nav {
            margin-bottom: 16px;
          }
          .stat-card {
            height: 100%;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
            border-radius: 8px;
            transition: all 0.3s;
          }
          .stat-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
            transform: translateY(-2px);
          }
          .card-shadow {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
            border-radius: 8px;
          }
        `}</style>
      </Content>
    </Layout>
  );
}
