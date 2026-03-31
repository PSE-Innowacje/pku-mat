package pl.pku.mat.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant

@Table("USERS")
data class UserEntity(
    @Id val id: Long? = null,
    val username: String,
    val passwordHash: String,
    val displayName: String,
    val roleId: Long,
    val active: Int = 1,
    val createdAt: Instant? = null
)
