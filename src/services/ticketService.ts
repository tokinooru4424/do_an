import Base from './baseService';

const name = 'tickets';

class TicketService extends Base {
  index = async (filter: any) => {
    return this.request({
      url: `/api/v1/${name}`,
      method: 'GET',
      data: filter,
    });
  };

  create = async (data: any) => {
    return this.request({
      url: `/api/v1/${name}`,
      method: 'POST',
      data: data,
    });
  };

  detail = async (data: any) => {
    return this.request({
      url: `/api/v1/${name}/:id`,
      method: 'GET',
      data: data,
    });
  };

  edit = async (data: any) => {
    return this.request({
      url: `/api/v1/${name}/:id`,
      method: 'PUT',
      data: data,
    });
  };

  delete = async (data: any) => {
    return this.request({
      url: `/api/v1/${name}`,
      method: 'DELETE',
      data: data,
    });
  };

  destroy = async (data: any) => {
    return this.request({
      url: `/api/v1/${name}/:id`,
      method: 'DELETE',
      data: data,
    });
  };

  ticketInfo = async (data: any) => {
    return this.request({
      url: `/api/v1/${name}/ticket-info`,
      method: 'GET',
      data: data,
    });
  };

  getBookedSeats = async (data: any) => {
    return this.request({
      url: `/api/v1/${name}/get-booked-seats`,
      method: 'GET',
      data: data,
    });
  };

  getTicketHistory = async (data: any) => {
    console.log("data", data);
    return this.request({
      url: `/api/v1/tickets/history`,
      method: 'GET',
      data: data,
    });
  };
}

export default () => new TicketService(); 