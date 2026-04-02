package pl.pku.mat.dto

import java.time.LocalDate

data class BillingPeriodResponse(
    val id: Long,
    val feeTypeCode: String,
    val feeTypeName: String,
    val year: Int,
    val month: Int,
    val subPeriod: Int,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val submissionDeadline: LocalDate
)
