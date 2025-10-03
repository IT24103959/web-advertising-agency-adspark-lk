package com.service.adspark.repository;

import com.service.adspark.model.entity.ExternalUser;
import com.service.adspark.model.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExternalUserRepository extends JpaRepository<ExternalUser, Long> {

    Optional<ExternalUser> findByUsername(String username);

    Optional<ExternalUser> findByEmail(String email);

    @Query("SELECT u FROM ExternalUser u WHERE u.username = :username AND u.password = :password")
    Optional<ExternalUser> findByUsernameAndPassword(@Param("username") String username,
                                                     @Param("password") String password);

    List<ExternalUser> findByStatus(UserStatus status);

    List<ExternalUser> findByBusinessType(String businessType);

    List<ExternalUser> findByIndustry(String industry);

    Optional<ExternalUser> findByCompanyName(String companyName);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByCompanyName(String companyName);

    @Query("SELECT COUNT(u) FROM ExternalUser u WHERE u.status = :status")
    long countByStatus(@Param("status") UserStatus status);

    @Query("SELECT u FROM ExternalUser u WHERE u.accountManagerId = :managerId")
    List<ExternalUser> findByAccountManagerId(@Param("managerId") Long managerId);
}