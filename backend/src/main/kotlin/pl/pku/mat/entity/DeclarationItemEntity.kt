package pl.pku.mat.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.math.BigDecimal

@Table("DECLARATION_ITEMS")
data class DeclarationItemEntity(
    @Id val id: Long? = null,
    val declarationId: Long,
    val fieldCode: String,
    val fieldValue: BigDecimal?
)
