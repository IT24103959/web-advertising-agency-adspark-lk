package com.service.adspark.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import javax.imageio.ImageIO;

@Component
@Slf4j
public class FileStorageUtil {

    @Value("${file.upload.dir:./uploads}")
    private String uploadDir;

    @Value("${file.upload.max-size:5242880}") // 5MB default
    private long maxFileSize;

    public String saveFile(MultipartFile file, String subDirectory) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum limit: " + formatFileSize(maxFileSize));
        }

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, subDirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + "." + extension;

        Path filePath = uploadPath.resolve(uniqueFilename);

        // Copy file to the target location
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        log.info("File saved: {} ({})", uniqueFilename, formatFileSize(file.getSize()));

        // Return relative path for database storage
        return subDirectory + "/" + uniqueFilename;
    }

    public boolean deleteFile(String relativePath) {
        try {
            Path filePath = Paths.get(uploadDir, relativePath);
            boolean deleted = Files.deleteIfExists(filePath);
            if (deleted) {
                log.info("File deleted: {}", relativePath);
            } else {
                log.warn("File not found for deletion: {}", relativePath);
            }
            return deleted;
        } catch (IOException e) {
            log.error("Error deleting file: {}", relativePath, e);
            return false;
        }
    }

    public boolean fileExists(String relativePath) {
        Path filePath = Paths.get(uploadDir, relativePath);
        return Files.exists(filePath);
    }

    public long getFileSize(String relativePath) {
        try {
            Path filePath = Paths.get(uploadDir, relativePath);
            return Files.size(filePath);
        } catch (IOException e) {
            log.error("Error getting file size: {}", relativePath, e);
            return 0;
        }
    }

    public String getFileExtension(String filename) {
        if (filename != null && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        }
        return "";
    }

    public String getContentType(String filename) {
        String extension = getFileExtension(filename);
        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "bmp" -> "image/bmp";
            case "webp" -> "image/webp";
            case "mp4" -> "video/mp4";
            case "avi" -> "video/avi";
            case "mov" -> "video/mov";
            case "wmv" -> "video/wmv";
            case "mp3" -> "audio/mp3";
            case "wav" -> "audio/wav";
            case "ogg" -> "audio/ogg";
            case "pdf" -> "application/pdf";
            case "doc", "docx" -> "application/msword";
            case "xls", "xlsx" -> "application/vnd.ms-excel";
            case "ppt", "pptx" -> "application/vnd.ms-powerpoint";
            case "txt" -> "text/plain";
            case "html" -> "text/html";
            case "css" -> "text/css";
            case "js" -> "application/javascript";
            case "json" -> "application/json";
            case "xml" -> "application/xml";
            case "zip" -> "application/zip";
            case "rar" -> "application/rar";
            default -> "application/octet-stream";
        };
    }

    public boolean isImageFile(String filename) {
        String extension = getFileExtension(filename);
        return extension.matches("^(jpg|jpeg|png|gif|bmp|webp|svg)$");
    }

    public boolean isVideoFile(String filename) {
        String extension = getFileExtension(filename);
        return extension.matches("^(mp4|avi|mov|wmv|flv|webm|mkv)$");
    }

    public boolean isAudioFile(String filename) {
        String extension = getFileExtension(filename);
        return extension.matches("^(mp3|wav|ogg|flac|aac|wma)$");
    }

    public String formatFileSize(long bytes) {
        if (bytes < 1024)
            return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }

    public ImageDimensions getImageDimensions(MultipartFile file) {
        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image != null) {
                return new ImageDimensions(image.getWidth(), image.getHeight());
            }
        } catch (IOException e) {
            log.error("Error reading image dimensions", e);
        }
        return new ImageDimensions(0, 0);
    }

    public static class ImageDimensions {
        public final int width;
        public final int height;

        public ImageDimensions(int width, int height) {
            this.width = width;
            this.height = height;
        }
    }

    public String getPublicUrl(String relativePath) {
        return "/api/assets/files/" + relativePath;
    }

    public Path getAbsolutePath(String relativePath) {
        return Paths.get(uploadDir, relativePath);
    }
}