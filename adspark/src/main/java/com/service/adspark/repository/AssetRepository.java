package com.service.adspark.repository;


import com.service.adspark.model.entity.Asset;
import com.service.adspark.model.enums.AssetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    List<Asset> findByUserId(Long userId);

    List<Asset> findByType(AssetType type);

    List<Asset> findByIsPublic(Boolean isPublic);

    Optional<Asset> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT a FROM Asset a WHERE a.name LIKE %:name%")
    List<Asset> findByNameContaining(@Param("name") String name);

    @Query("SELECT a FROM Asset a WHERE a.tags LIKE %:tag%")
    List<Asset> findByTagsContaining(@Param("tag") String tag);

    @Query("SELECT a FROM Asset a WHERE " +
            "(:name IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:description IS NULL OR LOWER(a.description) LIKE LOWER(CONCAT('%', :description, '%'))) AND " +
            "(:type IS NULL OR a.type = :type) AND " +
            "(:tags IS NULL OR LOWER(a.tags) LIKE LOWER(CONCAT('%', :tags, '%'))) AND " +
            "(:isPublic IS NULL OR a.isPublic = :isPublic) AND " +
            "(:fileType IS NULL OR LOWER(a.fileType) LIKE LOWER(CONCAT('%', :fileType, '%'))) AND " +
            "(:userId IS NULL OR a.user.id = :userId) AND " +
            "(:minFileSize IS NULL OR a.fileSize >= :minFileSize) AND " +
            "(:maxFileSize IS NULL OR a.fileSize <= :maxFileSize) AND " +
            "(:minWidth IS NULL OR a.width >= :minWidth) AND " +
            "(:maxWidth IS NULL OR a.width <= :maxWidth) AND " +
            "(:minHeight IS NULL OR a.height >= :minHeight) AND " +
            "(:maxHeight IS NULL OR a.height <= :maxHeight)")
    Page<Asset> searchAssets(@Param("name") String name,
                             @Param("description") String description,
                             @Param("type") AssetType type,
                             @Param("tags") String tags,
                             @Param("isPublic") Boolean isPublic,
                             @Param("fileType") String fileType,
                             @Param("userId") Long userId,
                             @Param("minFileSize") Long minFileSize,
                             @Param("maxFileSize") Long maxFileSize,
                             @Param("minWidth") Integer minWidth,
                             @Param("maxWidth") Integer maxWidth,
                             @Param("minHeight") Integer minHeight,
                             @Param("maxHeight") Integer maxHeight,
                             Pageable pageable);

    @Query("SELECT COUNT(a) FROM Asset a WHERE a.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(a) FROM Asset a WHERE a.type = :type")
    long countByType(@Param("type") AssetType type);

    @Query("SELECT a FROM Asset a WHERE a.isPublic = true ORDER BY a.downloadCount DESC")
    Page<Asset> findPublicAssetsByPopularity(Pageable pageable);

    @Query("SELECT a FROM Asset a WHERE a.user.id = :userId ORDER BY a.usageCount DESC")
    Page<Asset> findUserAssetsByUsage(@Param("userId") Long userId, Pageable pageable);

    boolean existsByFileUrl(String fileUrl);

    void deleteByIdAndUserId(Long id, Long userId);
}