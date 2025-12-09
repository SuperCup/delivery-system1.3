import { useState, useEffect } from 'react'
import { Form, Input, Button, message, Typography } from 'antd'
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, CheckCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../../services/auth-service'
import loginBg from '../../assets/loginbg.png'
import styles from './login-page.module.css'

const { Text } = Typography

type LoginFormValues = {
  username: string
  password: string
  remember?: boolean
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm<LoginFormValues>()
  const [loading, setLoading] = useState(false)

  // 如果已登录，跳转到首页
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      navigate('/home', { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true)
    try {
      await AuthService.login(values.username, values.password)
      message.success('登录成功')
      // 跳转到首页
      navigate('/home', { replace: true })
    } catch (error) {
      const err = error as Error
      message.error(err.message || '登录失败，请检查账号密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.backgroundSection} style={{ backgroundImage: `url(${loginBg})` }}></div>
      <div className={styles.loginBox}>
        {/* 头部Logo区域 */}
        <div className={styles.loginHeader}>
          <div className={styles.logoSection}>
            <div className={styles.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* 购物袋主体 */}
                <path
                  d="M6 8L7 20H17L18 8H6Z"
                  fill="#FF6B35"
                />
                {/* 购物袋提手 */}
                <path
                  d="M9 6V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V6"
                  stroke="#FF6B35"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* 白色对勾 */}
                <path
                  d="M9 12L11 14L15 10"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>精明购</span>
              <span className={styles.brandSubtitle}>SmartGo.AI</span>
            </div>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.platformSection}>
            <span className={styles.platformName}>交付中台</span>
            <span className={styles.platformSubtitle}>AI智能交付中心</span>
          </div>
        </div>

        {/* 登录表单 */}
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          initialValues={{
            username: 'admin',
            password: '123456',
            remember: false,
          }}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              suffix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              className={styles.inputField}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              className={styles.inputField}
            />
          </Form.Item>

          <div style={{ marginBottom: 16, textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              请使用员工账号密码进行登录
            </Text>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className={styles.loginButton}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
