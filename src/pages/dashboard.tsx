import { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Row,
  Col,
  Select,
  Card,
  Statistic,
  Progress,
  Table,
  Badge,
  Spin,
  Empty,
  Alert,
  Tabs
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getAnneeUniversitaires, getStatsByAnneeUniversitaireId } from '../services/anneeUniversitaire';
import { 
  HomeOutlined, 
  TeamOutlined, 
  BuildOutlined, 
  BankOutlined,
  PieChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import type { Etudiant } from '../types/etudiant';

const { Content } = Layout;
const { Title, Text } = Typography;

interface ChambreParCampus {
  campus: string;
  chambres: number;
}

interface PavillonData {
  pavillon: string;
  chambres?: number;
  places?: number;
  places_occupees?: number;
}

interface PavillonDetail {
  _id: string;
  nom: string;
  campusId: string | { _id: string; nom: string; };
  description?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ChambreDetail {
  _id: string;
  nom: string;
  pavillonId: PavillonDetail;
  places: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Campus {
  _id: string;
  nom: string;
  adresse: string;
  latitude: string;
  longitude: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  pavillons: PavillonDetail[];
}

interface Dossier {
  _id: string;
  chambreId: ChambreDetail;
  etudiant: Etudiant; 
  etudiantId: string;
  anneeUniversitaireId: {
    _id: string;
    nom: string;
    isActif: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  active: boolean;
  caution: number;
  taux_loyer_mensuelle: number;
  createdAt: string;
  updatedAt: string;
  numero: string;
  __v: number;
}

interface CampusWithPavillons {
  campus: string;
  pavillons: { pavillon: string; chambres: number; }[];
}

interface PlacesPavillonData {
  campus: string;
  pavillons: { pavillon: string; places: number; places_occupees: number; }[];
}

interface StatsData {
  dossiers: Dossier[];
  campus: Campus[];
  chambre_par_campus: ChambreParCampus[];
  chambre_par_pavillon: CampusWithPavillons[];
  total_places_par_pavillon: PlacesPavillonData[];
}

export default function Dashboard() {
  // Fetch année universitaires first
  const { data: anneeUniversitaires = [], isLoading: loadingAnnees } = useQuery({
    queryKey: ['anneeUniversitaires'],
    queryFn: getAnneeUniversitaires
  });
  
  const [selectedAnneeId, setSelectedAnneeId] = useState<string | null>(null);

  // Auto-select first année universitaire if available
  useEffect(() => {
    if (anneeUniversitaires.length > 0 && !selectedAnneeId) {
      // Find active année or use the first one
      const activeAnnee = anneeUniversitaires.find(annee => annee.isActif);
      setSelectedAnneeId(activeAnnee?._id || anneeUniversitaires[0]._id);
    }
  }, [anneeUniversitaires, selectedAnneeId]);

  const { data: stats, isLoading: loadingStats, isError } = useQuery({
    queryKey: ['stats', selectedAnneeId],
    queryFn: async () => {
      const response = await getStatsByAnneeUniversitaireId(selectedAnneeId!);
      return response as unknown as StatsData;
    },
    enabled: !!selectedAnneeId
  });

  console.log(stats);




  const handleAnneeChange = (value: string) => {
    setSelectedAnneeId(value);
  };

  // Calculate total statistics
  const getTotalChambres = () => {
    if (!stats?.chambre_par_campus) return 0;
    return stats.chambre_par_campus.reduce((acc: number, item: ChambreParCampus) => acc + item.chambres, 0);
  };

  const getTotalPlaces = () => {
    if (!stats?.total_places_par_pavillon) return 0;
    return stats.total_places_par_pavillon.reduce((acc: number, campus: PlacesPavillonData) => {
      return acc + campus.pavillons.reduce((pavillonAcc: number, pavillon) => {
        return pavillonAcc + (pavillon.places || 0);
      }, 0);
    }, 0);
  };

  const getTotalPlacesOccupees = () => {
    if (!stats?.total_places_par_pavillon) return 0;
    return stats.total_places_par_pavillon.reduce((acc: number, campus: PlacesPavillonData) => {
      return acc + campus.pavillons.reduce((pavillonAcc: number, pavillon) => {
        return pavillonAcc + (pavillon.places_occupees || 0);
      }, 0);
    }, 0);
  };

  const getOccupationRate = () => {
    const total = getTotalPlaces();
    const occupied = getTotalPlacesOccupees();
    return total > 0 ? Math.round((occupied / total) * 100) : 0;
  };

  // Prepare data for tables
  const chambreParCampusColumns = [
    {
      title: 'Campus',
      dataIndex: 'campus',
      key: 'campus',
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Nombre de chambres',
      dataIndex: 'chambres',
      key: 'chambres',
      render: (chambres: number) => (
        <Badge 
          count={chambres} 
          showZero 
          style={{ 
            backgroundColor: chambres > 0 ? '#52c41a' : '#f5222d',
            fontSize: '14px',
            padding: '0 8px'
          }} 
        />
      )
    },
    {
      title: 'Pourcentage',
      key: 'percentage',
      render: (_: unknown, record: ChambreParCampus) => {
        const total = getTotalChambres();
        const percentage = total > 0 ? Math.round((record.chambres / total) * 100) : 0;
        return <Progress percent={percentage} size="small" status={percentage > 0 ? "active" : "exception"} />
      }
    }
  ];

  const placesParPavillonColumns = [
    {
      title: 'Campus',
      dataIndex: 'campus',
      key: 'campus',
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Pavillon',
      dataIndex: ['pavillon'],
      key: 'pavillon'
    },
    {
      title: 'Places totales',
      dataIndex: ['places'],
      key: 'places'
    },
    {
      title: 'Places occupées',
      dataIndex: ['places_occupees'],
      key: 'places_occupees'
    },
    {
      title: 'Taux d\'occupation',
      key: 'occupation',
      render: (_: unknown, record: PavillonData) => {
        const rate = record.places && record.places > 0 
          ? Math.round(((record.places_occupees || 0) / record.places) * 100) 
          : 0;
        
        let status: "success" | "exception" | "active" | "normal" = "normal";
        if (rate >= 90) status = "exception";
        else if (rate >= 70) status = "active";
        else if (rate > 0) status = "success";
        
        return <Progress percent={rate} size="small" status={status} />
      }
    }
  ];

  // Flatten the data for the places par pavillon table
  const getPlacesParPavillonData = () => {
    if (!stats?.total_places_par_pavillon) return [];
    
    return stats.total_places_par_pavillon.flatMap((campus: PlacesPavillonData) => 
      campus.pavillons.map((pavillon) => ({
        key: `${campus.campus}-${pavillon.pavillon}`,
        campus: campus.campus,
        pavillon: pavillon.pavillon,
        places: pavillon.places || 0,
        places_occupees: pavillon.places_occupees || 0
      }))
    );
  };

  return (
    <Layout>
      <Content style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>
        {/* Dashboard header with year selection */}
        <div className="dashboard-header" style={{ 
          marginBottom: 24,
          background: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)',
          borderRadius: '8px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
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
        
        {isError && (
          <Alert
            message="Erreur de chargement"
            description="Impossible de charger les statistiques. Veuillez réessayer plus tard."
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {loadingStats ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Chargement des statistiques...</div>
          </div>
        ) : !stats ? (
          <Empty 
            description="Aucune donnée disponible. Veuillez sélectionner une année universitaire."
            style={{ margin: '40px 0' }}
          />
        ) : (
          <>
            {/* Key Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={6}>
                <Card hoverable style={{ borderRadius: '8px', height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }}>
                  <Statistic 
                    title="Nombre de dossiers" 
                    value={stats.dossiers?.length || 0}
                    prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card hoverable style={{ borderRadius: '8px', height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }}>
                  <Statistic 
                    title="Nombre de chambres" 
                    value={getTotalChambres()}
                    prefix={<HomeOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card hoverable style={{ borderRadius: '8px', height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }}>
                  <Statistic 
                    title="Places disponibles" 
                    value={getTotalPlaces() - getTotalPlacesOccupees()}
                    prefix={<BuildOutlined style={{ color: '#fa8c16' }} />}
                    valueStyle={{ color: '#fa8c16' }}
                    suffix={`/ ${getTotalPlaces()}`}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card hoverable style={{ borderRadius: '8px', height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }}>
                  <Statistic 
                    title="Taux d'occupation" 
                    value={getOccupationRate()}
                    prefix={<BankOutlined style={{ color: '#722ed1' }} />}
                    valueStyle={{ color: '#722ed1' }}
                    suffix="%"
                  />
                  <Progress 
                    percent={getOccupationRate()} 
                    status={getOccupationRate() > 90 ? "exception" : "active"} 
                    showInfo={false} 
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': getOccupationRate() > 90 ? '#f5222d' : '#52c41a',
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Campus Statistics with Charts */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} lg={12}>
                <Card 
                  title={<><BankOutlined /> Chambres par campus</>} 
                  style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }}
                >
                  <Tabs
                    defaultActiveKey="table"
                    items={[
                      {
                        key: 'table',
                        label: 'Tableau',
                        children: (
                          <Table 
                            dataSource={stats.chambre_par_campus} 
                            columns={chambreParCampusColumns} 
                            pagination={false}
                            rowKey="campus"
                          />
                        ),
                      },
                      {
                        key: 'chart',
                        label: 'Graphique',
                        children: (
                          <div style={{ height: 300, marginTop: 16 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={stats.chambre_par_campus}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="campus" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`${value} chambres`, 'Nombre']} />
                                <Legend />
                                <Bar 
                                  dataKey="chambres" 
                                  name="Nombre de chambres" 
                                  fill="#1890ff" 
                                  radius={[4, 4, 0, 0]}
                                  animationDuration={1500}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ),
                      },
                      {
                        key: 'pie',
                        label: 'Camembert',
                        children: (
                          <div style={{ height: 300, marginTop: 16 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={stats.chambre_par_campus}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={true}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="chambres"
                                  nameKey="campus"
                                  label={({ name, percent }) => `${name}: ${(percent! * 100).toFixed(0)}%`}
                                  animationDuration={1500}
                                >
                                  {stats.chambre_par_campus?.map((_, index) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={[
                                        '#1890ff', '#52c41a', '#fa8c16', '#722ed1', 
                                        '#eb2f96', '#faad14', '#a0d911', '#13c2c2'
                                      ][index % 8]} 
                                    />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} chambres`, 'Nombre']} />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        ),
                      },
                    ]}
                  />
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card 
                  title={<><PieChartOutlined /> Taux d'occupation par pavillon</>} 
                  style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }}
                >
                  <div style={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getPlacesParPavillonData()}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 'dataMax']} />
                        <YAxis type="category" dataKey="pavillon" width={120} />
                        <Tooltip 
                          formatter={(value, name) => {
                            return [value, name === 'places' ? 'Places totales' : 'Places occupées'];
                          }}
                          labelFormatter={(label) => `Pavillon: ${label}`}
                        />
                        <Legend />
                        <Bar 
                          dataKey="places" 
                          name="Places totales" 
                          fill="#8884d8" 
                          stackId="a"
                          animationDuration={1500}
                        />
                        <Bar 
                          dataKey="places_occupees" 
                          name="Places occupées" 
                          fill="#82ca9d" 
                          stackId="b"
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Detailed Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              
              <Col xs={24} lg={12}>
                <Card 
                  title={<><LineChartOutlined /> Répartition des dossiers</>} 
                  style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }}
                >
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Hommes', value: Math.round(stats.dossiers?.reduce((acc, dossier) => acc + (dossier.etudiant?.genre === 'H' ? 1 : 0), 0)) || 0 },
                            { name: 'Femmes', value: Math.round(stats.dossiers?.reduce((acc, dossier) => acc + (dossier.etudiant?.genre === 'F' ? 1 : 0), 0)) || 0 },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent! * 100).toFixed(0)}%`}
                          animationDuration={1500}
                        >
                          <Cell key="cell-0" fill="#0088FE" />
                          <Cell key="cell-1" fill="#FF8042" />
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} étudiants`, 'Nombre']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
            </Row>
            
            {/* Table View */}
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Card 
                  title={<><HomeOutlined /> Places par pavillon</>} 
                  style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }}
                >
                  <Tabs
                    defaultActiveKey="table"
                    items={[
                      {
                        key: 'table',
                        label: 'Tableau',
                        children: (
                          <Table 
                            dataSource={getPlacesParPavillonData()} 
                            columns={placesParPavillonColumns} 
                            pagination={{ pageSize: 5 }}
                            rowKey="key"
                          />
                        ),
                      },
                      {
                        key: 'chart',
                        label: 'Graphique',
                        children: (
                          <div style={{ height: 400, marginTop: 16 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={getPlacesParPavillonData().map(item => ({
                                  ...item,
                                  taux: item.places > 0 ? Math.round((item.places_occupees / item.places) * 100) : 0
                                }))}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="pavillon" />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                                <Tooltip />
                                <Legend />
                                <Line 
                                  yAxisId="left"
                                  type="monotone" 
                                  dataKey="places" 
                                  name="Places totales" 
                                  stroke="#8884d8" 
                                  activeDot={{ r: 8 }}
                                  animationDuration={1500}
                                />
                                <Line 
                                  yAxisId="left"
                                  type="monotone" 
                                  dataKey="places_occupees" 
                                  name="Places occupées" 
                                  stroke="#82ca9d" 
                                  animationDuration={1500}
                                />
                                <Line 
                                  yAxisId="right"
                                  type="monotone" 
                                  dataKey="taux" 
                                  name="Taux d'occupation (%)" 
                                  stroke="#ff7300" 
                                  animationDuration={1500}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ),
                      },
                    ]}
                  />
                </Card>
              </Col>
            </Row>
           
          </>
        )}
      </Content>
    </Layout>
  );
}
