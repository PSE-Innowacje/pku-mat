package pl.pku.mat.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table

@Table("BILLING_PERIOD_TEMPLATES")
data class BillingPeriodTemplateEntity(
    @Id val id: Long? = null,
    val billingPeriodId: Long,
    val contractorTypeId: Long,
    val formTemplateId: Long
)
