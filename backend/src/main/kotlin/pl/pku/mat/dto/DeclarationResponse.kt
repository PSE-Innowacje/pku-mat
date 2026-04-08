package pl.pku.mat.dto

import java.math.BigDecimal
import java.time.Instant

data class DeclarationResponse(
    val id: Long,
    val declarationNumber: String,
    val status: String,
    val feeTypeCode: String,
    val feeTypeName: String,
    val contractorName: String,
    val year: Int,
    val month: Int,
    val version: Int,
    val items: Map<String, BigDecimal>,
    val comment: String?,
    val submittedAt: Instant?,
    val createdBy: String,
    val templateVersionName: String? = null
)
