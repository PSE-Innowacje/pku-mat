package pl.pku.mat.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table

@Table("FEE_TYPES")
data class FeeTypeEntity(
    @Id val id: Long? = null,
    val code: String,
    val name: String
)
