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
  Table,
  Space,
  Empty,
  message,
  Breadcrumb,
  Statistic,
  Divider
} from 'antd';
import {
  ArrowLeftOutlined,
  HomeOutlined,
  BankOutlined,
  BuildOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getPavillonById } from '../services/pavillon';
import { getChambreByPavillonId } from '../services/chambre';
import type { Chambre } from '../types/chambre';

const { Content } = Layout;
const { Title } = Typography;

export default function PavillonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // Fetch pavillon details
  const { 
    data: pavillon, 
    isLoading: isLoadingPavillon,
    error: pavillonError 
  } = useQuery({
    queryKey: ['pavillon', id],
    queryFn: () => getPavillonById(id!),
    enabled: !!id,
  });

  // Fetch chambres for this pavillon
  const { 
    data: chambres, 
    isLoading: isLoadingChambres,
    error: chambresError 
  } = useQuery({
    queryKey: ['chambres', id],
    queryFn: () => getChambreByPavillonId(id!),
    enabled: !!id,
  });

  // Show error message if any
  useEffect(() => {
    if (pavillonError) {
      messageApi.error('Erreur lors du chargement des détails du pavillon');
    }
    if (chambresError) {
      messageApi.error('Erreur lors du chargement des chambres');
    }
  }, [pavillonError, chambresError, messageApi]);

  // Calculate total places in the pavillon
  const totalPlaces = chambres?.reduce((acc, chambre) => acc + (chambre.places || 0), 0) || 0;

  // Table columns for chambres
  const chambreColumns = [
    {
      title: 'Numéro',
      dataIndex: 'nom',
      key: 'nom',
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
      title: 'Places',
      dataIndex: 'places',
      key: 'places',
      render: (places: number) => places || '—'
    },
  ];

  // Loading state
  if (isLoadingPavillon) {
    return (
      <Layout>
        <Content style={{ padding: '32px' }}>
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
  if (!pavillon && !isLoadingPavillon) {
    return (
      <Layout>
        <Content style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            height: '60vh'
          }}>
            <Empty 
              description="Pavillon introuvable" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Button 
              type="primary" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/dashboard/pavilions')}
              style={{ marginTop: 16 }}
            >
              Retour à la liste des pavillons
            </Button>
          </div>
        </Content>
      </Layout>
    );
  }

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
              title: pavillon?.nom || 'Détails du pavillon'
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
                {pavillon?.nom}
              </Typography.Title>
              <Typography.Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                Détails du pavillon et ses chambres
              </Typography.Text>
            </Col>
          </Row>
        </div>

        {/* Pavillon Details */}
        <Row gutter={[24, 24]}>
          {/* Pavillon Information */}
          <Col xs={24} lg={16}>
            <Card 
              title={<span><BuildOutlined /> Informations du Pavillon</span>}
              style={{ 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                borderRadius: '8px',
                height: '100%'
              }}
            >
              <Descriptions bordered column={{ xs: 1, sm: 2 }} layout="vertical">
                <Descriptions.Item label="Nom">{pavillon?.nom}</Descriptions.Item>
                <Descriptions.Item label="Campus">
                  <Button 
                    type="link" 
                    onClick={() => navigate(`/dashboard/campusDetail/${pavillon?.campusId._id}`)}
                    style={{ padding: 0 }}
                  >
                    {pavillon?.campusId.nom}
                  </Button>
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={2}>
                  {pavillon?.description || '—'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Pavillon Statistics */}
          <Col xs={24} lg={8}>
            <Card 
              title={<span><HomeOutlined /> Statistiques</span>}
              style={{ 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                borderRadius: '8px'
              }}
            >
              <Spin spinning={isLoadingChambres}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic 
                      title="Nombre de chambres" 
                      value={chambres?.length || 0} 
                      prefix={<HomeOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="Nombre de places" 
                      value={totalPlaces} 
                      prefix={<KeyOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                </Row>
              </Spin>
            </Card>
          </Col>
        </Row>

        {/* Chambres List */}
        <div style={{ marginTop: 24 }}>
          <Divider orientation="left">
            <Title level={4} style={{ margin: 0 }}>
              <HomeOutlined /> Chambres
            </Title>
          </Divider>

          {isLoadingChambres ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              padding: '48px 0',
              borderRadius: '12px',
              background: '#f5f7fa',
              boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.03)',
              minHeight: '200px',
              alignItems: 'center'
            }}>
              <Spin size="large" />
            </div>
          ) : chambres && chambres.length > 0 ? (
            <div style={{ 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}>
              <Table 
                columns={chambreColumns} 
                dataSource={chambres} 
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
                  Aucune chambre trouvée pour ce pavillon
                </span>
              } 
              style={{ 
                padding: '48px 0',
                background: '#f5f7fa',
                borderRadius: '12px',
                boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.03)' 
              }}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </Content>
    </Layout>
  );
}
