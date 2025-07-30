import { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, Avatar, Typography, Dropdown, Badge, Tooltip, Breadcrumb, Input } from 'antd';
import type { MenuProps } from 'antd';
import { Link, useLocation, Route, Routes, useNavigate } from 'react-router';
  import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  BankOutlined,
  HomeOutlined,
  FileOutlined,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  SearchOutlined,
  ToolOutlined
} from '@ant-design/icons';
import Dossiers from '../pages/dossiers';
import Chambres from '../pages/chambres';
import AnneeUniversitaire from '../pages/annee_universitaire';
import Users from '../pages/users';
import Campuses from '../pages/campuses';
import CampusDetail from '../pages/campusDetail';
import Pavilions from '../pages/pavilions';
import PavillonDetail from '../pages/pavillonDetail';
import ChambreDetail from '../pages/chambreDetail';
import Dashboard from '../pages/dashboard';
import DossierDetail from '../pages/dossierDetail';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import Equipements from '../pages/equipements';
import { getAnneeUniversitaireActive } from '../services/anneeUniversitaire';
import { useQuery } from '@tanstack/react-query';
const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [pageTitle, setPageTitle] = useState('Tableau de bord');
  const [breadcrumbs, setBreadcrumbs] = useState<{title: string, path: string}[]>([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const signOut = useSignOut();
  const { token } = theme.useToken();

  const { data: activeAnnee } = useQuery({
    queryKey: ['activeAnnee'],
    queryFn: getAnneeUniversitaireActive
  });  
  
  // Mettre à jour le titre et les breadcrumbs en fonction de la route active
  useEffect(() => {
    const path = location.pathname.split('/').filter(Boolean);
    const currentPage = path[path.length - 1];
    
    let title = 'Tableau de bord';
    const crumbs = [{title: 'Dashboard', path: '/dashboard'}];
    
    switch(currentPage) {
      case 'users':
        title = 'Gestion des Utilisateurs';
        crumbs.push({title: 'Utilisateurs', path: '/dashboard/users'});
        break;
      case 'campuses':
        title = 'Gestion des Campus';
        crumbs.push({title: 'Campus', path: '/dashboard/campuses'});
        break;
      case 'pavilions':
        title = 'Gestion des Pavillons';
        crumbs.push({title: 'Pavillons', path: '/dashboard/pavilions'});
        break;
      case 'chambres':
        title = 'Gestion des Chambres';
        crumbs.push({title: 'Chambres', path: '/dashboard/chambres'});
        break;
      case 'dossiers':
        title = 'Gestion des Dossiers';
        crumbs.push({title: 'Dossiers', path: '/dashboard/dossiers'});
        break;
      case 'annee_universitaire':
        title = 'Années Universitaires';
        crumbs.push({title: 'Années', path: '/dashboard/annee_universitaire'});
        break;
      case 'equipements':
        title = 'Gestion des Équipements';
        crumbs.push({title: 'Équipements', path: '/dashboard/equipements'});
        break;
    }
    
    setPageTitle(title);
    setBreadcrumbs(crumbs);
  }, [location]);

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mon Profil',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Paramètres',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Déconnexion',
    },
  ];

  // Fonction pour traiter les clics du menu utilisateur
  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      signOut();
      navigate('/');
    } else if (key === 'profile') {
      // Redirection vers la page de profil
      console.log('Redirection vers le profil');
    } else if (key === 'settings') {
      // Redirection vers les paramètres
      console.log('Redirection vers les paramètres');
    }
  };
  
  // Notifications factices pour la démo
  const notificationItems: MenuProps['items'] = [
    {
      key: 'notif1',
      label: 'Nouvelle demande de chambre',
      icon: <FileOutlined />,
    },
    {
      key: 'notif2',
      label: 'Maintenance requise chambre B12',
      icon: <HomeOutlined />,
    },
    {
      key: 'notif3',
      label: 'Nouvel utilisateur inscrit',
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'all',
      label: 'Voir toutes les notifications',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        width={240}
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
          zIndex: 10,
          transition: 'all 0.2s ease',
          overflow: 'hidden'
        }}
        theme="light"
      >
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '24px 0',
            transition: 'all 0.3s ease'
          }}
        >
          <Avatar 
            shape="square" 
            size={collapsed ? 40 : 64} 
            src="/img/logo.png" 
            style={{ 
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }} 
          />
          {!collapsed && (
            <Typography.Title 
              level={4} 
              style={{ 
                margin: '0 0 0 12px',
                opacity: collapsed ? 0 : 1,
                transition: 'opacity 0.3s ease',
                color: token.colorPrimary
              }}
            >
              DR/CROUSZ
            </Typography.Title>
          )}
        </div>
        <div className=" text-sm font-bold text-center text-gray-500">
         {activeAnnee?.nom}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ 
            borderRight: 0,
            padding: '8px',
          }}
          items={[
            {
              key: '/dashboard',
              icon: <DashboardOutlined />,
              label: <Link to="/dashboard">Tableau de bord</Link>,
            },
            {
              key: '/dashboard/users',
              icon: <TeamOutlined />,
              label: <Link to="/dashboard/users">Utilisateurs</Link>,
            },
            {
              key: '/dashboard/campuses',
              icon: <BankOutlined />,
              label: <Link to="/dashboard/campuses">Campus</Link>,
            },
            {
              key: '/dashboard/pavilions',
              icon: <BankOutlined />,
              label: <Link to="/dashboard/pavilions">Pavillons</Link>,
            },
            {
              key: '/dashboard/chambres',
              icon: <HomeOutlined />,
              label: <Link to="/dashboard/chambres">Chambres</Link>,
            },
            {
              key: '/dashboard/dossiers',
              icon: <FileOutlined />,
              label: <Link to="/dashboard/dossiers">Dossiers</Link>,
            },
            {
              key: '/dashboard/annee_universitaire',
              icon: <CalendarOutlined />,
              label: <Link to="/dashboard/annee_universitaire">Année</Link>,
            },
            {
              key: '/dashboard/equipements',
              icon: <ToolOutlined />,
              label: <Link to="/dashboard/equipements">Équipements</Link>,
            },
          ]}
        />
        <div 
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '0',
            width: '100%',
            textAlign: 'center',
            padding: '8px',
            opacity: collapsed ? 0 : 0.7,
            transition: 'opacity 0.3s ease'
          }}
        >
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            © {new Date().getFullYear()} DR/CROUSZ
          </Typography.Text>
        </div>
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: token.colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 8px rgba(0, 0, 0, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 9,
          height: '64px',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ 
                fontSize: '16px', 
                width: 48, 
                height: 48,
                borderRadius: '50%',
                marginRight: '12px',
                transition: 'all 0.3s'
              }}
            />
            
            <Breadcrumb 
              items={breadcrumbs.map(crumb => ({
                title: <Link to={crumb.path}>{crumb.title}</Link>
              }))} 
              style={{ marginLeft: '8px' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {searchVisible ? (
              <Input 
                prefix={<SearchOutlined />}
                placeholder="Rechercher..."
                style={{ width: '250px', transition: 'all 0.3s' }}
                autoFocus
                onBlur={() => setSearchVisible(false)}
              />
            ) : (
              <Tooltip title="Rechercher">
                <Button
                  type="text"
                  icon={<SearchOutlined />}
                  onClick={() => setSearchVisible(true)}
                  style={{ 
                    fontSize: '16px', 
                    width: 40, 
                    height: 40,
                    borderRadius: '50%'
                  }}
                />
              </Tooltip>
            )}
            
            <Tooltip title="Notifications">
              <Dropdown
                menu={{ items: notificationItems }}
                placement="bottomRight"
                arrow
                trigger={['click']}
              >
                <Badge count={3} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    style={{ 
                      fontSize: '16px', 
                      width: 40, 
                      height: 40,
                      borderRadius: '50%'
                    }}
                  />
                </Badge>
              </Dropdown>
            </Tooltip>
            
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
              arrow
              trigger={['click']}
            >
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '24px',
                  transition: 'all 0.3s ease',
                  background: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ 
                    backgroundColor: token.colorPrimary,
                    marginRight: '8px' 
                  }}
                />
                <span>
                  <Text strong>Admin</Text>
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <div style={{ 
          padding: '16px 24px',
          background: token.colorBgLayout,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          transition: 'all 0.3s ease'
        }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {pageTitle}
          </Typography.Title>
        </div>
        
        <Content style={{ 
          padding: '24px', 
          margin: '16px',
          minHeight: 280, 
          background: token.colorBgContainer,
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease'
        }}>
         <Routes>
           <Route index element={<Dashboard />} />
           <Route path='users' element={<Users />} />
           <Route path='campuses' element={<Campuses />} />
           <Route path='campusDetail/:id' element={<CampusDetail />} />
           <Route path='pavilions' element={<Pavilions />} />
           <Route path='pavillonDetail/:id' element={<PavillonDetail />} />
           <Route path='dossiers' element={<Dossiers />} />
           <Route path='dossierDetail/:id' element={<DossierDetail />} />
           <Route path='chambres' element={<Chambres />} />
           <Route path='chambreDetail/:id' element={<ChambreDetail />} />
           <Route path='annee_universitaire' element={<AnneeUniversitaire />} />
           <Route path='equipements' element={<Equipements />} />
         </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
