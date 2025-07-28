import { Form, Input, Button, message, Typography, Spin, Divider, Card } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import type { LoginUser } from "../types/user";
import { useMutation } from "@tanstack/react-query";
import { login } from "../services/user";
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { useEffect } from 'react';
import useAuth from 'react-auth-kit/hooks/useIsAuthenticated';

const { Title, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const signIn = useSignIn();
  const [form] = Form.useForm();
  const isAuth = useAuth();

  // Animation to show content after initial loading
  useEffect(() => {
    if (isAuth) {
      navigate('/dashboard');
    }
  }, [isAuth, navigate]);

  const {mutate: loginMutation, isPending} = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
        if (data) {
            // Show success message
            message.success("Connexion réussie");
            
            signIn({
              auth:{
                  token: data.token,
                  type: 'localstorage',
              },
              userState: {
                  id: data.id,
              },
            });
            
            // Add small delay before navigation for better UX
            setTimeout(() => {
              navigate("/dashboard");
            }, 500);
          } else {
            message.error("Échec de connexion");
          }
    },
    onError: (error) => {
      console.error("Login error:", error);
      message.error("Identifiants incorrects ou serveur indisponible");
    },
  });



  const handleSubmit = (values: LoginUser) => {
    loginMutation(values);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: 0.2,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 2px, transparent 2px)',
        backgroundSize: '30px 30px',
        pointerEvents: 'none'
      }} />
      
      {isPending ? (
        <div style={{ textAlign: 'center', color: 'white' }}>
          <Spin size="large" />
          <Text style={{ display: 'block', marginTop: 16, color: 'white' }}>Chargement...</Text>
        </div>
      ) : (
        <Card
          style={{ 
            maxWidth: '420px', 
            width: '100%',
            margin: '0 16px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            border: 'none',
            opacity: isPending ? 0 : 1,
            transform: `translateY(${isPending ? '20px' : '0'})`,
            transition: 'opacity 0.5s ease, transform 0.5s ease'
          }}
          bodyStyle={{ padding: '40px' }}
        >
          <div style={{ textAlign: 'center' }}>
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'center',
                transition: 'transform 0.3s ease'
              }}
              className="logo-container"
            >
              <img 
                src="img/logo.png" 
                alt="logo" 
                style={{ 
                  width: '90px', 
                  height: '90px',
                  filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))',
                  transition: 'transform 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
            </div>
            
            <Title 
              level={2} 
              style={{ 
                marginTop: '16px', 
                fontSize: '28px',
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #1890ff, #52c41a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              CROUS-RESIDENCE
            </Title>
            
            <Text 
              style={{ 
                fontSize: '16px',
                color: 'rgba(0, 0, 0, 0.65)',
                display: 'block',
                marginBottom: '32px'
              }}
            >
              Gestion des résidences universitaires
            </Text>
          </div>
          
          <Form
            name="login"
            form={form}
            initialValues={{ remember: true }}
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <div style={{ opacity: isPending ? 0 : 1, transition: 'opacity 0.5s ease 0.2s' }}>
              <Form.Item
                name="username"
                rules={[{ required: true, message: "Veuillez saisir votre email!" }]}
              >
                <Input 
                  prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                  placeholder="Email" 
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </div>
            
            <div style={{ opacity: isPending ? 0 : 1, transition: 'opacity 0.5s ease 0.3s' }}>
              <Form.Item
                name="password"
                rules={[{ required: true, message: "Veuillez saisir votre mot de passe!" }]}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                  placeholder="Mot de passe"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </div>

            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                marginBottom: '24px',
                opacity: isPending ? 0 : 1, 
                transition: 'opacity 0.5s ease 0.4s'
              }}
            >
              <a href="#" style={{ color: '#1890ff', fontWeight: 500 }}>
                Mot de passe oublié?
              </a>
            </div>

            <div style={{ opacity: isPending ? 0 : 1, transition: 'opacity 0.5s ease 0.5s' }}>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block
                  loading={isPending}
                  icon={<LoginOutlined />}
                  style={{ 
                    height: '46px',
                    borderRadius: '8px',
                    background: 'linear-gradient(90deg, #1890ff, #52c41a)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.4)',
                    fontSize: '16px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(24, 144, 255, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.4)';
                  }}
                >
                  Se Connecter
                </Button>
              </Form.Item>
            </div>
          </Form>
          
          <Divider style={{ margin: '24px 0 16px', opacity: isPending ? 0 : 1, transition: 'opacity 0.5s ease 0.6s' }}>
            <Text type="secondary" style={{ fontSize: '14px' }}>ou</Text>
          </Divider>
          
          <div style={{ textAlign: 'center', marginBottom: '16px', opacity: isPending ? 0 : 1, transition: 'opacity 0.5s ease 0.7s' }}>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Besoin d'aide? <a href="#" style={{ fontWeight: 500 }}>Contactez-nous</a>
            </Text>
          </div>
          
          <div style={{ textAlign: 'center', fontSize: '14px', color: 'rgba(0, 0, 0, 0.45)', marginTop: '24px', opacity: isPending ? 0 : 1, transition: 'opacity 0.5s ease 0.8s' }}>
            <p>© {new Date().getFullYear()} CROUS-RESIDENCE. Tous droits réservés.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
