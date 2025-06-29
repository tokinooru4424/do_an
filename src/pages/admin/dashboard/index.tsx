import dynamic from 'next/dynamic'
import useBaseHook from '@src/hooks/BaseHook';

const Layout = dynamic(() => import('@src/layouts/Admin'), { ssr: false })

const Dashboard = () => {
  const { redirect } = useBaseHook();

  return <>
    <div className="content">

    </div>
  </>
}

Dashboard.Layout = (props) => {
  const { t } = useBaseHook();
  return <Layout
    title={t('pages:dashboard.index.title')}
    description={t('pages:dashboard.index.description')}
    {...props}
  />
}

Dashboard.permissions = {
  'dashboard': "R",
};

export default Dashboard
