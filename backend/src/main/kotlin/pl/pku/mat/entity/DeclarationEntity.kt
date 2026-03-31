package pl.pku.mat.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant

@Table("DECLARATIONS")
data class DeclarationEntity(
    @Id val id: Long? = null,
    val declarationNumber: String,
    val contractorId: Long,
    val feeTypeId: Long,
    val year: Int,
    val month: Int,
    val subPeriod: Int = 1,
    val version: Int = 1,
    val status: String = "NIE_ZLOZONE",
    val remarks: String? = null,
    val jsonFilePath: String? = null,
    val createdAt: Instant? = null,
    val submittedAt: Instant? = null,
    val createdBy: Long
)
