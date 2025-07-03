import React, { useState, useEffect } from 'react';
import dynamic from "next/dynamic";
import useBaseHook from "@src/hooks/BaseHook";
import to from 'await-to-js';
import movieService from '@root/src/services/movieService';
import { Row, Col, Card, Spin, Descriptions, Button, Modal } from "antd";
import { LeftCircleFilled, PlayCircleOutlined } from '@ant-design/icons';
import moment from "moment";
import constant from 'config/constant';

const Layout = dynamic(() => import("@src/layouts/Admin"), { ssr: false });

const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const MovieInfo = ({ movie }) => {
  if (!movie || typeof movie !== 'object' || !movie.title) return <Spin />;
  const [trailerVisible, setTrailerVisible] = useState(false);
  const youtubeId = movie?.trailer ? getYoutubeId(movie.trailer) : null;
  return (
    <Card title="Thông tin phim" bordered={false}>
      <Descriptions column={1}>
        <Descriptions.Item label="Poster">
          {movie.image ? <img src={movie.image} alt="poster" style={{ width: 120, height: 180, objectFit: 'cover' }} /> : 'Không có ảnh'}
        </Descriptions.Item>
        <Descriptions.Item label="Tên phim">{movie.title}</Descriptions.Item>
        <Descriptions.Item label="Thể loại">{movie.genre}</Descriptions.Item>
        <Descriptions.Item label="Thời lượng">{movie.duration ? `${movie.duration} phút` : ''}</Descriptions.Item>
        <Descriptions.Item label="Định dạng">{constant.hallFormat?.[movie.format?.toString()] || movie.format}</Descriptions.Item>
        <Descriptions.Item label="Quốc gia">{movie.country}</Descriptions.Item>
        <Descriptions.Item label="Đạo diễn">{movie.director}</Descriptions.Item>
        <Descriptions.Item label="Diễn viên">{movie.cast}</Descriptions.Item>
        <Descriptions.Item label="Mô tả">{movie.description || "Không có mô tả"}</Descriptions.Item>
        <Descriptions.Item label="Trailer">
          {youtubeId ? (
            <Button icon={<PlayCircleOutlined />} onClick={() => setTrailerVisible(true)}>
              Xem trailer
            </Button>
          ) : (movie.trailer ? <a href={movie.trailer} target="_blank" rel="noopener noreferrer">Xem trailer</a> : '')}
          <Modal
            open={trailerVisible}
            onCancel={() => setTrailerVisible(false)}
            footer={null}
            width={600}
            title="Trailer"
            destroyOnClose
            centered
          >
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Trailer"
              style={{ width: '100%', height: 340, display: 'block', border: 0 }}
            />
          </Modal>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày phát hành">{movie.realeaseDate ? moment(movie.realeaseDate).format("DD/MM/YYYY") : ''}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">{constant.movieStatus?.[movie.status?.toString()] || movie.status}</Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">{movie.createdAt ? moment(movie.createdAt).format("DD/MM/YYYY HH:mm") : ''}</Descriptions.Item>
        <Descriptions.Item label="Banner">
          {movie.banner ? <img src={movie.banner} alt="banner" style={{ width: 240, height: 120, objectFit: 'cover' }} /> : 'Không có banner'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

const View = () => {
  const { t, notify, router } = useBaseHook();
  const { query } = router;
  const [loading, setLoading] = useState(false);
  const [movie, setMovie] = useState<Movie | undefined>();

  const fetchData = async () => {
    if (!query.id) {
      notify(t('errors:9996'), '', 'error');
      return;
    }
    setLoading(true);
    const [movieError, movieData]: [any, any] = await to(
      movieService().withAuth().detail({ id: query.id })
    );
    setLoading(false);
    if (movieError) {
      notify(t(`errors:${movieError.code}`), '', 'error');
      return;
    }
    setMovie(movieData);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="content">
      <Row>
        <Col md={{ span: 24 }}>
          <MovieInfo movie={movie} />
          <div className="text-center" style={{ marginTop: 24 }}>
            <Button onClick={() => router.back()}>
              <LeftCircleFilled /> {t('buttons:back')}
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

View.Layout = (props) => {
  const { t } = useBaseHook();
  return (
    <Layout
      title={t("pages:movies.view.title")}
      description={t("pages:movies.view.description")}
      {...props}
    />
  );
};

View.permissions = {
  "movies": "R"
}

export default View;