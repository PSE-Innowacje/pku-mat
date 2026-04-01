package pl.pku.mat.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDate

@Table("BILLING_PERIODS")
data class BillingPeriodEntity(
    @Id val id: Long? = null,
    val feeTypeId: Long,
    val year: Int,
    val month: Int,
    val subPeriod: Int = 1,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val submissionDeadline: LocalDate
)
