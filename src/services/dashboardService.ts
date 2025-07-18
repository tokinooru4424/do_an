import Base from './baseService';

class DashboardService extends Base {
  getSummary = async () => {
    return this.request({
      url: '/api/v1/dashboard/summary',
      method: 'GET',
    });
  };
}

export default () => new DashboardService(); 