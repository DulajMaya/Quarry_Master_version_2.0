const fs = require('fs').promises;
const path = require('path');

class FileUploadService {
    async saveFile(file, folderName, identifier) {
        try {
            if (!file) return null;

            const uploadDir = `uploads/${folderName}`;
            const filename = `${folderName}_${identifier}_${Date.now()}${path.extname(file.originalname)}`;
            const filepath = path.join(uploadDir, filename);

            // Move file to permanent location
            await fs.rename(file.path, filepath);

            // Return the relative path for database storage
            return filepath;
        } catch (error) {
            console.error('Error saving file:', error);
            throw new Error('Failed to save file');
        }
    }

    async deleteFile(filepath) {
        try {
            if (filepath) {
                await fs.unlink(filepath);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }
}

module.exports = new FileUploadService();