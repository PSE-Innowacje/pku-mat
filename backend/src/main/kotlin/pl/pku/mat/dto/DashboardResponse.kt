package pl.pku.mat.dto

import java.time.LocalDate

data class DashboardResponse(
    val contractorName: String,
    val contractorType: String,
    val year: Int,
    val month: Int,
    val periodDeclarations: List<PeriodDeclarationStatus>
)

data class PeriodDeclarationStatus(
    val billingPeriodId: Long,
    val feeTypeCode: String,
    val feeTypeName: String,
    val subPeriod: Int,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val submissionDeadline: LocalDate,
    val status: String,
    val declarationId: Long?,
    val declarationNumber: String?
)
