import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Spin,
  Button,
  Descriptions,
  Empty,
  message,
  Breadcrumb,
  Statistic,
  Tag
} from 'antd';
import {
  ArrowLeftOutlined,
  HomeOutlined,
  BankOutlined,
  BuildOutlined,
  KeyOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getChambreById } from '../services/chambre';
// Chambre type is used for the query return type

const { Content } = Layout;
const { Title } = Typography;

export default function ChambreDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // Fetch chambre details
  const { 
    data: chambre, 
    isLoading: isLoadingChambre,
    error: chambreError 
  } = useQuery({
    queryKey: ['chambre', id],
    queryFn: () => getChambreById(id!),
    enabled: !!id,
  });

  // Show error message if any
  useEffect(() => {
    if (chambreError) {
      messageApi.error('Erreur lors du chargement des détails de la chambre');
    }
  }, [chambreError, messageApi]);

  // Loading state
  if (isLoadingChambre) {
    return (
      <Layout>
        <Content style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '60vh'
          }}>
            <Spin size="large" />
          </div>
        </Content>
      </Layout>
    );
  }

  // Error state
  if (!chambre && !isLoadingChambre) {
    return (
      <Layout>
        <Content style={{ padding: '32px' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            height: '60vh'
          }}>
            <Empty 
              description="Chambre introuvable" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Button 
              type="primary" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/dashboard/chambres')}
              style={{ marginTop: 16 }}
            >
              Retour à la liste des chambres
            </Button>
          </div>
        </Content>
      </Layout>
    );
  }

  // Get pavillon ID
  const pavillonId = typeof chambre?.pavillonId === 'string' 
    ? chambre.pavillonId 
    : chambre?.pavillonId._id;

  // Get pavillon name
  const pavillonName = typeof chambre?.pavillonId === 'string' 
    ? '—' 
    : chambre?.pavillonId.nom;

  return (
    <Layout>
      {contextHolder}
      <Content style={{ padding: '32px' }}>
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { 
              title: <span><HomeOutlined /> Accueil</span>,
              href: '/dashboard'
            },
            { 
              title: <span><BankOutlined /> Campus</span>,
              href: '/dashboard/campuses'
            },
            { 
              title: <span><BuildOutlined /> Pavillons</span>,
              href: '/dashboard/pavilions'
            },
            { 
              title: <span><KeyOutlined /> Chambres</span>,
              href: '/dashboard/chambres'
            },
            { 
              title: chambre?.nom ? `Chambre ${chambre.nom}` : 'Détails de la chambre'
            }
          ]}
          style={{ marginBottom: 16 }}
        />

        {/* Header */}
        <div className="page-header" style={{ 
          marginBottom: 32,
          background: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          color: 'white',
          position: 'relative'
        }}>
          
          <Row justify="space-between" align="middle">
            <Col>
              <Typography.Title level={2} style={{ color: 'white', margin: 0 }}>
                Chambre {chambre?.nom}
              </Typography.Title>
              <Typography.Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                Détails de la chambre
              </Typography.Text>
            </Col>
          </Row>
        </div>

        {/* Chambre Details */}
        <Row gutter={[24, 24]}>
          {/* Chambre Information */}
          <Col xs={24} lg={16}>
            <Card 
              title={<span><KeyOutlined /> Informations de la Chambre</span>}
              style={{ 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                borderRadius: '8px',
                height: '100%'
              }}
            >
              <Descriptions bordered column={{ xs: 1, sm: 2 }} layout="vertical">
                <Descriptions.Item label="Numéro">
                  <Tag color="blue" icon={<KeyOutlined />}>
                    {chambre?.nom}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Places">
                  <Tag color="green" icon={<UserOutlined />}>
                    {chambre?.places || 0} place{chambre?.places !== 1 ? 's' : ''}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Pavillon">
                  <Button 
                    type="link" 
                    onClick={() => navigate(`/dashboard/pavillonDetail/${pavillonId}`)}
                    style={{ padding: 0 }}
                    disabled={typeof chambre?.pavillonId === 'string'}
                  >
                    <span><BuildOutlined /> {pavillonName}</span>
                  </Button>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Chambre Statistics */}
          <Col xs={24} lg={8}>
            <Card 
              title={<span><UserOutlined /> Occupation</span>}
              style={{ 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                borderRadius: '8px'
              }}
            >
              <Statistic 
                title="Places disponibles" 
                value={chambre?.places || 0} 
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              
              {/* Note: In a real application, you would have a query here to get the current occupants */}
              <div style={{ marginTop: 16 }}>
                <Title level={5}>Statut</Title>
                <Tag color="green">Disponible</Tag>
                {/* This would be dynamic based on occupancy data */}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Additional information could be added here, such as:
            - Current occupants
            - Reservation history
            - Maintenance records
            - etc. */}
      </Content>
    </Layout>
  );
}
