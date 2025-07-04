import React, { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Input, Row, Col } from 'antd';
import useBaseHook from '@src/hooks/BaseHook';
import useSWR from 'swr';
import movieService from '@root/src/services/movieService';
import hallService from '@root/src/services/hallService';
import constant from 'config/constant';

const { Option } = Select;

const ShowTimeForm = ({ form, isEdit = false }: { form: any; isEdit?: boolean }) => {
    const { t, getData } = useBaseHook();
    const [movieFormat, setMovieFormat] = useState<number | undefined>();
    const [hallFormat, setHallFormat] = useState<number | undefined>();
    const [movieDuration, setMovieDuration] = useState<number | undefined>();
    const [hallDisplayFormat, setHallDisplayFormat] = useState<string | undefined>();

    // Fetch movies select2
    const { data: dataM } = useSWR('movieData', () =>
        movieService().select2({ pageSize: -1 })
    );
    const movies = getData(dataM, 'data', []);

    // Fetch halls select2
    const { data: dataH } = useSWR('hallData', () =>
        hallService().withAuth().select2({ pageSize: -1 })
    );
    const halls = getData(dataH, 'data', []);

    // Khi chọn movie
    const handleMovieChange = (movieId: number) => {
        const movie = movies.find((m: any) => m.value === movieId);
        setMovieFormat(movie?.format);
        setMovieDuration(movie?.duration);
        form.setFieldsValue({ format: movie?.format }); // auto set format
    };

    // Thêm effect này để đồng bộ movieDuration khi movieId thay đổi (kể cả khi load lại form)
    useEffect(() => {
        const movieId = form.getFieldValue('movieId');
        if (movieId) {
            const movie = movies.find((m: any) => m.value === movieId);
            setMovieDuration(movie?.duration);
            form.setFieldsValue({ duration: movie?.duration }); // ĐỒNG BỘ GIÁ TRỊ VỚI FORM
        } else {
            setMovieDuration(undefined);
            form.setFieldsValue({ duration: undefined });
        }
    }, [form, movies, form.getFieldValue('movieId')]);

    // Khi chọn hall
    const handleHallChange = (hallId: number) => {
        const hall = halls.find((h: any) => h.value === hallId);
        setHallFormat(hall?.hallFormat);
        setHallDisplayFormat(hall ? constant.hallFormat?.[String(hall.hallFormat)] : undefined);
        // Tự động set cinemaId và cinemaName
        if (hall && hall.cinemaId) {
            form.setFieldsValue({ cinemaId: hall.cinemaId, cinemaName: hall.cinemaName });
        } else {
            form.setFieldsValue({ cinemaId: undefined, cinemaName: '' });
        }
    };

    // Đồng bộ khi vào edit hoặc khi halls thay đổi
    useEffect(() => {
        const hallId = form.getFieldValue('hallId');
        if (hallId) {
            handleHallChange(hallId);
        } else {
            setHallFormat(undefined);
            setHallDisplayFormat(undefined);
            form.setFieldsValue({ cinemaId: undefined, cinemaName: '' });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form, halls]);

    // Khi chọn startTime, tự động set endTime
    const handleStartTimeChange = (value: any) => {
        const movieId = form.getFieldValue('movieId');
        const movie = movies.find((m: any) => m.value === movieId);
        const duration = movie?.duration || 0;
        if (value && duration) {
            const endTime = value.clone().add(duration, 'minutes');
            form.setFieldsValue({ endTime });
        } else {
            form.setFieldsValue({ endTime: undefined });
        }
    };

    // Khi chọn movie, nếu đã có startTime thì tự động set endTime
    useEffect(() => {
        const movieId = form.getFieldValue('movieId');
        const startTime = form.getFieldValue('startTime');
        const movie = movies.find((m: any) => m.value === movieId);
        const duration = movie?.duration || 0;
        if (startTime && duration) {
            const endTime = startTime.clone().add(duration, 'minutes');
            form.setFieldsValue({ endTime });
        } else {
            form.setFieldsValue({ endTime: undefined });
        }
    }, [form, movies, form.getFieldValue('movieId'), form.getFieldValue('startTime')]);

    // Đồng bộ hallDisplayFormat từ hallFormat trong form (khi vào edit hoặc khi hallFormat thay đổi)
    useEffect(() => {
        const hallFormatValue = form.getFieldValue('hallFormat');
        if (typeof hallFormatValue !== 'undefined') {
            setHallDisplayFormat(constant.hallFormat?.[String(hallFormatValue)] || '');
        }
    }, [form, form.getFieldValue('hallFormat')]);

    return (
        <Row gutter={[24, 0]}>
            <Col md={12}>
                <Form.Item name="movieId" label={t('pages:showTimes.form.movie')} rules={[{ required: true, message: t('messages:form.required', { name: t('pages:showTimes.form.movie') }) }]}>
                    <Select placeholder={t('pages:showTimes.form.movie')} showSearch optionFilterProp="label" onChange={handleMovieChange}>
                        {movies.map((item: any) => (
                            <Option value={item.value} key={item.value}>{item.label}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
            <Col md={12}>
                <Form.Item name="duration" label={t('pages:movies.form.duration')} rules={[]}>
                    <Input disabled placeholder={t('pages:movies.form.duration')} addonAfter="phút" />
                </Form.Item>
            </Col>
            <Col md={12}>
                <Form.Item name="hallId" label={t('pages:showTimes.form.hall')} rules={[{ required: true, message: t('messages:form.required', { name: t('pages:showTimes.form.hall') }) }]}>
                    <Select placeholder={t('pages:showTimes.form.hall')} showSearch optionFilterProp="label" onChange={handleHallChange}>
                        {halls.map((item: any) => (
                            <Option value={item.value} key={item.value}>{item.label}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
            <Col md={12}>
                <Form.Item label={t('pages:showTimes.form.hallFormat')}>
                    <Input value={hallDisplayFormat} disabled placeholder={t('pages:showTimes.form.hallFormat')} />
                </Form.Item>
            </Col>
            <Col md={24}>
                <Form.Item
                    name="cinemaName"
                    label={t('pages:showTimes.form.cinema')}
                >
                    <Input disabled placeholder={t('pages:showTimes.form.cinema')} />
                </Form.Item>
            </Col>
            <Col md={12}>
                <Form.Item name="startTime" label={t('pages:showTimes.form.startTime')} rules={[{ required: true, message: t('messages:form.required', { name: t('pages:showTimes.form.startTime') }) }]}>
                    <DatePicker showTime style={{ width: '100%' }} placeholder={t('pages:showTimes.form.startTime')} format="DD/MM/YYYY HH:mm" onChange={handleStartTimeChange} />
                </Form.Item>
            </Col>
            <Col md={12}>
                <Form.Item name="endTime" label={t('pages:showTimes.form.endTime')} rules={[{ required: true, message: t('messages:form.required', { name: t('pages:showTimes.form.endTime') }) }]}>
                    <DatePicker showTime style={{ width: '100%' }} placeholder={t('pages:showTimes.form.endTime')} format="DD/MM/YYYY HH:mm" disabled />
                </Form.Item>
            </Col>
            <Col md={24}>
                <Form.Item name="format" label={t('pages:showTimes.form.format')} rules={[{ required: true, message: t('messages:form.required', { name: t('pages:showTimes.form.format') }) }]}>
                    <Select placeholder={t('pages:showTimes.form.format')}>
                        {Object.entries(constant.hallFormat).map(([value, label]) => (
                            <Option value={Number(value)} key={value}>{label}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
            <Col md={24}>
                <Form.Item name="language" label={t('pages:showTimes.form.language')} rules={[{ required: true, message: t('messages:form.required', { name: t('pages:showTimes.form.language') }) }]}>
                    <Input placeholder={t('pages:showTimes.form.language')} />
                </Form.Item>
            </Col>
            <Col md={24}>
                <Form.Item name="subtitle" label={t('pages:showTimes.form.subtitle')} rules={[{ required: true, message: t('messages:form.required', { name: t('pages:showTimes.form.subtitle') }) }]}>
                    <Input placeholder={t('pages:showTimes.form.subtitle')} />
                </Form.Item>
            </Col>
        </Row>
    );
};

export default ShowTimeForm; 