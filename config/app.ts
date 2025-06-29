import Env from '@core/Env';

export default {
  MAIL_SENDER: {
    host: Env.get("MAIL_HOST", "smtp.office365.com"),
    port: Env.get("MAIL_PORT", 587),
    secure: Env.get("MAIL_SECURE", 0) != 0 ? true : false,
    user: Env.get("MAIL_USER", "tuyensinh-app@hactech.edu.vn"),
    password: Env.get("MAIL_PASS", "Thanhmai061191"),
    from: Env.get("MAIL_FROM", "CDN-BK"),
  },
  ENABLE_PROCESS_QUEUE: Env.get("ENABLE_PROCESS_QUEUE", 0),
  ENABLE_ARENA: Env.get("ENABLE_ARENA", 0),
};
