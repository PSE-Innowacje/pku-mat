package pl.pku.mat.repository

import org.springframework.data.jdbc.repository.query.Query
import org.springframework.data.repository.CrudRepository
import pl.pku.mat.entity.BillingPeriodEntity

interface BillingPeriodRepository : CrudRepository<BillingPeriodEntity, Long> {

    fun findByFeeTypeId(feeTypeId: Long): List<BillingPeriodEntity>

    @Query("""
        SELECT * FROM BILLING_PERIODS
        WHERE fee_type_id = :feeTypeId AND year = :year AND month = :month
        ORDER BY sub_period
    """)
    fun findByFeeTypeIdAndYearAndMonth(feeTypeId: Long, year: Int, month: Int): List<BillingPeriodEntity>

    @Query("""
        SELECT * FROM BILLING_PERIODS
        WHERE fee_type_id = :feeTypeId AND year = :year
        ORDER BY month, sub_period
    """)
    fun findByFeeTypeIdAndYear(feeTypeId: Long, year: Int): List<BillingPeriodEntity>
}
