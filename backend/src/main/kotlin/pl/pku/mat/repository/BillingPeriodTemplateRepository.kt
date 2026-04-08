package pl.pku.mat.repository

import org.springframework.data.repository.CrudRepository
import pl.pku.mat.entity.BillingPeriodTemplateEntity

interface BillingPeriodTemplateRepository : CrudRepository<BillingPeriodTemplateEntity, Long> {

    fun findByBillingPeriodIdAndContractorTypeId(billingPeriodId: Long, contractorTypeId: Long): BillingPeriodTemplateEntity?
}
