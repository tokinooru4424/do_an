import React from 'react';
import Head from 'next/head';
import { Row, Col, Layout } from 'antd'
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()
const { Content } = Layout;

const Login = (props: any) => {
  return <Layout>
    <Head>
      <title>{props.title || publicRuntimeConfig.TITLE}</title>
      <meta property="og:title" content={props.title || publicRuntimeConfig.TITLE} />
      <meta property="og:description" content={props.description || publicRuntimeConfig.DESCRIPTION} />
      <link rel="shortcut icon" type="image/png" href={publicRuntimeConfig.FAVICON} />
      <meta property="og:image" content={publicRuntimeConfig.LOGO} />
      <link rel="apple-touch-icon" href={publicRuntimeConfig.LOGO}></link>
    </Head>
    <div id="login">
      <Content className="content">
        <Row>
          <Col md={{span: 12}}>
            <div className="background-login"></div>
          </Col>
          <Col md={12} xs={24}>
            <Row gutter={[24, 0]}>
              <Col md={{span: 12, offset: 6}} xs={24}>
                {props.children}
              </Col>
            </Row>
          </Col>
        </Row>
      </Content>
    </div>
  </Layout>
}

export default Login;
