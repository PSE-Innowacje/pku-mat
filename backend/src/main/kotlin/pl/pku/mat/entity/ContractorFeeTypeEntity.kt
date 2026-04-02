package pl.pku.mat.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table

@Table("CONTRACTOR_FEE_TYPES")
data class ContractorFeeTypeEntity(
    @Id val id: Long? = null,
    val contractorId: Long,
    val feeTypeId: Long
)
