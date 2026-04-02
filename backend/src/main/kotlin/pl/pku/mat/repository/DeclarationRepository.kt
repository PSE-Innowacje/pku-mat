package pl.pku.mat.repository

import org.springframework.data.jdbc.repository.query.Query
import org.springframework.data.repository.CrudRepository
import pl.pku.mat.entity.DeclarationEntity

interface DeclarationRepository : CrudRepository<DeclarationEntity, Long> {

    fun findByContractorId(contractorId: Long): List<DeclarationEntity>

    @Query("""
        SELECT * FROM DECLARATIONS
        WHERE contractor_id = :contractorId
          AND billing_period_id = :billingPeriodId
        ORDER BY version DESC
        FETCH FIRST 1 ROWS ONLY
    """)
    fun findLatestByBillingPeriod(contractorId: Long, billingPeriodId: Long): DeclarationEntity?

    @Query("""
        SELECT * FROM DECLARATIONS
        WHERE contractor_id = :contractorId
          AND billing_period_id = :billingPeriodId
        ORDER BY version DESC
    """)
    fun findAllByBillingPeriod(contractorId: Long, billingPeriodId: Long): List<DeclarationEntity>
}
