import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import BaseController from './BaseController';

console.log('[UploadController] File loaded');

export default class UploadController extends BaseController {
    async upload() {
        const req = this.request;
        console.log('[UploadController.upload] called');
        console.log('this:', this);
        console.log('this.request:', this.request);
        console.log('this.request.body:', this.request?.body);
        console.log('this.request.file:', this.request?.file);
        console.log('req.body:', req.body);
        console.log('req.query:', req.query);
        try {
            // Lấy folder từ request, mặc định là 'poster'
            const folder = req.body.folder || req.query.folder || 'poster';
            let uploadDir = path.join(process.cwd(), 'public', 'upload', folder);

            // Tạo thư mục nếu chưa có
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Lưu file vào đúng thư mục
            const file = req.file;
            if (!file) {
                return { success: false, message: 'No file uploaded' };
            }
            // Đặt tên file duy nhất
            const ext = path.extname(file.originalname);
            const fileName = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            const filePath = path.join(uploadDir, fileName);
            // Lưu file
            fs.writeFileSync(filePath, file.buffer);
            // Trả về link ảnh
            const fileUrl = `/upload/${folder}/${fileName}`;
            return { success: true, url: fileUrl };
        } catch (err) {
            console.error('[UploadController.upload] error:', err);
            return { success: false, message: 'Upload failed', error: (err as any).message };
        }
    }
} 