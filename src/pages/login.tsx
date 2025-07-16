import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import type { LoginUser } from "../types/user";
import { useMutation } from "@tanstack/react-query";
import { login } from "../services/user";
import useSignIn from 'react-auth-kit/hooks/useSignIn';


export default function Login() {
  const navigate = useNavigate();
  const signIn = useSignIn();
  const [form] = Form.useForm();
  const {mutate: loginMutation, isPending} = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
        if (data) {
            signIn({
            auth:{
                token: data.token,
                type: 'localstorage',
            },
            userState: {
                id: data.id,
            },
            });
            navigate("/dashboard");
          } else {
            message.error("Login failed");
          }
    },
    onError: () => {
      message.error("Login failed");
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
      backgroundColor: '#f0f2f5' 
    }}>
      <div style={{ 
        maxWidth: '420px', 
        width: '100%', 
        padding: '40px', 
        backgroundColor: '#fff', 
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
           <img src="img/logo.png" alt="logo" style={{ width: '80px', height: '80px' }} />
          </div>
          <h2 style={{ 
            marginTop: '24px', 
            fontSize: '28px', 
            fontWeight: 'bold'
          }}>CROUS-RESIDENCE</h2>
          <p style={{ 
            marginTop: '8px', 
            color: 'rgba(0, 0, 0, 0.45)',
            marginBottom: '32px'
          }}>
            Gestion des résidences universitaires
          </p>
        </div>
        
        <Form
          name="login"
          form={form}
          initialValues={{ remember: true }}
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Veuillez saisir votre email!" }]}
          >
            <Input 
              prefix={<UserOutlined />}
              placeholder="Email" 
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Veuillez saisir votre mot de passe!" }]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Mot de passe"
            />
          </Form.Item>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            marginBottom: '24px'
          }}>
            <a href="#">
              Mot de passe oublié?
            </a>
          </div>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
              loading={isPending}
            >
              Se Connecter
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', fontSize: '14px', color: 'rgba(0, 0, 0, 0.45)', marginTop: '24px' }}>
          <p>© {new Date().getFullYear()} CROUS-RESIDENCE. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}
