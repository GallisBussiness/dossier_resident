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
  Tag,
  Empty,
  message,
  Breadcrumb,
  Statistic,
  Divider
} from 'antd';
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getCampusById } from '../services/campus';
import { getPavillonByCampusId } from '../services/pavillon';

import type { Pavillon } from '../types/pavillon';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export default function CampusDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // Fetch campus details
  const { 
    data: campus, 
    isLoading: isLoadingCampus,
    error: campusError 
  } = useQuery({
    queryKey: ['campus', id],
    queryFn: () => getCampusById(id!),
    enabled: !!id,
  });

  // Fetch pavilions for this campus
  const { 
    data: pavilions, 
    isLoading: isLoadingPavilions,
    error: pavilionsError 
  } = useQuery({
    queryKey: ['pavilions', id],
    queryFn: () => getPavillonByCampusId(id!),
    enabled: !!id,
  });

  // Show error message if any
  useEffect(() => {
    if (campusError) {
      messageApi.error('Erreur lors du chargement des détails du campus');
    }
    if (pavilionsError) {
      messageApi.error('Erreur lors du chargement des pavillons');
    }
  }, [campusError, pavilionsError, messageApi]);

  // Table columns for pavilions
  const pavilionColumns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      render: (text: string, record: Pavillon) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/dashboard/pavilions/${record._id}`)}
          style={{ padding: 0, fontWeight: 500 }}
        >
          {text}
        </Button>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || '—'
    }
  ];

  // Loading state
  if (isLoadingCampus) {
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
  if (!campus && !isLoadingCampus) {
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
              description="Campus introuvable" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Button 
              type="primary" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/dashboard/campuses')}
              style={{ marginTop: 16 }}
            >
              Retour à la liste des campus
            </Button>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout>
      {contextHolder}
      <Content style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
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
              title: campus?.nom || 'Détails du campus'
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
                {campus?.nom}
              </Typography.Title>
              <Typography.Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                Détails du campus et ses pavillons
              </Typography.Text>
            </Col>
          </Row>
        </div>

        {/* Campus Details */}
        <Row gutter={[24, 24]}>
          {/* Campus Information */}
          <Col xs={24} lg={16}>
            <Card 
              title={<span><BankOutlined /> Informations du Campus</span>}
              bordered={false}
              style={{ 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                borderRadius: '8px',
                height: '100%'
              }}
            >
              <Descriptions bordered column={{ xs: 1, sm: 2 }} layout="vertical">
                <Descriptions.Item label="Nom">{campus?.nom}</Descriptions.Item>
                <Descriptions.Item label="Adresse">{campus?.adresse || '—'}</Descriptions.Item>
                <Descriptions.Item label="Latitude">
                  {campus?.latitude ? (
                    <Tag color="blue" icon={<EnvironmentOutlined />}>
                      {campus.latitude}
                    </Tag>
                  ) : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Longitude">
                  {campus?.longitude ? (
                    <Tag color="blue" icon={<EnvironmentOutlined />}>
                      {campus.longitude}
                    </Tag>
                  ) : '—'}
                </Descriptions.Item>
              </Descriptions>

              {(campus?.latitude && campus?.longitude) && (
                <div style={{ marginTop: 24 }}>
                  <Paragraph>
                    <a 
                      href={`https://www.google.com/maps?q=${campus.latitude},${campus.longitude}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button type="primary" icon={<EnvironmentOutlined />}>
                        Voir sur Google Maps
                      </Button>
                    </a>
                  </Paragraph>
                </div>
              )}
            </Card>
          </Col>

          {/* Campus Statistics */}
          <Col xs={24} lg={8}>
            <Card 
              title={<span><HomeOutlined /> Statistiques</span>}
              style={{ 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                borderRadius: '8px'
              }}
            >
              <Spin spinning={isLoadingPavilions}>
                <Statistic 
                  title="Nombre de pavillons" 
                  value={pavilions?.length || 0} 
                  prefix={<BankOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Spin>
            </Card>
          </Col>
        </Row>

        {/* Pavilions List */}
        <div style={{ marginTop: 24 }}>
          <Divider orientation="left">
            <Title level={4} style={{ margin: 0 }}>
              <BankOutlined /> Pavillons
            </Title>
          </Divider>

          {isLoadingPavilions ? (
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
          ) : pavilions && pavilions.length > 0 ? (
            <div style={{ 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}>
              <Table 
                columns={pavilionColumns} 
                dataSource={pavilions} 
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
                  Aucun pavillon trouvé pour ce campus
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
