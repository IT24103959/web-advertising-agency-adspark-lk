package com.service.adspark.repository;

import com.service.adspark.model.entity.InternalUser;
import com.service.adspark.model.enums.UserRole;
import com.service.adspark.model.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternalUserRepository extends JpaRepository<InternalUser, Long> {

    Optional<InternalUser> findByUsername(String username);

    Optional<InternalUser> findByEmail(String email);

    Optional<InternalUser> findByEmployeeId(String employeeId);

    @Query("SELECT u FROM InternalUser u WHERE u.username = :username AND u.password = :password")
    Optional<InternalUser> findByUsernameAndPassword(@Param("username") String username,
                                                     @Param("password") String password);

    List<InternalUser> findByRole(UserRole role);

    List<InternalUser> findByStatus(UserStatus status);

    List<InternalUser> findByDepartment(String department);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByEmployeeId(String employeeId);

    @Query("SELECT COUNT(u) FROM InternalUser u WHERE u.role = :role")
    long countByRole(@Param("role") UserRole role);
}