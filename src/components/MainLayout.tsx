import { useState } from 'react';
import { Layout, Menu, Button, theme, Avatar, Typography, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { Link, useLocation, Route, Routes } from 'react-router';
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
  SettingOutlined
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

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { token } = theme.useToken();

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
      // Logique de déconnexion à implémenter
      console.log('Déconnexion');
      // Rediriger vers la page de connexion
      window.location.href = '/';
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
          <Avatar shape="square" size={collapsed ? 40 : 64} src="/img/logo.png" />
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ borderRight: 0 }}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: <Link to="/dashboard">Tableau de bord</Link>,
            },
            {
              key: 'users',
              icon: <TeamOutlined />,
              label: <Link to="/dashboard/users">Utilisateurs</Link>,
            },
            {
              key: 'campuses',
              icon: <BankOutlined />,
              label: <Link to="/dashboard/campuses">Campus</Link>,
            },
            {
              key: 'pavilions',
              icon: <BankOutlined />,
              label: <Link to="/dashboard/pavilions">Pavillons</Link>,
            },
            {
              key: 'chambres',
              icon: <HomeOutlined />,
              label: <Link to="/dashboard/chambres">Chambres</Link>,
            },
            {
              key: 'dossiers',
              icon: <FileOutlined />,
              label: <Link to="/dashboard/dossiers">Dossiers</Link>,
            },
            {
              key: 'annee_universitaire',
              icon: <CalendarOutlined />,
              label: <Link to="/dashboard/annee_universitaire">Année Universitaire</Link>,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 16px', 
          background: token.colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
            arrow
          >
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span style={{ marginLeft: 8 }}>
                <Text strong>Admin</Text>
              </span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '0', minHeight: 280, background: token.colorBgContainer }}>
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
         </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
