interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roleId: number;
  phoneNumber: string;
  createdAt: Date;
}

interface Role {
  id: number;
  name: string;
  description: string;
  parentId: number;
  key: string;
  createdAt: Date;
}

interface Cinema {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FilterParam {
  column: any,
  confirm: Function,
  ref: any
}

interface Hall {
  id: number;
  name: string;
  cinemaId: number;
  cinema_name: string;
  description: string;
  format: number;
  totalSeat: number;
  seatInRow: number;
  seatInColumn: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ShowTime {
  id: number;
  movieId: number;
  hallId: number;
  startTime: Date;
  endTime: Date;
  format: number;
  language?: string;
  subtitle?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: number;
  director?: string;
  cast?: string;
  format: number;
  language?: string;
  description?: string;
  trailer?: string;
  realeaseDate?: Date;
  rating?: number;
  status?: number;
  image?: string;
  banner?: string;
  createdAt: Date;
  updatedAt: Date;
}