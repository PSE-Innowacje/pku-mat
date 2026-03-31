package pl.pku.mat.dto

import java.math.BigDecimal

data class DeclarationSubmitRequest(
    val feeTypeCode: String,
    val year: Int,
    val month: Int,
    val subPeriod: Int = 1,
    val items: Map<String, BigDecimal>,
    val comment: String? = null
)
