package pl.pku.mat.dto

import java.math.BigDecimal

data class DeclarationSubmitRequest(
    val feeTypeCode: String,
    val billingPeriodId: Long,
    val items: Map<String, BigDecimal>,
    val comment: String? = null
)
