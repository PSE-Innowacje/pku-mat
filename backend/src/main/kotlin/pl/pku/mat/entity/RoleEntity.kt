package pl.pku.mat.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table

@Table("ROLES")
data class RoleEntity(
    @Id val id: Long? = null,
    val name: String
)
